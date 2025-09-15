import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ConversationMeta
} from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Chat completion API call
export const chatCompletionRequest = async (
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Custom hooks for API integration
export const useChatCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatCompletionRequest,
    onSuccess: () => {
      // Invalidate and refetch any related queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for client errors (4xx)
      if (failureCount >= 3) return false;
      const httpError = error as any;
      return !httpError.message?.includes('HTTP 4');
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Local storage utilities for conversation persistence
export const saveConversation = (id: string, messages: ChatMessage[], title?: string) => {
  const conversation = {
    id,
    title: title || `Разговор ${new Date().toLocaleDateString('ru-RU')}`,
    messages,
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
  };

  localStorage.setItem(`conversation_${id}`, JSON.stringify(conversation));

  // Update conversations index
  const conversationsIndex = getConversationsIndex();
  const existingIndex = conversationsIndex.findIndex(c => c.id === id);

  const meta: ConversationMeta = {
    id,
    title: conversation.title,
    timestamp: new Date(conversation.timestamp),
    messageCount: conversation.messageCount,
  };

  if (existingIndex >= 0) {
    conversationsIndex[existingIndex] = meta;
  } else {
    conversationsIndex.unshift(meta);
  }

  localStorage.setItem('conversations_index', JSON.stringify(conversationsIndex));
};

export const loadConversation = (id: string) => {
  const stored = localStorage.getItem(`conversation_${id}`);
  if (!stored) return null;

  try {
    const conversation = JSON.parse(stored);
    return {
      ...conversation,
      timestamp: new Date(conversation.timestamp),
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
      })),
    };
  } catch {
    return null;
  }
};

export const getConversationsIndex = (): ConversationMeta[] => {
  const stored = localStorage.getItem('conversations_index');
  if (!stored) return [];

  try {
    const index = JSON.parse(stored);
    return index.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
};

export const deleteConversation = (id: string) => {
  localStorage.removeItem(`conversation_${id}`);

  const conversationsIndex = getConversationsIndex();
  const filteredIndex = conversationsIndex.filter(c => c.id !== id);
  localStorage.setItem('conversations_index', JSON.stringify(filteredIndex));
};

// Settings persistence
export const saveSettings = (settings: any) => {
  localStorage.setItem('chat_settings', JSON.stringify(settings));
};

export const loadSettings = () => {
  const stored = localStorage.getItem('chat_settings');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Utility function to generate conversation title from first message
export const generateConversationTitle = (firstMessage: string): string => {
  const words = firstMessage.trim().split(' ');
  const title = words.slice(0, 6).join(' ');
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};
