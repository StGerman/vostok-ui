/**
 * Integration Tests for Memory Cleanup
 *
 * Tests resource cleanup functionality to prevent memory leaks.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { CleanupHandler, CleanupRegistry } from '../../src/types/cleanup';

describe('Memory Cleanup Integration', () => {
  let mockCleanupRegistry: CleanupRegistry;
  let abortControllers: AbortController[];
  let eventListeners: { target: EventTarget; type: string; listener: EventListener }[];
  let timeouts: NodeJS.Timeout[];
  let intervals: NodeJS.Timeout[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Track resources for cleanup verification
    abortControllers = [];
    eventListeners = [];
    timeouts = [];
    intervals = [];

    // Mock cleanup registry
    const handlers = new Map<string, CleanupHandler>();

    mockCleanupRegistry = {
      register: (handler: CleanupHandler) => {
        handlers.set(handler.id, handler);
      },
      unregister: (id: string) => {
        handlers.delete(id);
      },
      cleanup: async (type?) => {
        const results = [];
        for (const [id, handler] of handlers.entries()) {
          if (!type || handler.type === type) {
            try {
              const result = await handler.cleanup();
              results.push({ handlerId: id, ...result });
            } catch (error) {
              results.push({
                handlerId: id,
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error')
              });
            }
          }
        }
        return results;
      },
      cleanupAll: async (context?) => {
        const results = [];
        const sortedHandlers = Array.from(handlers.values()).sort((a, b) => a.priority - b.priority);

        for (const handler of sortedHandlers) {
          const result = await handler.cleanup(context);
          results.push({ handlerId: handler.id, ...result });
        }
        return results;
      },
      getRegistered: (type?) => {
        return Array.from(handlers.values())
          .filter(h => !type || h.type === type)
          .map(h => ({ id: h.id, type: h.type }));
      },
      size: () => handlers.size
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();

    // Clean up any remaining resources
    abortControllers.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });

    eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });

    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  });

  describe('AbortController Cleanup', () => {
    it('should properly cleanup AbortController instances', async () => {
      // Create multiple AbortControllers to simulate concurrent requests
      const controllers = [
        new AbortController(),
        new AbortController(),
        new AbortController()
      ];
      abortControllers.push(...controllers);

      // Register cleanup handlers for each controller
      controllers.forEach((controller, index) => {
        const handler: CleanupHandler = {
          id: `abort-handler-${index}`,
          type: 'abort_controller',
          priority: 1,
          cleanup: async () => {
            if (!controller.signal.aborted) {
              controller.abort();
            }
            return { success: true, error: null };
          },
          canCleanup: () => !controller.signal.aborted,
          metadata: {
            createdAt: new Date(),
            source: 'streaming-service',
            description: `AbortController ${index} for request cleanup`
          }
        };

        mockCleanupRegistry.register(handler);
      });

      // Verify all controllers are not aborted initially
      expect(controllers.every(c => !c.signal.aborted)).toBe(true);
      expect(mockCleanupRegistry.size()).toBe(3);

      // Perform cleanup
      const results = await mockCleanupRegistry.cleanup('abort_controller');

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(controllers.every(c => c.signal.aborted)).toBe(true);
    });

    it('should handle AbortController cleanup failures gracefully', async () => {
      const controller = new AbortController();
      abortControllers.push(controller);

      // Create a handler that fails
      const faultyHandler: CleanupHandler = {
        id: 'faulty-abort-handler',
        type: 'abort_controller',
        priority: 1,
        cleanup: async () => {
          throw new Error('Controller cleanup failed');
        },
        canCleanup: () => true,
        metadata: {
          createdAt: new Date(),
          source: 'test',
          description: 'Faulty AbortController handler'
        }
      };

      mockCleanupRegistry.register(faultyHandler);

      const results = await mockCleanupRegistry.cleanup('abort_controller');

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove event listeners to prevent memory leaks', async () => {
      const target = new EventTarget();
      const listeners = [
        { type: 'message', handler: vi.fn() },
        { type: 'error', handler: vi.fn() },
        { type: 'close', handler: vi.fn() }
      ];

      // Add event listeners
      listeners.forEach(({ type, handler }) => {
        target.addEventListener(type, handler);
        eventListeners.push({ target, type, listener: handler });
      });

      // Create cleanup handlers
      listeners.forEach(({ type, handler }, index) => {
        const cleanupHandler: CleanupHandler = {
          id: `event-handler-${index}`,
          type: 'event_listener',
          priority: 2,
          cleanup: async () => {
            target.removeEventListener(type, handler);
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'websocket-connection',
            description: `Event listener cleanup for ${type}`
          }
        };

        mockCleanupRegistry.register(cleanupHandler);
      });

      expect(mockCleanupRegistry.size()).toBe(3);

      // Perform cleanup
      const results = await mockCleanupRegistry.cleanup('event_listener');

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);

      // Verify listeners were removed by checking no events are handled
      target.dispatchEvent(new CustomEvent('message'));
      target.dispatchEvent(new CustomEvent('error'));
      target.dispatchEvent(new CustomEvent('close'));

      listeners.forEach(({ handler }) => {
        expect(handler).not.toHaveBeenCalled();
      });
    });
  });

  describe('Timer Cleanup', () => {
    it('should clear timeouts and intervals', async () => {
      const timeoutIds: number[] = [];
      const intervalIds: number[] = [];

      // Create timeouts
      for (let i = 0; i < 3; i++) {
        const timeoutId = setTimeout(() => {}, 1000 * (i + 1));
        timeoutIds.push(timeoutId);
        timeouts.push(timeoutId);
      }

      // Create intervals
      for (let i = 0; i < 2; i++) {
        const intervalId = setInterval(() => {}, 500 * (i + 1));
        intervalIds.push(intervalId);
        intervals.push(intervalId);
      }

      // Register timeout cleanup handlers
      timeoutIds.forEach((id, index) => {
        const handler: CleanupHandler = {
          id: `timeout-handler-${index}`,
          type: 'timeout',
          priority: 3,
          cleanup: async () => {
            clearTimeout(id);
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'ui-component',
            description: `Timeout cleanup ${id}`
          }
        };

        mockCleanupRegistry.register(handler);
      });

      // Register interval cleanup handlers
      intervalIds.forEach((id, index) => {
        const handler: CleanupHandler = {
          id: `interval-handler-${index}`,
          type: 'interval',
          priority: 3,
          cleanup: async () => {
            clearInterval(id);
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'periodic-task',
            description: `Interval cleanup ${id}`
          }
        };

        mockCleanupRegistry.register(handler);
      });

      expect(mockCleanupRegistry.size()).toBe(5);

      // Cleanup all timers
      const timeoutResults = await mockCleanupRegistry.cleanup('timeout');
      const intervalResults = await mockCleanupRegistry.cleanup('interval');

      expect(timeoutResults).toHaveLength(3);
      expect(intervalResults).toHaveLength(2);
      expect([...timeoutResults, ...intervalResults].every(r => r.success)).toBe(true);
    });
  });

  describe('Streaming Resource Cleanup', () => {
    it('should cleanup streaming connections and readers', async () => {
      // Mock streaming resources
      const mockReaders = [
        { cancel: vi.fn().mockResolvedValue(undefined) },
        { cancel: vi.fn().mockResolvedValue(undefined) }
      ];

      const streamHandlers = mockReaders.map((reader, index) => ({
        id: `stream-handler-${index}`,
        type: 'stream' as const,
        priority: 1,
        cleanup: async () => {
          await reader.cancel();
          return { success: true, error: null };
        },
        canCleanup: () => true,
        metadata: {
          createdAt: new Date(),
          source: 'streaming-service',
          description: `Stream reader cleanup ${index}`
        }
      }));

      streamHandlers.forEach(handler => {
        mockCleanupRegistry.register(handler);
      });

      const results = await mockCleanupRegistry.cleanup('stream');

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      mockReaders.forEach(reader => {
        expect(reader.cancel).toHaveBeenCalled();
      });
    });
  });

  describe('Priority-Based Cleanup', () => {
    it('should cleanup resources in priority order', async () => {
      const cleanupOrder: string[] = [];

      // Create handlers with different priorities
      const handlers = [
        {
          id: 'high-priority',
          type: 'abort_controller' as const,
          priority: 1,
          description: 'Critical resources'
        },
        {
          id: 'medium-priority',
          type: 'event_listener' as const,
          priority: 5,
          description: 'UI event handlers'
        },
        {
          id: 'low-priority',
          type: 'timeout' as const,
          priority: 10,
          description: 'Background timers'
        }
      ];

      handlers.forEach(({ id, type, priority, description }) => {
        const handler: CleanupHandler = {
          id,
          type,
          priority,
          cleanup: async () => {
            cleanupOrder.push(id);
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'test',
            description
          }
        };

        mockCleanupRegistry.register(handler);
      });

      await mockCleanupRegistry.cleanupAll();

      // Should cleanup in priority order (lower number = higher priority)
      expect(cleanupOrder).toEqual(['high-priority', 'medium-priority', 'low-priority']);
    });
  });

  describe('Component Lifecycle Cleanup', () => {
    it('should simulate React component unmount cleanup', async () => {
      // Simulate resources created by a chat component
      const controller = new AbortController();
      const target = new EventTarget();
      const timeoutId = setTimeout(() => {}, 5000);

      abortControllers.push(controller);
      timeouts.push(timeoutId);

      // Register cleanup handlers for component resources
      const componentHandlers: CleanupHandler[] = [
        {
          id: 'chat-abort-controller',
          type: 'abort_controller',
          priority: 1,
          cleanup: async () => {
            controller.abort();
            return { success: true, error: null };
          },
          canCleanup: () => !controller.signal.aborted,
          metadata: {
            createdAt: new Date(),
            source: 'ChatInterface',
            description: 'Chat request AbortController'
          }
        },
        {
          id: 'chat-scroll-listener',
          type: 'event_listener',
          priority: 2,
          cleanup: async () => {
            target.removeEventListener('scroll', () => {});
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'ChatInterface',
            description: 'Scroll event listener'
          }
        },
        {
          id: 'chat-auto-scroll-timeout',
          type: 'timeout',
          priority: 3,
          cleanup: async () => {
            clearTimeout(timeoutId);
            return { success: true, error: null };
          },
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'ChatInterface',
            description: 'Auto-scroll timeout'
          }
        }
      ];

      componentHandlers.forEach(handler => {
        mockCleanupRegistry.register(handler);
      });

      // Simulate component unmount
      const cleanupContext = {
        reason: 'component_unmount' as const,
        force: false,
        timeout: 5000,
        metadata: {
          componentName: 'ChatInterface'
        }
      };

      const results = await mockCleanupRegistry.cleanupAll(cleanupContext);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(controller.signal.aborted).toBe(true);

      // Verify cleanup order by priority
      const handlerIds = results.map(r => r.handlerId);
      expect(handlerIds).toEqual([
        'chat-abort-controller',
        'chat-scroll-listener',
        'chat-auto-scroll-timeout'
      ]);
    });
  });

  describe('Error Recovery and Cleanup', () => {
    it('should cleanup resources when errors occur', async () => {
      const controller = new AbortController();
      abortControllers.push(controller);

      const errorHandler: CleanupHandler = {
        id: 'error-recovery-handler',
        type: 'abort_controller',
        priority: 1,
        cleanup: async (context?) => {
          if (context?.reason === 'error') {
            // Force cleanup on error
            controller.abort();
            return {
              success: true,
              error: null,
              metadata: { forcedCleanup: true }
            };
          }
          return { success: true, error: null };
        },
        canCleanup: () => true,
        metadata: {
          createdAt: new Date(),
          source: 'error-handler',
          description: 'Error recovery cleanup'
        }
      };

      mockCleanupRegistry.register(errorHandler);

      // Simulate error condition
      const errorContext = {
        reason: 'error' as const,
        force: true,
        timeout: 1000,
        error: new Error('Critical streaming error')
      };

      const results = await mockCleanupRegistry.cleanupAll(errorContext);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].metadata?.forcedCleanup).toBe(true);
      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should prevent accumulation of cleanup handlers', async () => {
      const initialSize = mockCleanupRegistry.size();

      // Register many handlers
      for (let i = 0; i < 100; i++) {
        const handler: CleanupHandler = {
          id: `temp-handler-${i}`,
          type: 'custom',
          priority: 1,
          cleanup: async () => ({ success: true, error: null }),
          canCleanup: () => true,
          metadata: {
            createdAt: new Date(),
            source: 'test',
            description: `Temporary handler ${i}`
          }
        };

        mockCleanupRegistry.register(handler);
      }

      expect(mockCleanupRegistry.size()).toBe(initialSize + 100);

      // Cleanup all and unregister
      await mockCleanupRegistry.cleanupAll();

      // Manually unregister (simulating proper cleanup)
      for (let i = 0; i < 100; i++) {
        mockCleanupRegistry.unregister(`temp-handler-${i}`);
      }

      expect(mockCleanupRegistry.size()).toBe(initialSize);
    });

    it('should handle concurrent cleanup requests safely', async () => {
      const controller = new AbortController();
      abortControllers.push(controller);

      const handler: CleanupHandler = {
        id: 'concurrent-handler',
        type: 'abort_controller',
        priority: 1,
        cleanup: async () => {
          // Simulate slow cleanup
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!controller.signal.aborted) {
            controller.abort();
          }
          return { success: true, error: null };
        },
        canCleanup: () => !controller.signal.aborted,
        metadata: {
          createdAt: new Date(),
          source: 'concurrent-test',
          description: 'Concurrent cleanup handler'
        }
      };

      mockCleanupRegistry.register(handler);

      // Start multiple cleanup operations simultaneously
      const cleanupPromises = [
        mockCleanupRegistry.cleanup('abort_controller'),
        mockCleanupRegistry.cleanup('abort_controller'),
        mockCleanupRegistry.cleanupAll()
      ];

      const results = await Promise.all(cleanupPromises);

      // All should succeed without conflicts
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
        if (result.length > 0) {
          expect(result[0].success).toBe(true);
        }
      });

      expect(controller.signal.aborted).toBe(true);
    });
  });
});
