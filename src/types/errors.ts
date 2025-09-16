/**
 * Error Handling Type Definitions
 *
 * Comprehensive TypeScript interfaces for structured error handling.
 * Provides type-safe error categorization, retry strategies, and user messaging.
 */

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'network'
  | 'rate_limit'
  | 'server_error'
  | 'client_error'
  | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

/**
 * Structured error message interface
 */
export interface ErrorMessage {
  /** Unique error code for identification */
  code: string;

  /** Error category for classification */
  category: ErrorCategory;

  /** Severity level */
  severity: ErrorSeverity;

  /** User-friendly error message */
  userMessage: string;

  /** Technical error details for debugging */
  technicalMessage: string;

  /** Additional error context */
  context: ErrorContext;

  /** Whether this error is retryable */
  retryable: boolean;

  /** Retry strategy if applicable */
  retryStrategy: RetryStrategy | null;
}

/**
 * Comprehensive error context
 */
export interface ErrorContext {
  /** Unique request identifier */
  requestId: string;

  /** Timestamp when error occurred */
  timestamp: string;

  /** User ID if applicable */
  userId?: string;

  /** Session ID if applicable */
  sessionId?: string;

  /** API endpoint where error occurred */
  endpoint?: string;

  /** HTTP method used */
  method?: string;

  /** HTTP status code */
  statusCode?: number;

  /** Request response time */
  responseTime?: number;

  /** User agent string */
  userAgent?: string;

  /** Client IP address */
  ipAddress?: string;

  /** Number of retry attempts */
  attemptCount?: number;

  /** Stack trace for debugging */
  stackTrace?: string;

  /** Additional contextual data */
  additionalData?: Record<string, unknown>;

  /** Time when rate limit resets (for rate limit errors) */
  resetTime?: string;

  /** Component or service where error originated */
  source?: string;
}

/**
 * Retry strategy configuration
 */
export interface RetryStrategy {
  /** Maximum number of retry attempts */
  maxRetries: number;

  /** Base backoff time in milliseconds */
  backoffMs: number;

  /** Whether to use exponential backoff */
  exponential: boolean;

  /** Whether to add random jitter */
  jitter?: boolean;

  /** Maximum backoff time (for exponential) */
  maxBackoffMs?: number;

  /** Conditions under which to retry */
  retryConditions?: RetryCondition[];
}

/**
 * Conditions that determine if retry should occur
 */
export interface RetryCondition {
  /** Error codes that should trigger retry */
  errorCodes?: string[];

  /** HTTP status codes that should trigger retry */
  statusCodes?: number[];

  /** Error categories that should trigger retry */
  categories?: ErrorCategory[];

  /** Maximum attempt count for this condition */
  maxAttempts?: number;
}

/**
 * Result of error handling operation
 */
export interface ErrorHandlingResult {
  /** The processed error message */
  error: ErrorMessage;

  /** Whether retry should be attempted */
  shouldRetry: boolean;

  /** Delay before retry (if applicable) */
  retryDelayMs?: number;

  /** Actions taken during error handling */
  actions: ErrorHandlingAction[];
}

/**
 * Actions taken during error handling
 */
export interface ErrorHandlingAction {
  /** Type of action performed */
  type: 'log' | 'notify' | 'retry' | 'abort' | 'fallback';

  /** Timestamp of action */
  timestamp: string;

  /** Details about the action */
  details: string;

  /** Whether action was successful */
  success: boolean;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  /**
   * Process an error and return structured error message
   */
  handleError(error: Error, context?: Partial<ErrorContext>): Promise<ErrorMessage>;

  /**
   * Determine if an error should be retried
   */
  shouldRetry(error: ErrorMessage): boolean;

  /**
   * Format user-friendly error message
   */
  formatUserMessage(error: ErrorMessage): string;

  /**
   * Log error for debugging and monitoring
   */
  logError(error: ErrorMessage): void;

  /**
   * Calculate retry delay based on attempt and strategy
   */
  getRetryDelay(attempt: number, strategy: RetryStrategy): number;
}

/**
 * Advanced error handler with additional capabilities
 */
