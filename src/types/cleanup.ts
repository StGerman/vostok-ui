/**
 * Cleanup Handler Type Definitions
 *
 * Comprehensive TypeScript interfaces for resource cleanup and memory management.
 * Prevents memory leaks by providing structured cleanup for various resource types.
 */

/**
 * Types of resources that can be cleaned up
 */
export type CleanupType =
  | 'abort_controller'
  | 'event_listener'
  | 'timeout'
  | 'interval'
  | 'websocket'
  | 'stream'
  | 'custom';

/**
 * Reasons why cleanup was triggered
 */
export type CleanupReason =
  | 'component_unmount'
  | 'page_unload'
  | 'manual'
  | 'error'
  | 'timeout'
  | 'memory_pressure';

/**
 * Result of a cleanup operation
 */
export interface CleanupResult {
  /** Whether cleanup was successful */
  success: boolean;

  /** Error if cleanup failed */
  error: Error | null;

  /** ID of the handler that was cleaned up */
  handlerId?: string;

  /** Time taken for cleanup in milliseconds */
  duration?: number;

  /** Additional metadata about the cleanup */
  metadata?: Record<string, unknown>;
}

/**
 * Context information for cleanup operations
 */
export interface CleanupContext {
  /** Reason for cleanup */
  reason: CleanupReason;

  /** Whether to force cleanup even if it might fail */
  force: boolean;

  /** Maximum time to wait for cleanup completion */
  timeout?: number;

  /** Error that triggered cleanup (if applicable) */
  error?: Error;

  /** Additional context metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Individual cleanup handler
 */
export interface CleanupHandler {
  /** Unique identifier for this handler */
  id: string;

  /** Type of resource being cleaned up */
  type: CleanupType;

  /** Priority for cleanup order (lower = higher priority) */
  priority: number;

  /** Function to perform the actual cleanup */
  cleanup(context?: CleanupContext): Promise<CleanupResult>;

  /** Check if cleanup can/should be performed */
  canCleanup(): boolean;

  /** Metadata about this cleanup handler */
  metadata: {
    /** When the handler was created */
    createdAt: Date;

    /** Source that created this handler */
    source: string;

    /** Human-readable description */
    description: string;

    /** Additional metadata */
    [key: string]: unknown;
  };
}

/**
 * Registry for managing cleanup handlers
 */
export interface CleanupRegistry {
  /**
   * Register a cleanup handler
   */
  register(handler: CleanupHandler): void;

  /**
   * Unregister a cleanup handler by ID
   */
  unregister(id: string): void;

  /**
   * Cleanup specific type of handlers
   */
  cleanup(type?: CleanupType, context?: CleanupContext): Promise<Array<CleanupResult & { handlerId: string }>>;

  /**
   * Cleanup all registered handlers
   */
  cleanupAll(context?: CleanupContext): Promise<Array<CleanupResult & { handlerId: string }>>;

  /**
   * Get list of registered handlers
   */
  getRegistered(type?: CleanupType): Array<{ id: string; type: CleanupType }>;

  /**
   * Get number of registered handlers
   */
  size(): number;
}

/**
 * Advanced cleanup registry with additional features
 */
export interface AdvancedCleanupRegistry extends CleanupRegistry {
  /**
   * Schedule cleanup for later execution
   */
  scheduleCleanup(handlerId: string, delayMs: number, context?: CleanupContext): Promise<void>;

  /**
   * Cancel scheduled cleanup
   */
  cancelScheduled(handlerId: string): boolean;

  /**
   * Get cleanup statistics
   */
  getStats(): CleanupStatistics;

  /**
   * Add event listener for cleanup events
   */
  addEventListener(event: CleanupEventType, listener: CleanupEventListener): void;

  /**
   * Remove event listener
   */
  removeEventListener(event: CleanupEventType, listener: CleanupEventListener): void;

  /**
   * Perform health check on all handlers
   */
  healthCheck(): Promise<CleanupHealthReport>;
}

/**
 * Cleanup task for tracking scheduled operations
 */
export interface CleanupTask {
  /** Unique task ID */
  id: string;

  /** Handler ID this task belongs to */
  handlerId: string;

  /** Type of cleanup */
  type: CleanupType;

  /** When task was scheduled */
  scheduledAt: Date;

  /** When task was executed (null if not yet executed) */
  executedAt: Date | null;

  /** Result of execution (null if not yet executed) */
  result: CleanupResult | null;

  /** Context for execution */
  context: CleanupContext;
}

/**
 * Statistics about cleanup operations
 */
export interface CleanupStatistics {
  /** Total number of handlers registered */
  totalHandlers: number;

