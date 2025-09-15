import React, { useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Moon, Sun, Settings, Trash2 } from 'lucide-react';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { ChatSettingsPanel } from './components/ChatSettings';
import { TypingIndicator } from './components/TypingIndicator';
import { StreamingLiveRegion, StatusLiveRegion, useLiveRegions } from './components/LiveRegion';
import { useChatStore } from './stores/chatStore';
import { useThemeStore } from './stores/themeStore';
import { streamingService } from './services/streamingService';
import type { ChatMessage, VostokChatCompletionRequest } from './types/chat';

export const ChatInterface: React.FC = () => {
  // Store hooks
  const {
    messages,
    isLoading,
    error,
    settings,
    addMessage,
    updateLastMessage,
    clearMessages,
    setLoading,
    setError,
    updateSettings,
    startNewConversation,
  } = useChatStore();

  const {
    currentTheme,
    toggleTheme,
  } = useThemeStore();

  // Accessibility live regions
  const { announceError, announceStatus, errorStatus, generalStatus } = useLiveRegions();

  // Local state
  const [inputValue, setInputValue] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message handler
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      id: `msg_${Date.now()}_user`,
      timestamp: new Date(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // Prepare streaming request
      const request: VostokChatCompletionRequest = {
        model: settings.model,
        messages: [...messages, userMessage],
        stream: true,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        max_context_chunks: settings.maxContextChunks,
        similarity_threshold: settings.similarityThreshold,
      };

      // Create initial assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        id: `msg_${Date.now()}_assistant`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      // Start streaming and consume generator to activate flow
      const result = await streamingService.createChatCompletion(request, {
        onMessage: (chunk: string) => {
          updateLastMessage(chunk);
          setStreamingContent(chunk);
        },
        onComplete: () => {
          setLoading(false);
          setStreamingContent('');
          announceStatus('Ответ получен');
        },
        onError: (error: Error) => {
          setError(error.message);
          setLoading(false);
          setStreamingContent('');
          announceError(`Ошибка: ${error.message}`);
        },
      });

      if (request.stream && result && (result as any)[Symbol.asyncIterator]) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for await (const _chunk of result as AsyncGenerator<any>) {
            // chunks handled in onMessage
          }
        } catch (streamErr) {
          const msg = streamErr instanceof Error ? streamErr.message : 'Stream interrupted';
          setError(msg);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  }, [messages, settings, isLoading, addMessage, updateLastMessage, setLoading, setError]);

  // Handle copy message
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Could add a toast notification here
    }).catch((error) => {
      console.error('Failed to copy message:', error);
    });
  }, []);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: typeof settings) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  // Handle clear conversation
  const handleClearConversation = useCallback(() => {
    clearMessages();
    startNewConversation();
  }, [clearMessages, startNewConversation]);

  const isDark = currentTheme === 'dark';

  return (
    <div
      className={`flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-200 ${isDark ? 'dark' : ''}`}
      data-testid="chat-interface"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vostok Chat
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearConversation}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Clear conversation"
            data-testid="clear-button"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Settings"
            data-testid="settings-button"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Welcome to Vostok Chat</p>
                  <p className="text-sm">Ask questions about your documents to get started.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  onCopy={handleCopyMessage}
                  isDark={isDark}
                />
              ))
            )}

            {isLoading && (
              <TypingIndicator show={true} isDark={isDark} />
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" data-testid="error-message">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              isLoading={isLoading}
              disabled={isLoading}
              onSettingsToggle={() => setShowSettings(!showSettings)}
              showSettings={showSettings}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700">
            <ChatSettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              isOpen={showSettings}
              onToggle={() => setShowSettings(!showSettings)}
              isDark={isDark}
            />
          </div>
        )}
      </div>

      {/* Accessibility live regions */}
      <StreamingLiveRegion
        isStreaming={isLoading}
        currentContent={streamingContent}
      />
      <StatusLiveRegion
        status={errorStatus}
        level="error"
      />
      <StatusLiveRegion
        status={generalStatus}
        level="info"
      />
    </div>
  );
};

export default ChatInterface;
