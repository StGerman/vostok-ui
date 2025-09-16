/**
 * Streaming Service Type Definitions
 *
 * Comprehensive TypeScript interfaces for streaming chat completions.
 * These types enforce strict type safety and replace any 'any' type usage.
 */

import type { SourceAttribution } from './sources';

/**
 * OpenAI-compatible chat completion request interface
 */
export interface CompletionRequest {
  /** The model ID to use for completion */
  model: string;

  /** Array of conversation messages */
  messages: ChatMessage[];

  /** Whether to stream the response */
  stream?: boolean;

  /** Sampling temperature (0-2) */
  temperature?: number;

  /** Maximum tokens to generate */
  max_tokens?: number;

  /** Maximum number of context chunks for RAG */
  max_context_chunks?: number;

  /** Similarity threshold for RAG context retrieval */
  similarity_threshold?: number;

  /** Presence penalty (-2 to 2) */
  presence_penalty?: number;

  /** Frequency penalty (-2 to 2) */
  frequency_penalty?: number;

  /** Array of up to 4 sequences where generation will stop */
  stop?: string | string[];

  /** User identifier for abuse monitoring */
  user?: string;
}

/**
 * Individual message in a conversation
 */
export interface ChatMessage {
  /** Message role */
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';

  /** Message content */
  content: string;

  /** Optional message name/identifier */
  name?: string;

  /** Optional function call (for function role messages) */
  function_call?: {
    name: string;
    arguments: string;
  };

  /** Optional tool calls (for assistant messages) */
  tool_calls?: ToolCall[];
}

/**
 * Tool call definition
 */
export interface ToolCall {
  /** Unique identifier for the tool call */
  id: string;

  /** Type of tool call */
  type: 'function';

  /** Function details */
  function: {
    /** Name of the function to call */
    name: string;

    /** JSON string of function arguments */
    arguments: string;
  };
}

/**
 * Streaming completion chunk interface
 */
export interface CompletionChunk {
  /** Unique identifier for the completion */
  id: string;

  /** Object type (always 'chat.completion.chunk' for streaming) */
  object: 'chat.completion.chunk';

  /** Unix timestamp of creation */
  created: number;

  /** Model used for completion */
  model: string;

  /** Array of choice deltas */
  choices: StreamChoice[];

  /** Optional source attributions for RAG responses */
  sources?: SourceAttribution[];

  /** Usage statistics (present in final chunk) */
  usage?: CompletionUsage;
}

/**
 * Individual choice in a streaming response
 */
export interface StreamChoice {
  /** Index of this choice */
  index: number;

  /** Delta containing incremental updates */
  delta: MessageDelta;

  /** Reason completion finished (null if still streaming) */
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call' | null;

  /** Log probabilities (if requested) */
  logprobs?: LogProbs | null;
}

/**
 * Incremental message updates in streaming
 */
export interface MessageDelta {
  /** Role (only present in first chunk) */
  role?: 'assistant' | 'system' | 'user' | 'function' | 'tool';

  /** Incremental content */
  content?: string;

  /** Function call delta (if applicable) */
  function_call?: {
    name?: string;
    arguments?: string;
  };

  /** Tool calls delta (if applicable) */
  tool_calls?: ToolCallDelta[];
}

/**
 * Tool call delta for streaming
 */
export interface ToolCallDelta {
  /** Index of the tool call */
  index: number;

  /** Tool call ID (if present) */
  id?: string;

  /** Type of tool call */
  type?: 'function';

  /** Function delta */
  function?: {
    name?: string;
    arguments?: string;
  };
}

/**
 * Log probabilities information
 */
export interface LogProbs {
  /** Content log probabilities */
  content: TokenLogProb[] | null;
}

/**
 * Log probability for a specific token
 */
export interface TokenLogProb {
  /** The token */
  token: string;

  /** Log probability of the token */
  logprob: number;

  /** UTF-8 bytes of the token */
  bytes: number[] | null;

  /** Top alternative tokens and their log probabilities */
  top_logprobs: TopLogProb[];
}

/**
 * Top alternative token with log probability
 */
export interface TopLogProb {
  /** The token */
  token: string;

  /** Log probability */
  logprob: number;

  /** UTF-8 bytes */
  bytes: number[] | null;
}

/**
 * Completion usage statistics
 */
export interface CompletionUsage {
  /** Number of tokens in the prompt */
  prompt_tokens: number;

  /** Number of tokens in the completion */
  completion_tokens: number;

  /** Total tokens used */
  total_tokens: number;
}

/**
 * Non-streaming completion response
 */
export interface CompletionResponse {
  /** Unique identifier for the completion */
  id: string;

  /** Object type */
  object: 'chat.completion';

  /** Unix timestamp of creation */
  created: number;

  /** Model used */
  model: string;

