import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';
import type { ChatMessage } from '../types/chat';

// Helper to access store outside React
const getState = () => useChatStore.getState();
const setState = (partial: any) => useChatStore.setState(partial);

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store
    setState({
      messages: [],
      isLoading: false,
      error: null,
      tokenUsage: null,
      responseTime: null,
    });
  });

  it('adds a message', () => {
    const msg: ChatMessage = { role: 'user', content: 'Hello', id: 'm1' };
    getState().addMessage(msg);
    expect(getState().messages).toHaveLength(1);
    expect(getState().messages[0].content).toBe('Hello');
  });

  it('updates last assistant message when streaming chunks arrive', () => {
    const assistant: ChatMessage = { role: 'assistant', content: '', id: 'a1' };
    getState().addMessage(assistant);
    getState().updateLastMessage('Hel');
    getState().updateLastMessage('lo');
    expect(getState().messages[0].content).toBe('Hello');
  });

  it('clears messages and related state', () => {
    getState().addMessage({ role: 'user', content: 'X', id: '1' });
    getState().setError('Err');
    getState().clearMessages();
    expect(getState().messages).toHaveLength(0);
    expect(getState().error).toBeNull();
  });

  it('updates settings partially', () => {
    const oldModel = getState().settings.model;
    getState().updateSettings({ temperature: 0.5 });
    expect(getState().settings.temperature).toBe(0.5);
    expect(getState().settings.model).toBe(oldModel);
  });
});
