import type {
  VostokChatCompletionRequest,
  VostokChatCompletion,
  VostokChatCompletionChunk,
  ChatMessage
} from '../types/chat';
import type { SourceAttribution } from '../types/sources';

export class StreamingService {
  private abortController: AbortController | null = null;
  private baseURL: string;
  private apiKey: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || 'dummy-key';
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      options?.onError?.(new Error(`Streaming service error: ${errorMessage}`));
      throw error;
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              const completeMessage: ChatMessage = {
                role: 'assistant',
                content: accumulatedContent,
                id: `msg_${Date.now()}_assistant`,
                timestamp: new Date(),
              };
              options?.onComplete?.(completeMessage);
              return;
            }

            try {
              const chunk = JSON.parse(data) as VostokChatCompletionChunk;

              // Accumulate content for callbacks
              const content = chunk.choices[0]?.delta.content;
              if (content) {
                accumulatedContent += content;
                options?.onMessage?.(content);
              }

              yield chunk;
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Streaming failed';
      options?.onError?.(new Error(`Streaming error: ${errorMessage}`));
      throw error;
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
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      throw new Error(`Non-streaming request error: ${errorMessage}`);
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

// Hook for React components
export const useStreamingService = () => {
  return streamingService;
};
