import React from 'react';
import { ChevronUp, RotateCcw } from 'lucide-react';
import type { ChatSettings, ChatSettingsProps } from '../types/chat';

export const ChatSettingsPanel: React.FC<ChatSettingsProps & { isDark: boolean }> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
  isDark,
}) => {
  const handleSettingChange = (key: keyof ChatSettings, value: number | string) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      model: 'claude-sonnet-4-20250514',
      maxTokens: 1000,
      temperature: 0.1,
      maxContextChunks: 5,
      similarityThreshold: 0.7,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`
      border-t p-4 space-y-4 animate-slide-up
      ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
    `}>
      <div className="flex items-center justify-between">
        <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
          Настройки чата
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className={`
              p-1.5 rounded-md transition-colors text-xs flex items-center gap-1
              ${isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Сбросить к умолчанию"
          >
            <RotateCcw className="w-3 h-3" />
            Сброс
          </button>
          <button
            onClick={onToggle}
            className={`
              p-1.5 rounded-md transition-colors
              ${isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Модель
          </label>
          <select
            value={settings.model}
            onChange={(e) => handleSettingChange('model', e.target.value)}
            className={`
              w-full px-3 py-2 rounded-md border text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${isDark
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
              }
            `}
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-haiku-3-20240307">Claude Haiku 3</option>
            <option value="claude-opus-3-20240229">Claude Opus 3</option>
          </select>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Макс. токенов: {settings.maxTokens}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">100</span>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={settings.maxTokens}
              onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 slider"
            />
            <span className="text-xs text-gray-500">4000</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Температура: {settings.temperature}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">0.0</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 slider"
            />
            <span className="text-xs text-gray-500">2.0</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Более высокие значения делают вывод более случайным, низкие - более сфокусированным
          </p>
        </div>

        {/* Max Context Chunks */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Макс. блоков контекста: {settings.maxContextChunks}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">1</span>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.maxContextChunks}
              onChange={(e) => handleSettingChange('maxContextChunks', parseInt(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 slider"
            />
            <span className="text-xs text-gray-500">10</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Количество блоков документов для получения контекста
          </p>
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-2 md:col-span-2">
          <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Порог схожести: {settings.similarityThreshold}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">0.0</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.similarityThreshold}
              onChange={(e) => handleSettingChange('similarityThreshold', parseFloat(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 slider"
            />
            <span className="text-xs text-gray-500">1.0</span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Минимальная оценка схожести для включения блоков документов
          </p>
        </div>
      </div>

      {/* Usage Tips */}
      <div className={`
        p-3 rounded-lg text-xs
        ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'}
      `}>
        <h4 className="font-medium mb-1">Советы:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Низкая температура (0.1-0.3) для фактических, последовательных ответов</li>
          <li>Высокая температура (0.7-1.0) для творческих, разнообразных ответов</li>
          <li>Больше блоков контекста предоставляют более богатую информацию, но используют больше токенов</li>
          <li>Высокий порог схожести отфильтровывает менее релевантный контекст</li>
        </ul>
      </div>
    </div>
  );
};