  /** Handlers by type */
  handlersByType: Record<CleanupType, number>;

  /** Total cleanup operations performed */
  totalOperations: number;

  /** Successful cleanup operations */
  successfulOperations: number;

  /** Failed cleanup operations */
  failedOperations: number;

  /** Average cleanup time */
  averageCleanupTime: number;

  /** Longest cleanup time */
  longestCleanupTime: number;

  /** Most common cleanup reasons */
  commonReasons: Array<{ reason: CleanupReason; count: number }>;

  /** Time period for statistics */
  timePeriod: {
    start: string;
    end: string;
  };
}

/**
 * Health report for cleanup system
 */
export interface CleanupHealthReport {
  /** Overall health status */
  status: 'healthy' | 'warning' | 'critical';

  /** Individual handler health */
  handlers: Array<{
    id: string;
    type: CleanupType;
    status: 'healthy' | 'warning' | 'error';
    canCleanup: boolean;
    lastCleanupTime?: string;
    issues?: string[];
  }>;

  /** System-wide issues */
  systemIssues: string[];

  /** Recommendations for improvement */
  recommendations: string[];

  /** Timestamp of health check */
  timestamp: string;
}

/**
 * Cleanup event types
 */
export type CleanupEventType =
  | 'handler_registered'
  | 'handler_unregistered'
  | 'cleanup_started'
  | 'cleanup_completed'
  | 'cleanup_failed'
  | 'cleanup_scheduled'
  | 'cleanup_cancelled';

/**
 * Cleanup event data
 */
export interface CleanupEvent {
  /** Type of event */
  type: CleanupEventType;

  /** Handler ID involved in event */
  handlerId: string;

  /** Cleanup type */
  cleanupType: CleanupType;

  /** Event timestamp */
  timestamp: string;

  /** Additional event data */
  data?: {
    result?: CleanupResult;
    context?: CleanupContext;
    error?: Error;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Event listener for cleanup events
 */
export type CleanupEventListener = (event: CleanupEvent) => void;

/**
 * Configuration for cleanup system
 */
export interface CleanupConfig {
  /** Default timeout for cleanup operations */
  defaultTimeout: number;

  /** Whether to run cleanup automatically on page unload */
  autoCleanupOnUnload: boolean;

  /** Maximum number of concurrent cleanup operations */
  maxConcurrentCleanups: number;

  /** Whether to collect cleanup statistics */
  collectStatistics: boolean;

  /** Log level for cleanup operations */
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';

  /** Custom error handler for cleanup failures */
  errorHandler?: (error: Error, handler: CleanupHandler) => void;

  /** Whether to emit events */
  emitEvents: boolean;
}

/**
 * Factory for creating common cleanup handlers
 */
export interface CleanupHandlerFactory {
  /**
   * Create AbortController cleanup handler
   */
  createAbortControllerHandler(
    id: string,
    controller: AbortController,
    source: string,
    description?: string
  ): CleanupHandler;

  /**
   * Create event listener cleanup handler
   */
  createEventListenerHandler(
    id: string,
    target: EventTarget,
    type: string,
    listener: EventListener,
    source: string,
    description?: string
  ): CleanupHandler;

  /**
   * Create timeout cleanup handler
   */
  createTimeoutHandler(
    id: string,
    timeoutId: number | NodeJS.Timeout,
    source: string,
    description?: string
  ): CleanupHandler;

  /**
   * Create interval cleanup handler
   */
  createIntervalHandler(
    id: string,
    intervalId: number | NodeJS.Timeout,
    source: string,
    description?: string
  ): CleanupHandler;

  /**
   * Create custom cleanup handler
   */
  createCustomHandler(
    id: string,
    cleanupFn: () => Promise<void> | void,
    source: string,
    description?: string,
    priority?: number
  ): CleanupHandler;
}

/**
 * Hook interface for React component cleanup
 */
export interface CleanupHook {
  /**
   * Register a cleanup handler for the current component
   */
  registerCleanup(handler: CleanupHandler): void;

  /**
   * Create and register an AbortController
   */
  createAbortController(id?: string): AbortController;

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void;

  /**
   * Set timeout with automatic cleanup
   */
  setTimeout(callback: () => void, delay: number): number;

  /**
   * Set interval with automatic cleanup
   */
  setInterval(callback: () => void, delay: number): number;

  /**
   * Get number of registered cleanup handlers
   */
  getCleanupCount(): number;

  /**
   * Manually trigger cleanup (normally happens on unmount)
   */
  cleanup(): Promise<CleanupResult[]>;
}

/**
 * Memory monitoring interface
 */
export interface MemoryMonitor {
  /**
   * Get current memory usage estimate
   */
  getCurrentUsage(): MemoryUsage;

  /**
   * Start monitoring memory usage
   */
  startMonitoring(interval?: number): void;

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(): void;

  /**
   * Check if memory usage is above threshold
   */
  isMemoryPressure(threshold?: number): boolean;

  /**
   * Get memory usage history
   */
  getUsageHistory(): MemoryUsage[];

  /**
   * Add callback for memory pressure events
   */
  onMemoryPressure(callback: (usage: MemoryUsage) => void): void;
}

/**
 * Memory usage information
 */
export interface MemoryUsage {
  /** Total JS heap size in bytes */
  totalJSHeapSize: number;

  /** Used JS heap size in bytes */
  usedJSHeapSize: number;

  /** JS heap size limit in bytes */
  jsHeapSizeLimit: number;

  /** Number of DOM nodes */
  domNodes?: number;

  /** Number of event listeners */
  eventListeners?: number;

  /** Number of active timers */
  activeTimers?: number;

  /** Timestamp of measurement */
  timestamp: string;
}

/**
 * Default cleanup priorities for different resource types
 */
export const CleanupPriorities = {
  ABORT_CONTROLLER: 1,    // High priority - stop network requests first
  WEBSOCKET: 2,           // Close connections early
  STREAM: 3,              // Clean up streaming resources
  EVENT_LISTENER: 4,      // Remove event handlers
  TIMEOUT: 5,             // Clear timeouts
  INTERVAL: 6,            // Clear intervals
  CUSTOM: 7               // Custom handlers last
} as const;

/**
 * Type guards for cleanup types
 */
export const CleanupTypeGuards = {
  isCleanupHandler: (obj: unknown): obj is CleanupHandler => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'id' in obj &&
      'type' in obj &&
      'priority' in obj &&
      'cleanup' in obj &&
      'canCleanup' in obj &&
      'metadata' in obj
    );
  },