  /** Array of completion choices */
  choices: CompletionChoice[];

  /** Usage statistics */
  usage: CompletionUsage;

  /** Optional source attributions */
  sources?: SourceAttribution[];
}

/**
 * Individual choice in non-streaming response
 */
export interface CompletionChoice {
  /** Index of this choice */
  index: number;

  /** Complete message */
  message: ChatMessage;

  /** Reason completion finished */
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'function_call';

  /** Log probabilities */
  logprobs?: LogProbs | null;
}

/**
 * Async iterator interface for streaming responses
 */
export interface StreamingResponse {
  [Symbol.asyncIterator](): AsyncIterator<CompletionChunk>;
}

/**
 * Configuration for streaming service
 */
export interface StreamingConfig {
  /** API base URL */
  baseURL: string;

  /** API key for authentication */
  apiKey: string;

  /** Default model to use */
  defaultModel?: string;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Maximum retry attempts */
  maxRetries?: number;

  /** Custom headers to include */
  headers?: Record<string, string>;
}

/**
 * Streaming service callback options
 */
export interface StreamingCallbacks {
  /** Called with each content chunk */
  onMessage?: (content: string) => void;

  /** Called with source attributions */
  onSourceAttribution?: (sources: SourceAttribution[]) => void;

  /** Called when streaming completes */
  onComplete?: (message: ChatMessage) => void;

  /** Called on error */
  onError?: (error: Error) => void;

  /** Called when streaming starts */
  onStart?: () => void;

  /** Called with each raw chunk */
  onChunk?: (chunk: CompletionChunk) => void;

  /** Called with usage statistics */
  onUsage?: (usage: CompletionUsage) => void;
}

/**
 * Request options for streaming service
 */
export interface StreamingRequestOptions {
  /** Abort signal for request cancellation */
  signal?: AbortSignal;

  /** Custom headers for this request */
  headers?: Record<string, string>;

  /** Timeout override for this request */
  timeout?: number;

  /** Whether to retry on failure */
  retry?: boolean;

  /** Custom retry configuration */
  retryOptions?: {
    maxRetries: number;
    backoffMs: number;
    exponential?: boolean;
  };
}

/**
 * Streaming service interface
 */
export interface IStreamingService {
  /**
   * Create a chat completion (streaming or non-streaming)
   */
  createChatCompletion(
    request: CompletionRequest,
    callbacks?: StreamingCallbacks,
    options?: StreamingRequestOptions
  ): Promise<CompletionResponse | StreamingResponse>;

  /**
   * Abort the current request
   */
  abort(): void;

  /**
   * Check if a request is currently active
   */
  isActive(): boolean;

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<StreamingConfig>): void;
}

/**
 * Streaming error with additional context
 */
export class StreamingError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly response?: Response;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    response?: Response,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StreamingError';
    this.code = code;
    this.statusCode = statusCode;
    this.response = response;
    this.context = context;
  }
}

/**
 * Type guards for streaming types
 */
export const StreamingTypeGuards = {
  isCompletionChunk: (obj: unknown): obj is CompletionChunk => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'object' in obj &&
      (obj as CompletionChunk).object === 'chat.completion.chunk'
    );
  },

  isCompletionResponse: (obj: unknown): obj is CompletionResponse => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'object' in obj &&
      (obj as CompletionResponse).object === 'chat.completion'
    );
  },

  isMessageDelta: (obj: unknown): obj is MessageDelta => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      ('role' in obj || 'content' in obj || 'function_call' in obj || 'tool_calls' in obj)
    );
  },

  isStreamingResponse: (obj: unknown): obj is StreamingResponse => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      Symbol.asyncIterator in obj
    );
  }
};

/**
 * Utility types for advanced streaming scenarios
 */
export type StreamingEventType = 'start' | 'chunk' | 'message' | 'sources' | 'usage' | 'complete' | 'error' | 'abort';

export interface StreamingEvent {
  type: StreamingEventType;
  data?: CompletionChunk | string | SourceAttribution[] | CompletionUsage | Error;
  timestamp: number;
}

export type StreamingEventListener = (event: StreamingEvent) => void;

/**
 * Advanced streaming service with event system
 */
export interface IAdvancedStreamingService extends IStreamingService {
  /** Add event listener */
  addEventListener(type: StreamingEventType, listener: StreamingEventListener): void;

  /** Remove event listener */
  removeEventListener(type: StreamingEventType, listener: StreamingEventListener): void;

  /** Get current request status */
  getStatus(): 'idle' | 'connecting' | 'streaming' | 'completed' | 'error' | 'aborted';

  /** Get streaming statistics */
  getStats(): {
    tokensReceived: number;
    chunksProcessed: number;
    duration: number;
    averageChunkSize: number;
  };
}