export interface AdvancedErrorHandler extends ErrorHandler {
  /**
   * Handle error with full result details
   */
  handleErrorWithResult(error: Error, context?: Partial<ErrorContext>): Promise<ErrorHandlingResult>;

  /**
   * Register custom error mapping
   */
  registerErrorMapping(pattern: string | RegExp, mapping: ErrorMapping): void;

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStatistics;

  /**
   * Clear error statistics
   */
  clearErrorStats(): void;
}

/**
 * Error mapping for custom error handling
 */
export interface ErrorMapping {
  /** Error code to assign */
  code: string;

  /** Error category */
  category: ErrorCategory;

  /** Severity level */
  severity: ErrorSeverity;

  /** User message template */
  userMessageTemplate: string;

  /** Whether error is retryable */
  retryable: boolean;

  /** Custom retry strategy */
  retryStrategy?: RetryStrategy;
}

/**
 * Error statistics for monitoring
 */
export interface ErrorStatistics {
  /** Total number of errors handled */
  totalErrors: number;

  /** Errors by category */
  errorsByCategory: Record<ErrorCategory, number>;

  /** Errors by severity */
  errorsBySeverity: Record<ErrorSeverity, number>;

  /** Most common error codes */
  topErrorCodes: Array<{ code: string; count: number }>;

  /** Average retry attempts */
  averageRetryAttempts: number;

  /** Success rate after retries */
  retrySuccessRate: number;

  /** Time period for these statistics */
  timePeriod: {
    start: string;
    end: string;
  };
}

/**
 * Error notification configuration
 */
export interface ErrorNotificationConfig {
  /** Whether to show user notifications */
  showUserNotifications: boolean;

  /** Minimum severity to show notifications */
  minimumSeverity: ErrorSeverity;

  /** Maximum notifications per time period */
  maxNotificationsPerPeriod: number;

  /** Time period for notification limiting (ms) */
  notificationPeriodMs: number;

  /** Custom notification templates */
  notificationTemplates?: Record<ErrorCategory, string>;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /** Strategy type */
  type: 'retry' | 'fallback' | 'circuit_breaker' | 'custom';

  /** Configuration for the strategy */
  config: Record<string, unknown>;

  /** Conditions that trigger this strategy */
  conditions: ErrorRecoveryCondition[];
}

/**
 * Conditions for error recovery
 */
export interface ErrorRecoveryCondition {
  /** Error categories that trigger recovery */
  categories?: ErrorCategory[];

  /** Error codes that trigger recovery */
  codes?: string[];

  /** HTTP status codes that trigger recovery */
  statusCodes?: number[];

  /** Minimum severity to trigger recovery */
  minimumSeverity?: ErrorSeverity;
}

/**
 * Circuit breaker state for error handling
 */
export interface CircuitBreakerState {
  /** Current state */
  state: 'closed' | 'open' | 'half_open';

  /** Number of consecutive failures */
  failureCount: number;

  /** Timestamp of last failure */
  lastFailureTime?: string;

  /** Time when circuit breaker will reset */
  resetTime?: string;

  /** Success count in half-open state */
  halfOpenSuccessCount?: number;
}

/**
 * Error aggregation for monitoring
 */
export interface ErrorAggregation {
  /** Time window for aggregation */
  timeWindow: string;

  /** Aggregated error counts */
  counts: {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    byCode: Record<string, number>;
  };

  /** Error rate (errors per minute/hour) */
  errorRate: number;

  /** Trending information */
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  };
}

/**
 * Error boundary configuration for React components
 */
export interface ErrorBoundaryConfig {
  /** Whether to show fallback UI */
  showFallbackUI: boolean;

  /** Custom fallback component */
  fallbackComponent?: string;

  /** Whether to log errors */
  logErrors: boolean;

  /** Whether to report to error tracking service */
  reportErrors: boolean;

  /** Error tracking service configuration */
  errorTracking?: {
    service: string;
    apiKey: string;
    endpoint?: string;
  };
}

/**
 * Pre-defined error codes for common scenarios
 */
