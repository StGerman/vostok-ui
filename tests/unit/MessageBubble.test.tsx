import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '../../src/components/MessageBubble';
import type { ChatMessage } from '../../src/types/chat';

// Mock the copy to clipboard functionality
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('MessageBubble Component', () => {
  const mockMessage: ChatMessage = {
    role: 'assistant',
    content: 'This is a test message with **bold** text and `code`.',
    id: 'msg_123',
    timestamp: new Date('2025-01-15T10:30:00'),
    sources: [
      {
        document_id: 'doc_1',
        document_title: 'Test Document.pdf',
        relevance_score: 0.95,
        content_snippet: 'This is a relevant snippet from the document...',
        page_number: 3,
      },
    ],
  };

  const mockProps = {
    message: mockMessage,
    isLast: true,
    onCopy: vi.fn(),
    isDark: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render message content', () => {
    render(<MessageBubble {...mockProps} />);

    expect(screen.getByText(/This is a test message/)).toBeInTheDocument();
  });

  it('should render markdown content correctly', () => {
    render(<MessageBubble {...mockProps} />);

    // Check for bold text
    expect(screen.getByText('bold')).toBeInTheDocument();

    // Check for code text
    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('should display timestamp when provided', () => {
    render(<MessageBubble {...mockProps} />);

    // Should show formatted time
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('should show copy button on hover', async () => {
    const user = userEvent.setup();
    render(<MessageBubble {...mockProps} />);

    const messageContainer = screen.getByTestId('message-assistant');

    // Hover over the message
    await user.hover(messageContainer);

    // Copy button should become visible
    const copyButton = screen.getByTitle(/Копировать сообщение/);
    expect(copyButton).toBeInTheDocument();
  });

  it('should handle copy functionality', async () => {
    const user = userEvent.setup();
    render(<MessageBubble {...mockProps} />);

    const messageContainer = screen.getByTestId('message-assistant');
    await user.hover(messageContainer);

    const copyButton = screen.getByTitle(/Копировать сообщение/);
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockMessage.content);
    expect(mockProps.onCopy).toHaveBeenCalledWith(mockMessage.content);
  });

  it('should display source attributions', () => {
    render(<MessageBubble {...mockProps} />);

    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Page 3/)).toBeInTheDocument();
    expect(screen.getByText(/95%/)).toBeInTheDocument();
  });

  it('should handle messages without sources', () => {
    const messageWithoutSources = {
      ...mockMessage,
      sources: undefined,
    };

    render(<MessageBubble {...mockProps} message={messageWithoutSources} />);

    expect(screen.getByText(/This is a test message/)).toBeInTheDocument();
    expect(screen.queryByText('Sources:')).not.toBeInTheDocument();
  });

  it('should apply dark mode styling', () => {
    render(<MessageBubble {...mockProps} isDark={true} />);

    const messageContainer = screen.getByTestId('message-assistant');
    expect(messageContainer).toHaveClass('dark'); // Assuming dark mode adds this class
  });

  it('should handle user messages differently from assistant messages', () => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: 'This is a user message',
      id: 'msg_user_123',
      timestamp: new Date(),
    };

    render(<MessageBubble {...mockProps} message={userMessage} />);

    const messageContainer = screen.getByTestId('message-user');
    expect(messageContainer).toBeInTheDocument();
    expect(screen.getByText('This is a user message')).toBeInTheDocument();
  });

  it('should handle long content with proper formatting', () => {
    const longMessage = {
      ...mockMessage,
      content: 'This is a very long message '.repeat(50),
    };

    render(<MessageBubble {...mockProps} message={longMessage} />);

    expect(screen.getByText(/This is a very long message/)).toBeInTheDocument();
  });

  it('should handle empty or minimal content', () => {
    const emptyMessage = {
      ...mockMessage,
      content: '',
    };

    render(<MessageBubble {...mockProps} message={emptyMessage} />);

    // Should still render the message container
    expect(screen.getByTestId('message-assistant')).toBeInTheDocument();
  });

  it('should handle source links correctly', async () => {
    const user = userEvent.setup();
    render(<MessageBubble {...mockProps} />);

    const sourceLink = screen.getByText('Test Document.pdf');
    expect(sourceLink.closest('a')).toHaveAttribute('href');
  });
});
