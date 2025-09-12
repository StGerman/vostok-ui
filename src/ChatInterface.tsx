import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Plus, Moon, Sun, Download, Trash2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { ChatSettingsPanel } from './components/ChatSettings';
import { TypingIndicator } from './components/TypingIndicator';
import { useChatCompletion, saveConversation, generateConversationTitle } from './services/api';
import type { ChatMessage, ChatSettings } from './types/chat';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
});

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1000,
  temperature: 0.1,
  maxContextChunks: 5,
  similarityThreshold: 0.7,
};

interface ChatInterfaceInternalProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

const ChatInterfaceInternal: React.FC<ChatInterfaceInternalProps> = ({ isDark, onThemeToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatCompletion = useChatCompletion();

  // Generate new conversation ID
  const generateNewConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize conversation
  useEffect(() => {
    setConversationId(generateNewConversationId());
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('chat_settings', JSON.stringify(settings));
  }, [settings]);

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || chatCompletion.isPending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      id: `msg_${Date.now()}_user`,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    chatCompletion.mutate(
      {
        messages: newMessages,
        model: settings.model,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        max_context_chunks: settings.maxContextChunks,
        similarity_threshold: settings.similarityThreshold,
      },
      {
        onSuccess: (response) => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.choices[0].message.content,
            id: `msg_${Date.now()}_assistant`,
            timestamp: new Date(),
          };

          const finalMessages = [...newMessages, assistantMessage];
          setMessages(finalMessages);

          // Save conversation
          const title = messages.length === 0 ? generateConversationTitle(content) : undefined;
          saveConversation(conversationId, finalMessages, title);
        },
        onError: (error) => {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `Извините, произошла ошибка: ${error.message}. Пожалуйста, попробуйте еще раз.`,
            id: `msg_${Date.now()}_error`,
            timestamp: new Date(),
          };

          setMessages([...newMessages, errorMessage]);
        },
      }
    );
  }, [messages, settings, conversationId, chatCompletion]);

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, []);

  // Clear conversation
  const handleClearConversation = useCallback(() => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
      setConversationId(generateNewConversationId());
    }
  }, []);

  // Export conversation
  const handleExportConversation = useCallback(() => {
    const data = {
      id: conversationId,
      timestamp: new Date().toISOString(),
      messages,
      settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [conversationId, messages, settings]);

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className={`
        flex items-center justify-between px-6 py-4 border-b
        ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}
      `}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Востоk RAG Чат
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              На базе Claude Sonnet 4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Button */}
          {messages.length > 0 && (
            <button
              onClick={handleExportConversation}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Экспорт беседы"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* Clear Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className={`
                p-2 rounded-lg transition-colors
                ${isDark
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                }
              `}
              title="Очистить беседу"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={handleClearConversation}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Новый чат
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
            title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className={`
        flex-1 overflow-y-auto scrollbar-thin px-6 py-4
        ${isDark ? 'bg-gray-900' : 'bg-gray-50'}
      `}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Добро пожаловать в Востоk RAG Чат
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Задавайте любые вопросы о ваших документах. Я найду информацию в вашей базе знаний и предоставлю контекстуальные ответы с использованием передовых RAG технологий.
              </p>
              <div className={`
                mt-6 p-4 rounded-lg text-left
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Попробуйте спросить:
                </h3>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• "Какая информация у вас есть о цементных продуктах?"</li>
                  <li>• "Можете объяснить технические характеристики?"</li>
                  <li>• "Какие доступны категории продуктов?"</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isLast={index === messages.length - 1}
                onCopy={handleCopyMessage}
                isDark={isDark}
              />
            ))}

            {chatCompletion.isPending && (
              <TypingIndicator show={true} isDark={isDark} />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <ChatSettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={showSettings}
        onToggle={() => setShowSettings(!showSettings)}
        isDark={isDark}
      />

      {/* Chat Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isLoading={chatCompletion.isPending}
        placeholder="Ask me about your documents..."
        onSettingsToggle={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        isDark={isDark}
      />
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChatInterfaceInternal isDark={isDark} onThemeToggle={toggleTheme} />
    </QueryClientProvider>
  );
};

export default ChatInterface;
