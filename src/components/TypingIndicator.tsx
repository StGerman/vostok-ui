import React from 'react';

interface TypingIndicatorProps {
  show: boolean;
  isDark: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ show, isDark }) => {
  if (!show) return null;

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Assistant Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
        ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
      `}>
        AI
      </div>

      {/* Typing Animation */}
      <div className={`
        rounded-2xl px-4 py-3 max-w-[80%]
        ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}
      `}>
        <div className="flex items-center gap-1">
          <div className={`
            w-2 h-2 rounded-full animate-pulse
            ${isDark ? 'bg-gray-500' : 'bg-gray-400'}
          `} style={{ animationDelay: '0ms' }} />
          <div className={`
            w-2 h-2 rounded-full animate-pulse
            ${isDark ? 'bg-gray-500' : 'bg-gray-400'}
          `} style={{ animationDelay: '150ms' }} />
          <div className={`
            w-2 h-2 rounded-full animate-pulse
            ${isDark ? 'bg-gray-500' : 'bg-gray-400'}
          `} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

interface TokenUsageDisplayProps {
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
  responseTime?: number;
  isDark: boolean;
}

export const TokenUsageDisplay: React.FC<TokenUsageDisplayProps> = ({
  usage,
  responseTime,
  isDark
}) => {
  if (!usage) return null;

  return (
    <div className={`
      px-4 py-2 text-xs border-t flex items-center justify-between
      ${isDark
        ? 'border-gray-700 bg-gray-800 text-gray-400'
        : 'border-gray-200 bg-gray-50 text-gray-500'
      }
    `}>
      <div className="flex items-center gap-4">
        <span>
          Токены: {usage.prompt_tokens} + {usage.completion_tokens} = {usage.total_tokens}
        </span>
        {responseTime && (
          <span>
            Ответ: {responseTime < 1000 ? `${responseTime}мс` : `${(responseTime / 1000).toFixed(1)}с`}
          </span>
        )}
      </div>

      {/* Estimated cost (rough estimate for Claude) */}
      <div className="text-right">
        <span className="text-xs opacity-75">
          ~${((usage.prompt_tokens * 0.015 + usage.completion_tokens * 0.075) / 1000).toFixed(4)}
        </span>
      </div>
    </div>
  );
};
