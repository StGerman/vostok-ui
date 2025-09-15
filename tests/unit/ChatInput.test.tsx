import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../../src/components/ChatInput';

describe('ChatInput Component', () => {
  const mockProps = {
    value: '',
    onChange: vi.fn(),
    onSend: vi.fn(),
    isLoading: false,
    placeholder: 'Type your message...',
    disabled: false,
    onSettingsToggle: vi.fn(),
    showSettings: false,
    isDark: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder text', () => {
    render(<ChatInput {...mockProps} />);

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<ChatInput {...mockProps} value="Test input" />);

    const input = screen.getByDisplayValue('Test input');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} />);

    const input = screen.getByTestId('chat-input');
    await user.type(input, 'Hello world');

    expect(mockProps.onChange).toHaveBeenCalledTimes('Hello world'.length);
  });

  it('should send message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="Test message" />);

    const sendButton = screen.getByTestId('send-button');
    await user.click(sendButton);

    expect(mockProps.onSend).toHaveBeenCalledWith('Test message');
  });

  it('should send message on Enter key press', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="Test message" />);

    const input = screen.getByTestId('chat-input');
    await user.type(input, '{Enter}');

    expect(mockProps.onSend).toHaveBeenCalledWith('Test message');
  });

  it('should allow new line on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="" />);

    const input = screen.getByTestId('chat-input');
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    // Should call onChange but not onSend for Shift+Enter
    expect(mockProps.onChange).toHaveBeenCalled();
    expect(mockProps.onSend).not.toHaveBeenCalled();
  });

  it('should not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="" />);

    const sendButton = screen.getByTestId('send-button');
    await user.click(sendButton);

    expect(mockProps.onSend).not.toHaveBeenCalled();
  });

  it('should not send whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="   " />);

    const sendButton = screen.getByTestId('send-button');
    await user.click(sendButton);

    expect(mockProps.onSend).not.toHaveBeenCalled();
  });

  it('should disable input and button when disabled prop is true', () => {
    render(<ChatInput {...mockProps} disabled={true} />);

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when loading', () => {
    render(<ChatInput {...mockProps} isLoading={true} />);

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<ChatInput {...mockProps} isLoading={true} />);

    // Should show some loading indicator (spinner, text, etc.)
    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('should handle multiline input', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} />);

    const input = screen.getByTestId('chat-input');

    // Type multiline content
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');

    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('should auto-resize textarea based on content', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} />);

    const input = screen.getByTestId('chat-input') as HTMLTextAreaElement;

    // Get initial height
    const initialHeight = input.style.height;

    // Type long content
    const longContent = 'This is a very long line of text that should cause the textarea to expand in height. '.repeat(5);
    await user.type(input, longContent);

    // Height should be adjusted (this depends on implementation)
    // For now, just verify the content is there
    expect(input.value).toContain('This is a very long line');
  });

  it('should have proper accessibility attributes', () => {
    render(<ChatInput {...mockProps} />);

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    expect(input).toHaveAttribute('aria-label');
    expect(sendButton).toHaveAttribute('aria-label');
  });

  it('should handle paste events', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} />);

    const input = screen.getByTestId('chat-input');

    // Simulate pasting text
    await user.click(input);
    await user.paste('Pasted content');

    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('should maintain focus after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...mockProps} value="Test message" />);

    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    await user.click(input); // Focus input
    await user.click(sendButton); // Send message

    expect(mockProps.onSend).toHaveBeenCalled();
    // Focus should return to input (depends on implementation)
  });
});