export const ErrorCodes = {
  // Authentication errors
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_MISSING: 'AUTH_MISSING',

  // Authorization errors
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',

  // Client errors
  INVALID_REQUEST: 'INVALID_REQUEST',
  MALFORMED_DATA: 'MALFORMED_DATA',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Streaming specific
  STREAM_INTERRUPTED: 'STREAM_INTERRUPTED',
  STREAM_DECODE_ERROR: 'STREAM_DECODE_ERROR',
  STREAM_TIMEOUT: 'STREAM_TIMEOUT',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * Type for error code values
 */
export type ErrorCodeValue = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Default retry strategies for common scenarios
 */
export const DefaultRetryStrategies = {
  NETWORK: {
    maxRetries: 3,
    backoffMs: 1000,
    exponential: true,
    jitter: true,
    maxBackoffMs: 10000
  } as RetryStrategy,

  RATE_LIMIT: {
    maxRetries: 2,
    backoffMs: 60000,
    exponential: false,
    jitter: false
  } as RetryStrategy,

  SERVER_ERROR: {
    maxRetries: 2,
    backoffMs: 2000,
    exponential: true,
    maxBackoffMs: 8000
  } as RetryStrategy,

  NO_RETRY: {
    maxRetries: 0,
    backoffMs: 0,
    exponential: false
  } as RetryStrategy
} as const;

/**
 * Type guards for error handling types
 */
export const ErrorTypeGuards = {
  isErrorMessage: (obj: unknown): obj is ErrorMessage => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'code' in obj &&
      'category' in obj &&
      'severity' in obj &&
      'userMessage' in obj &&
      'technicalMessage' in obj
    );
  },

  isErrorCategory: (value: unknown): value is ErrorCategory => {
    const categories: ErrorCategory[] = [
      'authentication', 'authorization', 'validation', 'network',
      'rate_limit', 'server_error', 'client_error', 'unknown'
    ];
    return typeof value === 'string' && categories.includes(value as ErrorCategory);
  },

  isErrorSeverity: (value: unknown): value is ErrorSeverity => {
    const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];
    return typeof value === 'string' && severities.includes(value as ErrorSeverity);
  },

  isRetryStrategy: (obj: unknown): obj is RetryStrategy => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'maxRetries' in obj &&
      'backoffMs' in obj &&
      'exponential' in obj
    );
  }
};

/**
 * Utility functions for error handling
 */
export const ErrorUtils = {
  /**
   * Create a standardized error message
   */
  createErrorMessage(
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    userMessage: string,
    technicalMessage: string,
    context: Partial<ErrorContext> = {},
    retryable: boolean = false,
    retryStrategy: RetryStrategy | null = null
  ): ErrorMessage {
    return {
      code,
      category,
      severity,
      userMessage,
      technicalMessage,
      context: {
        requestId: context.requestId || `req-${Date.now()}`,
        timestamp: context.timestamp || new Date().toISOString(),
        ...context
      },
      retryable,
      retryStrategy
    };
  },

  /**
   * Extract HTTP status code from error
   */
  extractStatusCode(error: Error): number | undefined {
    // Try different common error formats
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
    if ('code' in error && typeof error.code === 'string') {
      const match = error.code.match(/(\d{3})/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return undefined;
  },

  /**
   * Determine error category from HTTP status code
   */
  categorizeHttpError(statusCode: number): ErrorCategory {
    if (statusCode === 401) return 'authentication';
    if (statusCode === 403) return 'authorization';
    if (statusCode === 400 || statusCode === 422) return 'validation';
    if (statusCode === 429) return 'rate_limit';
    if (statusCode >= 500) return 'server_error';
    if (statusCode >= 400) return 'client_error';
    return 'unknown';
  },

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay(
    attempt: number,
    baseDelayMs: number,
    exponential: boolean = true,
    jitter: boolean = false,
    maxDelayMs?: number
  ): number {
    let delay = exponential ? baseDelayMs * Math.pow(2, attempt) : baseDelayMs;

    if (maxDelayMs) {
      delay = Math.min(delay, maxDelayMs);
    }

    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }
};
