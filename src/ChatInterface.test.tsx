import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from './ChatInterface';

// Mock streaming service to simulate chunked response
vi.mock('./services/streamingService', () => {
  class MockStreamingService {
    async createChatCompletion(_req: any, opts: any) {
      // Simulate async generator
      async function* gen() {
        const chunks = ['Hel', 'lo'];
        for (const c of chunks) {
          opts?.onMessage?.(c);
          await new Promise(r => setTimeout(r, 5));
          yield { choices: [{ delta: { content: c } }] } as any;
        }
        opts?.onComplete?.({ role: 'assistant', content: 'Hello' });
      }
      return gen();
    }
  }
  return { streamingService: new MockStreamingService() };
});

describe('ChatInterface', () => {
  it('sends a message and streams assistant response', async () => {
    render(<ChatInterface />);

    const textarea = await screen.findByTestId('chat-input');
    fireEvent.change(textarea, { target: { value: 'Hi' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    // User message appears
    const userMessage = await screen.findByTestId('message-user');
    const assistantMessage = await screen.findByTestId('message-assistant');
    expect(userMessage).toBeTruthy();
    expect(assistantMessage).toBeTruthy();

    // Wait for streaming to complete (assistant message content grows)
    await waitFor(() => {
      const contents = screen.getAllByTestId('message-content');
      expect(contents[contents.length - 1].textContent).toContain('Hello');
    });
  });
});
