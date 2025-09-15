import { test, expect } from '@playwright/test';

test.describe('Complete Conversation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full conversation flow from question to response with sources', async ({ page }) => {
    // Wait for the chat interface to load
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Type a question in the chat input
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('What are the main features of this project?');

    // Send the message
    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();

    // Verify user message appears
    await expect(page.locator('[data-testid="message-user"]')).toContainText('What are the main features');

    // Wait for typing indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

    // Wait for AI response (this will timeout until we implement streaming)
    // TODO: Implement streaming response handling
    // await expect(page.locator('[data-testid="message-assistant"]')).toBeVisible({ timeout: 30000 });

    // Verify source attributions appear (if available)
    // TODO: Implement source attribution display
    // await expect(page.locator('[data-testid="source-attribution"]')).toBeVisible();

    // Test copy functionality
    // TODO: Implement copy button testing
    // const copyButton = page.locator('[data-testid="copy-button"]').first();
    // await copyButton.click();
    // await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
  });

  test('should handle conversation context in follow-up questions', async ({ page }) => {
    // First message
    await page.locator('[data-testid="chat-input"]').fill('Tell me about React components');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for response (mocked for now)
    await page.waitForTimeout(1000);

    // Follow-up question that relies on context
    await page.locator('[data-testid="chat-input"]').fill('Can you give me an example?');
    await page.locator('[data-testid="send-button"]').click();

    // Verify both messages are in conversation history
    const messages = page.locator('[data-testid^="message-"]');
    await expect(messages).toHaveCount(4); // 2 user messages + 2 assistant responses
  });

  test('should handle empty or invalid input gracefully', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    // Try to send empty message
    await sendButton.click();

    // Verify no message was sent
    const messages = page.locator('[data-testid^="message-"]');
    await expect(messages).toHaveCount(0);

    // Try whitespace-only message
    await chatInput.fill('   ');
    await sendButton.click();

    // Verify still no messages
    await expect(messages).toHaveCount(0);
  });

  test('should support mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify mobile layout elements
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();

    // Test mobile input behavior
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Mobile test message');

    // Verify input adapts to mobile
    const inputRect = await chatInput.boundingBox();
    expect(inputRect?.width).toBeLessThan(400); // Should fit mobile screen
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/v1/chat/completions', route => {
      route.abort('failed');
    });

    // Try to send a message
    await page.locator('[data-testid="chat-input"]').fill('Test message');
    await page.locator('[data-testid="send-button"]').click();

    // Verify error handling
    // TODO: Implement error message display
    // await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    // await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should support cancelling ongoing requests', async ({ page }) => {
    // Start a long request
    await page.locator('[data-testid="chat-input"]').fill('Generate a very long response');
    await page.locator('[data-testid="send-button"]').click();

    // Wait for streaming to start
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

    // Cancel the request
    // TODO: Implement cancel functionality
    // const cancelButton = page.locator('[data-testid="cancel-button"]');
    // await cancelButton.click();

    // Verify request was cancelled
    // TODO: Verify cancellation behavior
    // await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
  });
});
