# API Contracts: Code Quality & Type Safety Improvements

**Generated**: 2025-09-15
**Feature**: Code Quality & Type Safety Improvements
**Purpose**: Define strict TypeScript interfaces and contracts for improved type safety

## TypeScript Interface Contracts

### Streaming Service Contracts

#### Request Contract
```typescript
/**
 * Chat Completion Request Interface
 * Replaces any usage of 'any' type with strict interface
 */
interface CompletionRequest {
  /** Model identifier - must be non-empty string */
  model: string;

  /** Array of chat messages - must contain at least one message */
  messages: ChatMessage[];

  /** Enable streaming response - optional, defaults to false */
  stream?: boolean;

  /** Temperature for response generation - range 0.0 to 2.0 */
  temperature?: number;

  /** Maximum tokens in response - range 1 to 4000 */
  max_tokens?: number;

  /** Maximum context chunks for RAG - range 1 to 10 */
  max_context_chunks?: number;

  /** Similarity threshold for RAG - range 0.0 to 1.0 */
  similarity_threshold?: number;
}

/**
 * Chat Message Interface
 * Used within CompletionRequest.messages
 */
interface ChatMessage {
  /** Message role - must be one of specified values */
  role: 'user' | 'assistant' | 'system';

  /** Message content - must be non-empty string */
  content: string;

  /** Unique message identifier - optional but recommended */
  id?: string;

  /** Message timestamp - optional */
  timestamp?: Date;

  /** Source attributions for RAG responses - optional */
  sources?: SourceAttribution[];
}
```

#### Response Contract
```typescript
/**
 * Chat Completion Chunk Interface
 * For streaming responses - replaces any usage in tests
 */
interface CompletionChunk {
  /** Unique completion identifier */
  id: string;

  /** Object type identifier - must be 'chat.completion.chunk' */
  object: 'chat.completion.chunk';

  /** Unix timestamp of creation */
  created: number;

  /** Model used for generation */
  model: string;

  /** Array of choice deltas */
  choices: StreamChoice[];
}

/**
 * Streaming Choice Interface
 * Contains incremental content updates
 */
interface StreamChoice {
  /** Choice index - usually 0 */
  index: number;

  /** Incremental content delta */
  delta: MessageDelta;

  /** Finish reason when complete - null during streaming */
  finish_reason?: string | null;
}

/**
 * Message Delta Interface
 * Incremental message updates during streaming
 */
interface MessageDelta {
  /** Role - only present in first chunk */
  role?: 'assistant';

  /** Incremental content - can be empty string */
  content?: string;
}
```

### Mock Service Contracts

#### Mock Implementation Interface
```typescript
/**
 * Mock Streaming Service Interface
 * Enforces proper typing in test environments
 * REPLACES: any types in ChatInterface.test.tsx
 */
interface MockStreamingService {
  /**
   * Create chat completion with proper typing
   * @param request - Typed request object (no 'any' allowed)
   * @param options - Typed callback options
   * @returns Typed async generator
   */
  createChatCompletion(
    request: CompletionRequest,
    options?: StreamingCallbacks
  ): Promise<AsyncGenerator<CompletionChunk>>;
}

/**
 * Streaming Callbacks Interface
 * Replaces 'any' type in callback parameters
 */
interface StreamingCallbacks {
  /** Called with each content chunk */
  onMessage?: (content: string) => void;

  /** Called with source attributions */
  onSourceAttribution?: (sources: SourceAttribution[]) => void;

  /** Called when streaming completes */
  onComplete?: (message: ChatMessage) => void;

  /** Called on error */
  onError?: (error: Error) => void;
}

/**
 * Mock Test Chunk Factory
 * Generates properly typed test chunks
 */
interface MockChunkFactory {
  createContentChunk(content: string, isFirst?: boolean): CompletionChunk;
  createFinalChunk(): CompletionChunk;
  createErrorChunk(error: string): CompletionChunk;
}
```

## Error Handling Contracts

### Error Response Interface
```typescript
/**
 * Structured Error Response
 * Replaces generic Error throwing with typed errors
 */
interface Error extends Error {
  /** Error category for handling decisions */
  category: ErrorCategory;

  /** User-friendly message */
  userMessage: string;

  /** Technical details for logging */
  technicalDetails?: string;

  /** Whether operation can be retried */
  retryable: boolean;

  /** HTTP status code if applicable */
  statusCode?: number;
}

/**
 * Error Categories Enum
 * Enables specific error handling logic
 */
enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  RATE_LIMITING = 'rate_limiting',
  NETWORK = 'network',
  VALIDATION = 'validation',
  STREAMING = 'streaming',
  UNKNOWN = 'unknown'
}

/**
 * Error Handler Interface
 * Standardizes error processing
 */
interface ErrorHandler {
  handleError(error: unknown): Error;
  formatUserMessage(error: Error): string;
  shouldRetry(error: Error): boolean;
  logError(error: Error, context?: Record<string, unknown>): void;
}
```

## Resource Cleanup Contracts

