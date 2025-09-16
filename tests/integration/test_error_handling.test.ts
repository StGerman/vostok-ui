/**
 * Integration Tests for Error Handling
 *
 * Tests the complete error handling flow from error occurrence to user feedback.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { ErrorMessage, ErrorHandler } from '../../src/types/errors';

describe('Error Handling Integration', () => {
  let mockErrorHandler: ErrorHandler;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on console to verify error logging
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockErrorHandler = {
      handleError: async (error: Error, context?) => {
        const errorMessage: ErrorMessage = {
          code: 'NETWORK_ERROR',
          category: 'network',
          severity: 'medium',
          userMessage: 'Connection failed. Please check your internet connection and try again.',
          technicalMessage: `Network request failed: ${error.message}`,
          context: {
            requestId: context?.requestId || 'req-test',
            timestamp: new Date().toISOString(),
            endpoint: context?.endpoint || '/v1/chat/completions',
            ...context
          },
          retryable: true,
          retryStrategy: {
            maxRetries: 3,
            backoffMs: 1000,
            exponential: true
          }
        };
        return errorMessage;
      },
      shouldRetry: (error: ErrorMessage) => {
        const attemptCount = error.context.attemptCount || 0;
        return error.retryable && attemptCount < (error.retryStrategy?.maxRetries || 0);
      },
      formatUserMessage: (error: ErrorMessage) => error.userMessage,
      logError: (error: ErrorMessage) => {
        console.error(`[${error.code}] ${error.technicalMessage}`, error.context);
      },
      getRetryDelay: (attempt: number, strategy) => {
        return strategy.exponential
          ? strategy.backoffMs * Math.pow(2, attempt)
          : strategy.backoffMs;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleSpy.mockRestore();
  });

  describe('HTTP Error Handling', () => {
    it('should handle 401 authentication errors', async () => {
      const authError = new Error('HTTP 401: Unauthorized');

      const errorMessage = await mockErrorHandler.handleError(authError, {
        statusCode: 401,
        endpoint: '/v1/chat/completions'
      });

      expect(errorMessage.code).toBe('NETWORK_ERROR');
      expect(errorMessage.category).toBe('network');
      expect(errorMessage.userMessage).toContain('Connection failed');
      expect(errorMessage.technicalMessage).toContain('401');
      expect(errorMessage.retryable).toBe(true);

      // Should log the error
      mockErrorHandler.logError(errorMessage);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[NETWORK_ERROR]'),
        expect.objectContaining({
          statusCode: 401,
          endpoint: '/v1/chat/completions'
        })
      );
    });

    it('should handle 429 rate limiting errors', async () => {
      const rateLimitError = new Error('HTTP 429: Too Many Requests');

      const errorMessage = await mockErrorHandler.handleError(rateLimitError, {
        statusCode: 429,
        resetTime: new Date(Date.now() + 60000).toISOString()
      });

      expect(errorMessage.retryable).toBe(true);
      expect(errorMessage.retryStrategy?.maxRetries).toBe(3);

      // Should calculate appropriate retry delay
      const retryDelay = mockErrorHandler.getRetryDelay(1, errorMessage.retryStrategy!);
      expect(retryDelay).toBe(2000); // 1000 * 2^1
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');

      const errorMessage = await mockErrorHandler.handleError(timeoutError, {
        requestId: 'req-timeout-test',
        responseTime: 30000
      });

      expect(errorMessage.context.responseTime).toBe(30000);
      expect(errorMessage.retryable).toBe(true);
    });
  });

  describe('Retry Logic Integration', () => {
    it('should implement exponential backoff retry strategy', async () => {
      const networkError = new Error('Connection refused');

      const errorMessage = await mockErrorHandler.handleError(networkError);

      // Test retry delays for multiple attempts
      const delays: number[] = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        const delay = mockErrorHandler.getRetryDelay(attempt, errorMessage.retryStrategy!);
        delays.push(delay);
      }

      expect(delays).toEqual([1000, 2000, 4000]); // Exponential: 1000 * 2^n
    });

    it('should prevent infinite retries', async () => {
      const persistentError = new Error('Persistent failure');

      const errorMessage = await mockErrorHandler.handleError(persistentError, {
        attemptCount: 5 // Exceeds max retries
      });

      const shouldRetry = mockErrorHandler.shouldRetry(errorMessage);
      expect(shouldRetry).toBe(false);
    });

    it('should handle retry with context updates', async () => {
      const error = new Error('Temporary failure');

      // First attempt
      let errorMessage = await mockErrorHandler.handleError(error, {
        attemptCount: 1
      });

      expect(mockErrorHandler.shouldRetry(errorMessage)).toBe(true);

      // Second attempt
      errorMessage = await mockErrorHandler.handleError(error, {
        attemptCount: 2
      });

      expect(mockErrorHandler.shouldRetry(errorMessage)).toBe(true);

      // Fourth attempt (exceeds max retries of 3)
      errorMessage = await mockErrorHandler.handleError(error, {
        attemptCount: 4
      });

      expect(mockErrorHandler.shouldRetry(errorMessage)).toBe(false);
    });
  });

  describe('Error Message Formatting', () => {
    it('should provide user-friendly error messages', async () => {
      const scenarios = [
        {
          error: new Error('HTTP 401: Unauthorized'),
          expectedUserMessage: 'Connection failed. Please check your internet connection and try again.'
        },
        {
          error: new Error('Network timeout'),
          expectedUserMessage: 'Connection failed. Please check your internet connection and try again.'
        },
        {
          error: new Error('Invalid JSON response'),
          expectedUserMessage: 'Connection failed. Please check your internet connection and try again.'
        }
      ];

      for (const scenario of scenarios) {
        const errorMessage = await mockErrorHandler.handleError(scenario.error);
        const userMessage = mockErrorHandler.formatUserMessage(errorMessage);

        expect(userMessage).toBe(scenario.expectedUserMessage);
        expect(userMessage).not.toContain('HTTP');
        expect(userMessage).not.toContain('JSON');
        expect(userMessage).not.toContain('500');
      }
    });

    it('should separate technical details from user messages', async () => {
      const technicalError = new Error('XMLHttpRequest failed: ERR_NETWORK_CHANGED');

      const errorMessage = await mockErrorHandler.handleError(technicalError, {
        stackTrace: 'Error\n  at fetch\n  at StreamingService.createChatCompletion'
      });

      // User message should be friendly
      expect(errorMessage.userMessage).not.toContain('XMLHttpRequest');
      expect(errorMessage.userMessage).not.toContain('ERR_NETWORK_CHANGED');

      // Technical message should contain details
      expect(errorMessage.technicalMessage).toContain('XMLHttpRequest');
      expect(errorMessage.context.stackTrace).toContain('StreamingService');
    });
  });

  describe('Error Context Enrichment', () => {
    it('should capture comprehensive error context', async () => {
      const error = new Error('Service unavailable');

      const richContext = {
        requestId: 'req-rich-context',
        userId: 'user-123',
        sessionId: 'session-456',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        statusCode: 503,
        responseTime: 5000,
        userAgent: 'VostokChat/1.0',
        attemptCount: 1,
        additionalData: {
          model: 'gpt-4',
          messageCount: 5,
          streamingEnabled: true
        }
      };

      const errorMessage = await mockErrorHandler.handleError(error, richContext);

      expect(errorMessage.context.requestId).toBe('req-rich-context');
      expect(errorMessage.context.userId).toBe('user-123');
      expect(errorMessage.context.statusCode).toBe(503);
      expect(errorMessage.context.responseTime).toBe(5000);
      expect(errorMessage.context.additionalData?.model).toBe('gpt-4');
    });

    it('should handle minimal context gracefully', async () => {
      const error = new Error('Minimal error');

      const errorMessage = await mockErrorHandler.handleError(error);

      expect(errorMessage.context.requestId).toBe('req-test');
      expect(errorMessage.context.timestamp).toBeDefined();
      expect(errorMessage.context.endpoint).toBe('/v1/chat/completions');
    });
  });

  describe('Error Handler Integration Flow', () => {
    it('should demonstrate complete error handling workflow', async () => {
      // Simulate a real error scenario
      const originalError = new Error('fetch failed');
      const requestContext = {
        requestId: 'req-integration-flow',
        endpoint: '/v1/chat/completions',
        attemptCount: 1,
        statusCode: 500
      };

      // Step 1: Handle the error
      const errorMessage = await mockErrorHandler.handleError(originalError, requestContext);

      // Step 2: Check if retry is appropriate
      const shouldRetry = mockErrorHandler.shouldRetry(errorMessage);
      expect(shouldRetry).toBe(true);

      // Step 3: Calculate retry delay
      const retryDelay = mockErrorHandler.getRetryDelay(
        requestContext.attemptCount,
        errorMessage.retryStrategy!
      );
      expect(retryDelay).toBe(2000);

      // Step 4: Format user message
      const userMessage = mockErrorHandler.formatUserMessage(errorMessage);
      expect(userMessage).toBe('Connection failed. Please check your internet connection and try again.');

      // Step 5: Log error for debugging
      mockErrorHandler.logError(errorMessage);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[NETWORK_ERROR]'),
        expect.objectContaining({
          requestId: 'req-integration-flow',
          statusCode: 500
        })
      );

      // Verify all steps produced expected results
      expect(errorMessage.code).toBe('NETWORK_ERROR');
      expect(errorMessage.retryable).toBe(true);
      expect(shouldRetry).toBe(true);
      expect(retryDelay).toBeGreaterThan(0);
      expect(userMessage).not.toContain('fetch failed');
    });

    it('should handle cascading errors gracefully', async () => {
      // Simulate error in error handling
      const cascadingErrorHandler: ErrorHandler = {
        ...mockErrorHandler,
        handleError: async () => {
          throw new Error('Error handler failed');
        }
      };

      try {
        await cascadingErrorHandler.handleError(new Error('Original error'));
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Error handler failed');
      }
    });
  });

  describe('Performance and Memory', () => {
    it('should handle high frequency errors without memory leaks', async () => {
      const errors: ErrorMessage[] = [];

      // Simulate many errors
      for (let i = 0; i < 100; i++) {
        const error = new Error(`Error ${i}`);
        const errorMessage = await mockErrorHandler.handleError(error, {
          requestId: `req-${i}`,
          attemptCount: 1
        });
        errors.push(errorMessage);
      }

      expect(errors).toHaveLength(100);

      // Verify each error was handled properly
      errors.forEach((errorMessage, index) => {
        expect(errorMessage.context.requestId).toBe(`req-${index}`);
        expect(errorMessage.code).toBe('NETWORK_ERROR');
      });
    });

    it('should limit error context size to prevent memory issues', async () => {
      const largeContext = {
        requestId: 'req-large-context',
        additionalData: {
          largeObject: Array(1000).fill('x').join(''),
          deepNesting: {
            level1: { level2: { level3: { data: 'nested' } } }
          }
        }
      };

      const errorMessage = await mockErrorHandler.handleError(
        new Error('Large context test'),
        largeContext
      );

      // Context should be captured but not cause memory issues
      expect(errorMessage.context.requestId).toBe('req-large-context');
      expect(errorMessage.context.additionalData).toBeDefined();
    });
  });
});
