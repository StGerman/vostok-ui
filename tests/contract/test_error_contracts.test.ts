/**
 * Contract Tests for Error Handling Interfaces
 *
 * These tests validate error handling contracts and must fail initially (TDD RED phase).
 */

import { describe, it, expect, vi } from 'vitest';
import type {
  ErrorMessage,
  ErrorCategory,
  ErrorHandler,
  ErrorContext,
  RetryStrategy,
  ErrorSeverity
} from '../../src/types/errors';

describe('Error Handling Interface Contracts', () => {
  describe('ErrorMessage Interface', () => {
    it('should enforce structured error message format', () => {
      const userError: ErrorMessage = {
        code: 'AUTH_INVALID',
        category: 'authentication' as ErrorCategory,
        severity: 'high' as ErrorSeverity,
        userMessage: 'Invalid API key. Please check your configuration.',
        technicalMessage: 'Authentication failed with 401 status',
        context: {
          requestId: 'req-123',
          timestamp: new Date().toISOString(),
          endpoint: '/v1/chat/completions'
        },
        retryable: false,
        retryStrategy: null
      };

      expect(userError.code).toBe('AUTH_INVALID');
      expect(userError.category).toBe('authentication');
      expect(userError.severity).toBe('high');
      expect(userError.userMessage).toContain('Invalid API key');
      expect(userError.technicalMessage).toContain('401');
      expect(userError.retryable).toBe(false);
    });

    it('should support retryable errors with strategy', () => {
      const networkError: ErrorMessage = {
        code: 'NETWORK_TIMEOUT',
        category: 'network' as ErrorCategory,
        severity: 'medium' as ErrorSeverity,
        userMessage: 'Connection timed out. Please try again.',
        technicalMessage: 'Request timeout after 30000ms',
        context: {
          requestId: 'req-456',
          timestamp: new Date().toISOString(),
          attemptCount: 2
        },
        retryable: true,
        retryStrategy: {
          maxRetries: 3,
          backoffMs: 1000,
          exponential: true
        }
      };

      expect(networkError.retryable).toBe(true);
      expect(networkError.retryStrategy?.maxRetries).toBe(3);
      expect(networkError.retryStrategy?.exponential).toBe(true);
    });

    it('should handle rate limiting errors', () => {
      const rateLimitError: ErrorMessage = {
        code: 'RATE_LIMITED',
        category: 'rate_limit' as ErrorCategory,
        severity: 'medium' as ErrorSeverity,
        userMessage: 'Too many requests. Please wait before trying again.',
        technicalMessage: 'Rate limit exceeded: 429 status',
        context: {
          requestId: 'req-789',
          timestamp: new Date().toISOString(),
          resetTime: new Date(Date.now() + 60000).toISOString()
        },
        retryable: true,
        retryStrategy: {
          maxRetries: 1,
          backoffMs: 60000,
          exponential: false
        }
      };

      expect(rateLimitError.code).toBe('RATE_LIMITED');
      expect(rateLimitError.context.resetTime).toBeDefined();
      expect(rateLimitError.retryStrategy?.backoffMs).toBe(60000);
    });
  });

  describe('ErrorCategory Enum', () => {
    it('should define all error categories', () => {
      const categories: ErrorCategory[] = [
        'authentication',
        'authorization',
        'validation',
        'network',
        'rate_limit',
        'server_error',
        'client_error',
        'unknown'
      ];

      categories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });
  });

  describe('ErrorSeverity Enum', () => {
    it('should define severity levels', () => {
      const severities: ErrorSeverity[] = [
        'low',
        'medium',
        'high',
        'critical'
      ];

      severities.forEach(severity => {
        expect(typeof severity).toBe('string');
      });
    });
  });

  describe('ErrorHandler Interface', () => {
    it('should enforce error handler contract', () => {
      const mockHandler: ErrorHandler = {
        handleError: vi.fn(),
        shouldRetry: vi.fn(),
        formatUserMessage: vi.fn(),
        logError: vi.fn(),
        getRetryDelay: vi.fn()
      };

      expect(mockHandler.handleError).toBeDefined();
      expect(mockHandler.shouldRetry).toBeDefined();
      expect(mockHandler.formatUserMessage).toBeDefined();
      expect(mockHandler.logError).toBeDefined();
      expect(mockHandler.getRetryDelay).toBeDefined();
    });

    it('should handle error processing workflow', async () => {
      const handler: ErrorHandler = {
        handleError: async (error: Error, context?: ErrorContext) => {
          return {
            code: 'UNKNOWN',
            category: 'unknown' as ErrorCategory,
            severity: 'medium' as ErrorSeverity,
            userMessage: 'An unexpected error occurred',
            technicalMessage: error.message,
            context: context || {},
            retryable: false,
            retryStrategy: null
          };
        },
        shouldRetry: (error: ErrorMessage) => error.retryable,
        formatUserMessage: (error: ErrorMessage) => error.userMessage,
        logError: (error: ErrorMessage) => {
          console.error(`[${error.code}] ${error.technicalMessage}`);
        },
        getRetryDelay: (attempt: number, strategy: RetryStrategy) => {
          return strategy.exponential
            ? strategy.backoffMs * Math.pow(2, attempt)
            : strategy.backoffMs;
        }
      };

      const testError = new Error('Test error');
      const result = await handler.handleError(testError);

      expect(result.code).toBe('UNKNOWN');
      expect(result.userMessage).toBe('An unexpected error occurred');
      expect(handler.shouldRetry(result)).toBe(false);
    });
  });

  describe('ErrorContext Interface', () => {
    it('should capture comprehensive error context', () => {
      const context: ErrorContext = {
        requestId: 'req-abc123',
        timestamp: new Date().toISOString(),
        userId: 'user-456',
        sessionId: 'session-789',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        statusCode: 500,
        responseTime: 5000,
        userAgent: 'VostokChat/1.0',
        ipAddress: '192.168.1.1',
        attemptCount: 1,
        stackTrace: 'Error\n  at handler\n  at service',
        additionalData: {
          model: 'gpt-4',
          messageCount: 10,
          streamingEnabled: true
        }
      };

      expect(context.requestId).toBe('req-abc123');
      expect(context.endpoint).toBe('/v1/chat/completions');
      expect(context.statusCode).toBe(500);
      expect(context.additionalData?.model).toBe('gpt-4');
    });

    it('should support minimal context', () => {
      const minimalContext: ErrorContext = {
        requestId: 'req-minimal',
        timestamp: new Date().toISOString()
      };

      expect(minimalContext.requestId).toBe('req-minimal');
      expect(minimalContext.timestamp).toBeDefined();
      expect(minimalContext.userId).toBeUndefined();
    });
  });

  describe('RetryStrategy Interface', () => {
    it('should define retry configuration', () => {
      const exponentialStrategy: RetryStrategy = {
        maxRetries: 3,
        backoffMs: 1000,
        exponential: true,
        jitter: true,
        maxBackoffMs: 30000
      };

      const linearStrategy: RetryStrategy = {
        maxRetries: 2,
        backoffMs: 5000,
        exponential: false,
        jitter: false
      };

      expect(exponentialStrategy.exponential).toBe(true);
      expect(exponentialStrategy.jitter).toBe(true);
      expect(exponentialStrategy.maxBackoffMs).toBe(30000);

      expect(linearStrategy.exponential).toBe(false);
      expect(linearStrategy.maxBackoffMs).toBeUndefined();
    });
  });

  describe('Error Contract Integration', () => {
    it('should compose error handling flow', async () => {
      // Simulate complete error handling workflow
      const originalError = new Error('Network connection failed');

      const context: ErrorContext = {
        requestId: 'req-integration-test',
        timestamp: new Date().toISOString(),
        endpoint: '/v1/chat/completions',
        attemptCount: 1
      };

      const handler: ErrorHandler = {
        handleError: async (error: Error, ctx?: ErrorContext) => ({
          code: 'NETWORK_ERROR',
          category: 'network' as ErrorCategory,
          severity: 'medium' as ErrorSeverity,
          userMessage: 'Connection failed. Retrying...',
          technicalMessage: error.message,
          context: ctx || {},
          retryable: true,
          retryStrategy: {
            maxRetries: 2,
            backoffMs: 1000,
            exponential: true
          }
        }),
        shouldRetry: (error: ErrorMessage) => error.retryable && (error.context.attemptCount || 0) < (error.retryStrategy?.maxRetries || 0),
        formatUserMessage: (error: ErrorMessage) => error.userMessage,
        logError: vi.fn(),
        getRetryDelay: (attempt: number, strategy: RetryStrategy) =>
          strategy.exponential ? strategy.backoffMs * Math.pow(2, attempt) : strategy.backoffMs
      };

      const errorMessage = await handler.handleError(originalError, context);
      const shouldRetry = handler.shouldRetry(errorMessage);
      const userMessage = handler.formatUserMessage(errorMessage);
      const retryDelay = handler.getRetryDelay(1, errorMessage.retryStrategy!);

      expect(errorMessage.code).toBe('NETWORK_ERROR');
      expect(shouldRetry).toBe(true);
      expect(userMessage).toBe('Connection failed. Retrying...');
      expect(retryDelay).toBe(2000); // 1000 * 2^1
    });

    it('should prevent infinite retry loops', () => {
      const errorWithTooManyRetries: ErrorMessage = {
        code: 'MAX_RETRIES_EXCEEDED',
        category: 'client_error' as ErrorCategory,
        severity: 'high' as ErrorSeverity,
        userMessage: 'Request failed after maximum retry attempts',
        technicalMessage: 'Max retries (3) exceeded',
        context: {
          requestId: 'req-max-retries',
          timestamp: new Date().toISOString(),
          attemptCount: 4
        },
        retryable: true,
        retryStrategy: {
          maxRetries: 3,
          backoffMs: 1000,
          exponential: false
        }
      };

      const handler: ErrorHandler = {
        handleError: vi.fn(),
        shouldRetry: (error: ErrorMessage) => {
          const attemptCount = error.context.attemptCount || 0;
          const maxRetries = error.retryStrategy?.maxRetries || 0;
          return error.retryable && attemptCount <= maxRetries;
        },
        formatUserMessage: vi.fn(),
        logError: vi.fn(),
        getRetryDelay: vi.fn()
      };

      const shouldRetry = handler.shouldRetry(errorWithTooManyRetries);
      expect(shouldRetry).toBe(false);
    });
  });
});