  isCleanupResult: (obj: unknown): obj is CleanupResult => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'success' in obj &&
      typeof (obj as CleanupResult).success === 'boolean'
    );
  },

  isCleanupType: (value: unknown): value is CleanupType => {
    const types: CleanupType[] = [
      'abort_controller', 'event_listener', 'timeout',
      'interval', 'websocket', 'stream', 'custom'
    ];
    return typeof value === 'string' && types.includes(value as CleanupType);
  },

  isCleanupReason: (value: unknown): value is CleanupReason => {
    const reasons: CleanupReason[] = [
      'component_unmount', 'page_unload', 'manual',
      'error', 'timeout', 'memory_pressure'
    ];
    return typeof value === 'string' && reasons.includes(value as CleanupReason);
  }
};

/**
 * Utility functions for cleanup operations
 */
export const CleanupUtils = {
  /**
   * Create a standard cleanup context
   */
  createContext(
    reason: CleanupReason,
    force: boolean = false,
    timeout?: number,
    error?: Error,
    metadata?: Record<string, unknown>
  ): CleanupContext {
    return {
      reason,
      force,
      timeout,
      error,
      metadata
    };
  },

  /**
   * Generate unique cleanup handler ID
   */
  generateHandlerId(type: CleanupType, source: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${source}_${timestamp}_${random}`;
  },

  /**
   * Create timeout promise for cleanup operations
   */
  withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = 'Cleanup operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      })
    ]);
  },

  /**
   * Safe cleanup wrapper that catches errors
   */
  safeCleanup(
    cleanup: () => Promise<void> | void,
    handlerId: string
  ): Promise<CleanupResult> {
    return new Promise(async (resolve) => {
      const startTime = Date.now();

      try {
        await cleanup();

        resolve({
          success: true,
          error: null,
          handlerId,
          duration: Date.now() - startTime
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          handlerId,
          duration: Date.now() - startTime
        });
      }
    });
  },

  /**
   * Check if browser supports performance memory API
   */
  supportsMemoryAPI(): boolean {
    return 'performance' in window && 'memory' in performance;
  },

  /**
   * Get current memory usage (if supported)
   */
  getCurrentMemoryUsage(): MemoryUsage | null {
    if (!CleanupUtils.supportsMemoryAPI()) {
      return null;
    }

    // Use type assertion for Chrome's memory extension to performance API
    const memory = (performance as Performance & {
      memory: {
        totalJSHeapSize: number;
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      }
    }).memory;

    return {
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: new Date().toISOString()
    };
  }
};
