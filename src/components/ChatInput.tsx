import React from 'react';
import { Send, Settings, Loader2 } from 'lucide-react';
import type { ChatInputProps } from '../types/chat';

interface ChatInputWithSettingsProps extends ChatInputProps {
  onSettingsToggle: () => void;
  showSettings: boolean;
  isDark: boolean;
}

export const ChatInput: React.FC<ChatInputWithSettingsProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = "Введите ваше сообщение...",
  disabled = false,
  onSettingsToggle,
  showSettings,
  isDark,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading && !disabled) {
      onSend(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  return (
    <div className={`
      border-t p-4
      ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}
    `}>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Settings Toggle Button */}
        <button
          type="button"
          onClick={onSettingsToggle}
          className={`
            flex-shrink-0 p-3 rounded-lg transition-colors h-12 w-12 flex items-center justify-center
            ${showSettings
              ? 'bg-primary-600 text-white'
              : isDark
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }
          `}
          title="Переключить настройки"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={`
              w-full resize-none rounded-lg px-4 py-3 pr-12 mt-[5px]
              border focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-colors max-h-[200px] min-h-[48px]
              ${isDark
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }
              ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />

          {/* Character count (optional) */}
          {value.length > 500 && (
            <div className={`
              absolute bottom-1 right-14 text-xs
              ${value.length > 1000
                ? 'text-red-500'
                : isDark ? 'text-gray-500' : 'text-gray-400'
              }
            `}>
              {value.length}/2000
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!value.trim() || isLoading || disabled}
          className={`
            flex-shrink-0 p-3 rounded-lg transition-all duration-200 h-12 w-12 flex items-center justify-center
            ${!value.trim() || isLoading || disabled
              ? isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
            }
          `}
          title={isLoading ? 'Отправка...' : 'Отправить сообщение (Enter)'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Input hints */}
      <div className={`
        mt-2 text-xs flex justify-between
        ${isDark ? 'text-gray-500' : 'text-gray-400'}
      `}>
        <span>Нажмите Enter для отправки, Shift+Enter для новой строки</span>
        <span>{isLoading ? 'ИИ думает...' : 'Готов к общению'}</span>
      </div>
    </div>
  );
};
