import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatMessage, ChatSettings, VostokTokenUsage } from '../types/chat';

interface ChatState {
  // Current conversation state
  messages: ChatMessage[];
  conversationId: string;
  isLoading: boolean;
  error: string | null;

  // Settings
  settings: ChatSettings;

  // Usage tracking
  tokenUsage: VostokTokenUsage | null;
  responseTime: number | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  setTokenUsage: (usage: VostokTokenUsage) => void;
  setResponseTime: (time: number) => void;
  startNewConversation: () => void;
}

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1000,
  temperature: 0.1,
  maxContextChunks: 5,
  similarityThreshold: 0.7,
};

const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      // Initial state
      messages: [],
      conversationId: generateConversationId(),
      isLoading: false,
      error: null,
      settings: DEFAULT_SETTINGS,
      tokenUsage: null,
      responseTime: null,

      // Actions
      addMessage: (message: ChatMessage) => {
        set(
          (state) => ({
            messages: [...state.messages, message],
            error: null, // Clear any previous errors when adding new message
          }),
          false,
          'addMessage'
        );
      },

      updateLastMessage: (content: string) => {
        set(
          (state) => {
            const messages = [...state.messages];
            const lastMessage = messages[messages.length - 1];

            if (lastMessage && lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content,
              };
            }

            return { messages };
          },
          false,
          'updateLastMessage'
        );
      },

      clearMessages: () => {
        set(
          {
            messages: [],
            error: null,
            tokenUsage: null,
            responseTime: null,
          },
          false,
          'clearMessages'
        );
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'setLoading');
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false }, false, 'setError');
      },

      updateSettings: (newSettings: Partial<ChatSettings>) => {
        set(
          (state) => ({
            settings: { ...state.settings, ...newSettings },
          }),
          false,
          'updateSettings'
        );
      },

      setTokenUsage: (usage: VostokTokenUsage) => {
        set({ tokenUsage: usage }, false, 'setTokenUsage');
      },

      setResponseTime: (time: number) => {
        set({ responseTime: time }, false, 'setResponseTime');
      },

      startNewConversation: () => {
        set(
          {
            messages: [],
            conversationId: generateConversationId(),
            error: null,
            tokenUsage: null,
            responseTime: null,
          },
          false,
          'startNewConversation'
        );
      },
    }),
    {
      name: 'chat-store',
    }
  )
);
