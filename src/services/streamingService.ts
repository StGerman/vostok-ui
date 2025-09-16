import type {
  VostokChatCompletionRequest,
  VostokChatCompletion,
  VostokChatCompletionChunk,
  ChatMessage
} from '../types/chat';
import type { SourceAttribution } from '../types/sources';
import type {
  ErrorMessage,
  ErrorHandler,
  RetryStrategy,
  ErrorContext
} from '../types/errors';

/**
 * Server-Sent Event structure following OpenAI streaming format
 */
interface ServerSentEvent {
  event: string | null;
  data: string;
  raw: string[];
}

/**
 * Enhanced streaming iterator for robust SSE parsing
 */
class VostokStreamIterator {
  private consumed = false;
  private done = false;
  private response: Response;
  private controller: AbortController;
  private errorHandler: ErrorHandler;

  constructor(response: Response, controller: AbortController, errorHandler: ErrorHandler) {
    this.response = response;
    this.controller = controller;
    this.errorHandler = errorHandler;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<VostokChatCompletionChunk, void, unknown> {
    if (this.consumed) {
      throw new Error('Cannot iterate over a consumed stream. Create a new request.');
    }
    this.consumed = true;

    try {
      for await (const sse of this.iterSSEMessages()) {
        if (this.done) continue;

        if (sse.data.startsWith('[DONE]')) {
          this.done = true;
          continue;
        }

        let data: VostokChatCompletionChunk;
        try {
          data = JSON.parse(sse.data);
        } catch (error) {
          const parseError = error instanceof Error ? error : new Error('Parse error');
          const errorMessage = await this.errorHandler.handleError(parseError, {
            requestId: `parse_${Date.now()}`,
            timestamp: new Date().toISOString(),
            endpoint: 'streaming_parse',
            additionalData: { rawData: sse.data, rawEvent: sse.raw }
          });
          this.errorHandler.logError(errorMessage);
          throw parseError;
        }

        // Handle API errors in the response
        if (data && typeof data === 'object' && 'error' in data) {
          const errorData = data as { error: unknown };
          const apiError = new Error(`API Error: ${String(errorData.error)}`);
          throw apiError;
        }

        yield data;
      }
    } catch (error) {
      // Handle abort gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      // Cleanup if stream wasn't fully consumed
      if (!this.done) {
        this.controller.abort();
      }
    }
  }

  private async *iterSSEMessages(): AsyncGenerator<ServerSentEvent, void, unknown> {
    if (!this.response.body) {
      this.controller.abort();
      throw new Error('Response has no body for streaming');
    }

    const reader = this.response.body.getReader();
    const decoder = new TextDecoder();
    const sseDecoder = new SSEDecoder();

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const sse = sseDecoder.decode(line);
          if (sse) yield sse;
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const sse = sseDecoder.decode(buffer);
        if (sse) yield sse;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * SSE Decoder based on OpenAI's implementation
 */
class SSEDecoder {
  private data: string[] = [];
  private event: string | null = null;
  private chunks: string[] = [];

  decode(line: string): ServerSentEvent | null {
    // Remove carriage return if present
    if (line.endsWith('\r')) {
      line = line.substring(0, line.length - 1);
    }

    // Empty line indicates end of event
    if (!line) {
      if (!this.event && !this.data.length) return null;

      const sse: ServerSentEvent = {
        event: this.event,
        data: this.data.join('\n'),
        raw: this.chunks,
      };

      // Reset state
      this.event = null;
      this.data = [];
      this.chunks = [];

      return sse;
    }

    this.chunks.push(line);

    // Skip comments
    if (line.startsWith(':')) {
      return null;
    }

    // Parse field
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      return null;
    }

    let fieldname = line.substring(0, colonIndex);
    let value = line.substring(colonIndex + 1);

    // Remove leading space from value
    if (value.startsWith(' ')) {
      value = value.substring(1);
    }

    if (fieldname === 'event') {
      this.event = value;
    } else if (fieldname === 'data') {
      this.data.push(value);
    }

    return null;
  }
}

export class StreamingService {
  private abortController: AbortController | null = null;
  private baseURL: string;
  private apiKey: string;
  private errorHandler: ErrorHandler;
  private retryStrategy: RetryStrategy;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || 'dummy-key';
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // Default error handler
    this.errorHandler = {
      handleError: async (error: Error, context?: Partial<ErrorContext>): Promise<ErrorMessage> => ({
        code: 'STREAM_FAILURE',
        category: 'network',
        severity: 'high',
        userMessage: 'An error occurred while streaming the response. Please try again.',
        technicalMessage: error.message,
        context: {
          requestId: context?.requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          endpoint: context?.endpoint,
          statusCode: context?.statusCode,
          userAgent: context?.userAgent,
          attemptCount: context?.attemptCount || 0,
          stackTrace: error.stack,
          ...context
        },
        retryable: true,
        retryStrategy: null
      }),
      shouldRetry: (error: ErrorMessage): boolean => {
        return (error.context.attemptCount || 0) < 3;
      },
      formatUserMessage: (error: ErrorMessage): string => {
        return error.userMessage;
      },
      logError: (error: ErrorMessage): void => {
        console.error(`[StreamingService] ${error.code}: ${error.technicalMessage}`, error);
      },
      getRetryDelay: (attempt: number, strategy: RetryStrategy): number => {
        const baseDelay = strategy.backoffMs;
        const delay = strategy.exponential ? baseDelay * Math.pow(2, attempt) : baseDelay;
        const maxDelay = strategy.maxBackoffMs || 30000;
        const finalDelay = Math.min(delay, maxDelay);

        if (strategy.jitter) {
          const jitterMs = finalDelay * 0.1; // 10% jitter
          return finalDelay + (Math.random() * jitterMs - jitterMs / 2);
        }

        return finalDelay;
      }
    };

    // Default retry strategy
    this.retryStrategy = {
      maxRetries: 3,
      backoffMs: 1000,
      exponential: true,
      jitter: true,
      maxBackoffMs: 10000,
      retryConditions: [
        {
          errorCodes: ['FETCH_ERROR', 'TIMEOUT', 'NETWORK_ERROR'],
          statusCodes: [429, 500, 502, 503, 504]
        }
      ]
    };
  }

  /**
   * Handle errors using the configured error handler
   */
  private async handleStreamingError(error: Error, context?: Partial<ErrorContext>): Promise<ErrorMessage> {
    return this.errorHandler.handleError(error, context);
  }

  /**
   * Create a resilient streaming request with retry capabilities
   */
  async createResilientStream(
    request: VostokChatCompletionRequest,
    options?: {
      onMessage?: (content: string) => void;
      onSourceAttribution?: (sources: SourceAttribution[]) => void;
      onComplete?: (message: ChatMessage) => void;
      onError?: (error: Error) => void;
      onRetry?: (attempt: number, error: Error) => void;
    }
  ): Promise<AsyncGenerator<VostokChatCompletionChunk>> {
    let attempt = 0;

    while (attempt <= this.retryStrategy.maxRetries) {
      try {
        return this.handleStreamingResponse(request, options);
      } catch (error) {
        const streamError = error instanceof Error ? error : new Error('Unknown streaming error');

        if (attempt >= this.retryStrategy.maxRetries) {
          throw streamError;
        }

        // Check if error is retryable
        const errorMessage = await this.handleStreamingError(streamError, {
          endpoint: `${this.baseURL}/v1/chat/completions`,
          attemptCount: attempt,
          userAgent: navigator.userAgent
        });

        if (!this.errorHandler.shouldRetry(errorMessage)) {
          throw streamError;
        }

        // Calculate delay and notify about retry
        const delay = this.errorHandler.getRetryDelay(attempt, this.retryStrategy);
        options?.onRetry?.(attempt, streamError);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));

        attempt++;

        // Reset abort controller for retry
        this.abortController = new AbortController();
      }
    }

