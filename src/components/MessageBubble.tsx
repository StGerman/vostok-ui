import React from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { MessageBubbleProps } from '../types/chat';
import './markdown-styles.css';

interface CopyButtonProps {
  content: string;
  isDark: boolean;
  onCopy: (content: string) => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content, isDark, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy(content); // Call the callback
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2
        p-1.5 rounded-md
        ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
      `}
      title="Копировать сообщение"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

interface UserAvatarProps {
  isDark: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ isDark }) => (
  <div className={`
    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
    ${isDark ? 'bg-primary-600 text-white' : 'bg-primary-600 text-white'}
  `}>
    U
  </div>
);

interface AssistantAvatarProps {
  isDark: boolean;
}

const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ isDark }) => (
  <div className={`
    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
    ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
  `}>
    AI
  </div>
);

const MessageBubbleComponent: React.FC<MessageBubbleProps & { isDark: boolean }> = ({
  message,
  isLast,
  onCopy,
  isDark,
}) => {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

  return (
    <div
      className={`flex gap-3 group relative ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isLast ? 'animate-slide-up' : ''} ${isDark ? 'dark' : ''}`}
      data-testid={`message-${message.role}`}
      data-role={message.role}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <UserAvatar isDark={isDark} />
        ) : (
          <AssistantAvatar isDark={isDark} />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            relative max-w-[80%] rounded-2xl px-4 py-3 break-words
            ${isUser
              ? 'bg-primary-600 text-white ml-auto'
              : isDark
              ? 'bg-gray-800 text-gray-100'
              : 'bg-gray-100 text-gray-900'
            }
          `}
          data-testid="message-content"
        >
          {/* Copy button */}
          <CopyButton content={message.content} isDark={isDark} onCopy={onCopy} />

          {/* Message text with enhanced markdown support for assistant messages */}
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                // Enhanced code block support
                code({ children, className, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;

                  if (isInline) {
                    return (
                      <code
                        className={`px-1.5 py-0.5 rounded-md font-mono text-sm ${
                          isDark
                            ? 'bg-gray-700 text-yellow-300 border border-gray-600'
                            : 'bg-gray-200 text-red-600 border border-gray-300'
                        } ${className || ''}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative group">
                      <pre className={`mt-3 mb-3 p-4 rounded-lg overflow-x-auto border ${
                        isDark
                          ? 'bg-gray-900 border-gray-700 text-gray-100'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}>
                        <code className={`font-mono text-sm ${className || ''}`} {...props}>
                          {children}
                        </code>
                      </pre>
                      {/* Copy button for code blocks */}
                      <button
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md ${
                          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                        title="Копировать код"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  );
                },

                // Enhanced paragraph support
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                ),

                // Enhanced heading support
                h1: ({ children }) => (
                  <h1 className={`text-2xl font-bold mt-6 mb-4 pb-2 border-b ${
                    isDark ? 'text-gray-100 border-gray-700' : 'text-gray-900 border-gray-300'
                  }`}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className={`text-xl font-semibold mt-5 mb-3 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className={`text-lg font-medium mt-4 mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className={`text-base font-medium mt-3 mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className={`text-sm font-medium mt-2 mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className={`text-sm font-medium mt-2 mb-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {children}
                  </h6>
                ),

                // Enhanced list support with task list handling
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-6 mb-3 space-y-1 marker:text-primary-500">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-6 mb-3 space-y-1 marker:text-primary-500">
                    {children}
                  </ol>
                ),
                li: ({ children, className }) => {
                  // Check if this is a task list item
                  const isTaskList = className?.includes('task-list-item');

                  if (isTaskList) {
                    return (
                      <li className="list-none leading-relaxed flex items-start gap-2">
                        {children}
                      </li>
                    );
                  }

                  return (
                    <li className="leading-relaxed">{children}</li>
                  );
                },

                // Task list checkboxes (GitHub Flavored Markdown)
                input: ({ type, checked, ...props }) => {
                  if (type === 'checkbox') {
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled
                        className={`mr-2 accent-primary-500 ${
                          isDark ? 'text-primary-400' : 'text-primary-600'
                        }`}
                        {...props}
                      />
                    );
                  }
                  return <input type={type} {...props} />;
                },

                // Enhanced blockquote support
                blockquote: ({ children }) => (
                  <blockquote className={`border-l-4 pl-4 py-2 my-4 rounded-r-md ${
                    isDark
                      ? 'border-primary-500 bg-gray-800/50 text-gray-300'
                      : 'border-primary-500 bg-primary-50 text-gray-700'
                  }`}>
                    <div className="italic">{children}</div>
                  </blockquote>
                ),

                // Enhanced link support - opens in new tab
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 underline underline-offset-2 transition-colors ${
                      isDark
                        ? 'text-primary-400 hover:text-primary-300'
                        : 'text-primary-600 hover:text-primary-700'
                    }`}
                    {...props}
                  >
                    {children}
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                ),

                // Image support with proper styling
                img: ({ src, alt, ...props }) => (
                  <div className="my-4">
                    <img
                      src={src}
                      alt={alt || 'Изображение'}
                      className="max-w-full h-auto rounded-lg border shadow-md"
                      loading="lazy"
                      onError={(e) => {
                        // Handle broken images
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                      {...props}
                    />
                    {/* Fallback for broken images */}
                    <div className={`hidden p-4 rounded-lg border-2 border-dashed text-center ${
                      isDark
                        ? 'border-gray-600 bg-gray-800 text-gray-400'
                        : 'border-gray-300 bg-gray-50 text-gray-500'
                    }`}>
                      <div className="text-sm">
                        Изображение недоступно
                        {alt && <div className="text-xs mt-1">({alt})</div>}
                      </div>
                    </div>
                  </div>
                ),

                // Horizontal rule support
                hr: () => (
                  <hr className={`my-6 border-0 h-px ${
                    isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                ),

                // Table support
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className={`w-full border-collapse border ${
                      isDark ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody>{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {children}
                  </tr>
                ),
                td: ({ children }) => (
                  <td className={`px-3 py-2 border-r ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  } last:border-r-0`}>
                    {children}
                  </td>
                ),
                th: ({ children }) => (
                  <th className={`px-3 py-2 text-left font-semibold border-r ${
                    isDark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-800'
                  } last:border-r-0`}>
                    {children}
                  </th>
                ),

                // Emphasis and strong support
                em: ({ children }) => (
                  <em className={isDark ? 'text-primary-400' : 'text-primary-600'}>
                    {children}
                  </em>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),

                // Strikethrough support
                del: ({ children }) => (
                  <del className={`line-through ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {children}
                  </del>
                ),

                // Keyboard shortcut styling
                kbd: ({ children }) => (
                  <kbd className={`px-2 py-1 text-xs font-mono rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 shadow-sm'
                      : 'bg-gray-100 border-gray-300 text-gray-700 shadow-sm'
                  }`}>
                    {children}
                  </kbd>
                ),

                // Abbreviation support
                abbr: ({ children, title }) => (
                  <abbr
                    title={title}
                    className={`border-b border-dotted cursor-help ${
                      isDark ? 'border-gray-500' : 'border-gray-400'
                    }`}
                  >
                    {children}
                  </abbr>
                ),

                // Mark/highlight support
                mark: ({ children }) => (
                  <mark className={`px-1 rounded ${
                    isDark
                      ? 'bg-yellow-600/30 text-yellow-200'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {children}
                  </mark>
                ),

                // Small text support
                small: ({ children }) => (
                  <small className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {children}
                  </small>
                ),

                // Subscript and superscript
                sub: ({ children }) => (
                  <sub className="text-xs">{children}</sub>
                ),
                sup: ({ children }) => (
                  <sup className="text-xs">{children}</sup>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Source Attribution - only for assistant messages with sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className={`mt-3 space-y-2`}>
            {message.sources.map((source, index) => (
              <div
                key={`${source.document_id}-${index}`}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border
                  ${isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <ExternalLink className={`h-4 w-4 flex-shrink-0 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <a
                    href={source.access_url || source.document_url || '#'}
                    className={`
                      text-sm font-medium hover:underline truncate block
                      ${isDark ? 'text-blue-400' : 'text-blue-600'}
                    `}
                    title={source.document_title}
                  >
                    {source.document_title}
                  </a>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {source.page_number && `Page ${source.page_number}`}
                    {source.page_number && source.relevance_score && ' • '}
                    {source.relevance_score && `${Math.round(source.relevance_score * 100)}% relevant`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`
          text-xs mt-1 px-2
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
          ${isUser ? 'text-right' : 'text-left'}
        `}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// Optimized with React.memo to prevent unnecessary re-renders
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.isDark === nextProps.isDark &&
    prevProps.message.sources?.length === nextProps.message.sources?.length
  );
});