### Cleanup Handler Interface
```typescript
/**
 * Resource Cleanup Handler
 * Manages AbortController and other resource disposal
 */
interface CleanupHandler {
  /** Unique handler identifier */
  id: string;

  /** Type of resource being managed */
  type: CleanupType;

  /** Resource reference */
  resource: AbortController | EventTarget | (() => void);

  /** Dispose of the resource */
  dispose(): void;

  /** Whether resource has been disposed */
  readonly isDisposed: boolean;
}

/**
 * Cleanup Types Enum
 * Categorizes different cleanup operations
 */
enum CleanupType {
  ABORT_CONTROLLER = 'abort_controller',
  EVENT_LISTENER = 'event_listener',
  TIMEOUT = 'timeout',
  SUBSCRIPTION = 'subscription'
}

/**
 * Cleanup Registry Interface
 * Centralized cleanup management
 */
interface CleanupRegistry {
  /** Register a cleanup handler */
  register(handler: CleanupHandler): void;

  /** Unregister a specific handler */
  unregister(id: string): boolean;

  /** Dispose all registered handlers */
  disposeAll(): void;

  /** Dispose handlers of specific type */
  disposeByType(type: CleanupType): void;

  /** Get count of active handlers */
  getActiveCount(): number;
}
```

## Accessibility Contracts

### Accessibility Metadata Interface
```typescript
/**
 * Accessibility Metadata
 * Defines ARIA attributes and accessibility requirements
 */
interface AccessibilityMetadata {
  /** Element selector or component name */
  element: string;

  /** ARIA role attribute */
  role?: string;

  /** ARIA label - must be descriptive */
  ariaLabel: string;

  /** ARIA description for additional context */
  ariaDescription?: string;

  /** Live region announcement behavior */
  ariaLive?: 'polite' | 'assertive' | 'off';

  /** Tab order index */
  tabIndex?: number;

  /** Whether element is keyboard accessible */
  keyboardAccessible: boolean;
}

/**
 * Accessibility Validator Interface
 * Validates accessibility compliance
 */
interface AccessibilityValidator {
  validateElement(metadata: AccessibilityMetadata): ValidationResult[];
  validateInteractiveElements(container: HTMLElement): ValidationResult[];
  checkColorContrast(element: HTMLElement): ValidationResult;
  checkKeyboardNavigation(container: HTMLElement): ValidationResult[];
}

/**
 * Validation Result Interface
 * Reports accessibility validation findings
 */
interface ValidationResult {
  /** Validation rule that was checked */
  rule: string;

  /** Whether validation passed */
  passed: boolean;

  /** Description of the issue if failed */
  message?: string;

  /** Severity level */
  severity: 'error' | 'warning' | 'info';

  /** Element that failed validation */
  element?: string;
}
```

## Test Contract Validation

### Test Expectation Contracts
```typescript
/**
 * Test Expectation Interface
 * Replaces expecting failures with expecting success
 */
interface TestExpectation {
  /** Unique test identifier */
  testId: string;

  /** Human-readable test description */
  description: string;

  /** What type of behavior is being tested */
  expectationType: ExpectationType;

  /** Mock setup if required */
  mockBehavior?: MockBehavior;

  /** What assertions should pass */
  assertions: TestAssertion[];
}

/**
 * Test Expectation Types
 */
enum ExpectationType {
  SUCCESS = 'success',
  ERROR_HANDLING = 'error_handling',
  TYPE_VALIDATION = 'type_validation',
  ACCESSIBILITY = 'accessibility',
  MEMORY_CLEANUP = 'memory_cleanup'
}

/**
 * Mock Behavior Configuration
 * Ensures mocks implement proper interfaces
 */
interface MockBehavior {
  /** Service method to mock */
  serviceMethod: string;

  /** Mock implementation function with proper typing */
  mockImplementation: (...args: unknown[]) => unknown;

  /** Expected number of calls */
  expectedCalls: number;

  /** Mock return value type validation */
  returnType: string;
}

/**
 * Test Assertion Interface
 * Defines what should be verified
 */
interface TestAssertion {
  /** Element selector or test ID */
  target: string;

  /** Property to check */
  property: string;

  /** Expected value */
  expectedValue: unknown;

  /** Assertion method to use */
  matcher: AssertionMatcher;
}

/**
 * Available Assertion Matchers
 */
type AssertionMatcher =
  | 'toBe'
  | 'toContain'
  | 'toHaveLength'
  | 'toBeInTheDocument'
  | 'toHaveAttribute'
  | 'toBeVisible'
  | 'toBeFocused';
```

## Contract Validation Rules

### Type Safety Rules
1. **No `any` types allowed** - All interfaces must use specific types
2. **Generic constraints required** - Generic types must have proper bounds
3. **Union types preferred** - Use union types over `any` for multiple possibilities
4. **Optional properties explicit** - Use `?:` syntax for optional fields

### Interface Compliance Rules
1. **Mock implementations must match interfaces** - No type casting allowed
2. **Test assertions must be type-safe** - All expected values must match property types
3. **Error handling must be structured** - Use Error interface for all errors
4. **Cleanup handlers must implement interface** - All resource cleanup must be registered

### Accessibility Compliance Rules
1. **Interactive elements need ARIA labels** - All buttons, inputs must have ariaLabel
2. **Dynamic content needs live regions** - Streaming content must use ariaLive
3. **Focus management required** - Tab order must be logical and complete
4. **Color contrast validation** - All text must meet WCAG 2.1 AA standards

### Testing Compliance Rules
1. **Tests must expect actual functionality** - No tests expecting import failures
2. **Mocks must enforce interfaces** - Mock objects must implement full interfaces
3. **Assertions must be specific** - Use specific matchers, not generic truthiness
4. **Cleanup verification required** - Tests must verify resource cleanup occurs

---

**Contract Definitions Complete**: All interfaces defined with strict typing and validation rules.