    throw new Error('Maximum retry attempts exceeded');
  }

  /**
   * Create a stream that can be split into multiple independent streams
   */
  tee<T>(
    generator: AsyncGenerator<T>
  ): [AsyncGenerator<T>, AsyncGenerator<T>] {
    const buffer: T[] = [];
    const waiters: Array<{ resolve: (value: IteratorResult<T>) => void }> = [];
    let done = false;
    let error: Error | null = null;

    // Start consuming the original generator
    (async () => {
      try {
        for await (const value of generator) {
          buffer.push(value);
          // Notify all waiters
          waiters.forEach(waiter => {
            waiter.resolve({ value, done: false });
          });
          waiters.length = 0;
        }
        done = true;
        waiters.forEach(waiter => {
          waiter.resolve({ value: undefined!, done: true });
        });
      } catch (err) {
        error = err instanceof Error ? err : new Error('Generator error');
        waiters.forEach(waiter => {
          waiter.resolve({ value: undefined!, done: true });
        });
      }
    })();

    const createTeeIterator = (_index: number): AsyncGenerator<T> => {
      let position = 0;

      return {
        async next(): Promise<IteratorResult<T>> {
          if (error) throw error;

          if (position < buffer.length) {
            return { value: buffer[position++], done: false };
          }

          if (done) {
            return { value: undefined!, done: true };
          }

          // Wait for new data
          return new Promise(resolve => {
            waiters.push({ resolve });
          });
        },

        [Symbol.asyncIterator]() {
          return this;
        }
      } as AsyncGenerator<T>;
    };

    return [createTeeIterator(0), createTeeIterator(1)];
  }

  async createChatCompletion(
    request: VostokChatCompletionRequest,
    options?: {
      onMessage?: (content: string) => void;
      onSourceAttribution?: (sources: SourceAttribution[]) => void;
      onComplete?: (message: ChatMessage) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<VostokChatCompletion | AsyncGenerator<VostokChatCompletionChunk>> {
    try {
      // Create new abort controller for this request
      this.abortController = new AbortController();

      if (request.stream) {
        return this.handleStreamingResponse(request, options);
      } else {
        return this.handleNonStreamingResponse(request);
      }
    } catch (error) {
      const streamError = error instanceof Error ? error : new Error('Unknown error occurred');
      const errorMessage = await this.handleStreamingError(streamError, {
        endpoint: `${this.baseURL}/v1/chat/completions`,
        userAgent: navigator.userAgent
      });
      this.errorHandler.logError(errorMessage);
      options?.onError?.(streamError);
      throw streamError;
    }
  }

  private async *handleStreamingResponse(
    request: VostokChatCompletionRequest,
    options?: {
      onMessage?: (content: string) => void;
      onSourceAttribution?: (sources: SourceAttribution[]) => void;
      onComplete?: (message: ChatMessage) => void;
      onError?: (error: Error) => void;
    }
  ): AsyncGenerator<VostokChatCompletionChunk> {
    let accumulatedContent = '';

    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        const errorMessage = await this.handleStreamingError(
          new Error(`HTTP error! status: ${response.status}`),
          {
            endpoint: `${this.baseURL}/v1/chat/completions`,
            statusCode: response.status,
            userAgent: navigator.userAgent
          }
        );
        this.errorHandler.logError(errorMessage);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Use enhanced streaming iterator
      const streamIterator = new VostokStreamIterator(response, this.abortController!, this.errorHandler);

      for await (const chunk of streamIterator) {
        // Accumulate content for callbacks
        const content = chunk.choices[0]?.delta.content;
        if (content) {
          accumulatedContent += content;
          options?.onMessage?.(content);
        }

        // Handle source attribution if present
        if ('sources' in chunk && chunk.sources) {
          options?.onSourceAttribution?.(chunk.sources as SourceAttribution[]);
        }

        yield chunk;
      }

      // Complete the conversation
      const completeMessage: ChatMessage = {
        role: 'assistant',
        content: accumulatedContent,
        id: `msg_${Date.now()}_assistant`,
        timestamp: new Date(),
      };
      options?.onComplete?.(completeMessage);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const streamError = error instanceof Error ? error : new Error('Streaming failed');
      const errorMessage = await this.handleStreamingError(streamError, {
        endpoint: `${this.baseURL}/v1/chat/completions`,
        userAgent: navigator.userAgent
      });
      this.errorHandler.logError(errorMessage);
      options?.onError?.(streamError);
      throw streamError;
    }
  }

  private async handleNonStreamingResponse(
    request: VostokChatCompletionRequest
  ): Promise<VostokChatCompletion> {
    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ ...request, stream: false }),
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as VostokChatCompletion;
      return data;
    } catch (error) {
      const streamError = error instanceof Error ? error : new Error('Request failed');
      const errorMessage = await this.handleStreamingError(streamError, {
        endpoint: `${this.baseURL}/v1/chat/completions`,
        userAgent: navigator.userAgent
      });
      this.errorHandler.logError(errorMessage);
      throw new Error(`Non-streaming request error: ${streamError.message}`);
    }
  }

  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  isRequestActive(): boolean {
    return this.abortController !== null && !this.abortController.signal.aborted;
  }
}

// Default service instance
export const streamingService = new StreamingService();

/**
 * Hook for React components to use streaming service
 */
export const useStreamingService = () => {
  const service = streamingService;

  // Enhanced streaming with automatic cleanup on component unmount
  const createStream = async (
    request: VostokChatCompletionRequest,
    options?: {
      onMessage?: (content: string) => void;
      onSourceAttribution?: (sources: SourceAttribution[]) => void;
      onComplete?: (message: ChatMessage) => void;
      onError?: (error: Error) => void;
      onRetry?: (attempt: number, error: Error) => void;
      resilient?: boolean;
    }
  ) => {
    if (options?.resilient) {
      return service.createResilientStream(request, options);
    } else {
      return service.createChatCompletion(request, options);
    }
  };

  const cancelRequest = () => service.cancelRequest();
  const isActive = () => service.isRequestActive();

  // Cleanup function for React components
  const cleanup = (): void => {
    service.cancelRequest();
  };

  return {
    createStream,
    cancelRequest,
    isActive,
    cleanup,
    service // Raw service access if needed
  };
};
