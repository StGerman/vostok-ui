// API Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  timestamp?: Date;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string; // Default: 'claude-sonnet-4-20250514'
  max_tokens?: number; // Default: 1000, Range: 1-4000
  temperature?: number; // Default: 0.1, Range: 0.0-2.0
  max_context_chunks?: number; // Default: 5, Range: 1-10
  similarity_threshold?: number; // Default: 0.7, Range: 0.0-1.0
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  model: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// UI State Types
export interface ChatSettings {
  model: string;
  maxTokens: number;
  temperature: number;
  maxContextChunks: number;
  similarityThreshold: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ConversationMeta {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

// Component Props
export interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  onCopy: (content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface ChatSettingsProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface TypingIndicatorProps {
  show: boolean;
}

export interface TokenUsageDisplayProps {
  usage: TokenUsage | null;
  responseTime?: number;
}

// Default values
export const DEFAULT_SETTINGS: ChatSettings = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1000,
  temperature: 0.1,
  maxContextChunks: 5,
  similarityThreshold: 0.7,
};

export const API_ENDPOINTS = {
  CHAT_COMPLETIONS: '/v1/chat/completions',
} as const;

export const MESSAGE_ROLES = {
  USER: 'user' as const,
  ASSISTANT: 'assistant' as const,
  SYSTEM: 'system' as const,
} as const;
