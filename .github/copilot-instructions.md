# Vostok Chat Interface Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-15

## Project Overview

This is the **Vostok Chat Interface** - a production-ready React application that provides a modern chat interface for the Vostok RAG (Retrieval-Augmented Generation) system. Users can have intelligent conversations with their document knowledge base through streaming responses and source attribution.

## Spec-Driven Development Approach

This project follows **Spec-Driven Development (SDD)** methodology:

### 1. Always Start with Specifications
- **NEVER** implement features without a corresponding spec in `/specs/[feature-name]/`
- Each feature has: `spec.md` (requirements), `plan.md` (technical approach), `tasks.md` (implementation steps)
- Read the spec files first to understand business requirements before coding

### 2. Implementation Order (RED-GREEN-REFACTOR)
1. **Contracts First**: API contracts and interfaces (`/contracts/api-contracts.md`)
2. **Tests First**: Write tests before implementation (TDD approach)
3. **Implementation**: Build to make tests pass
4. **Refactor**: Clean up while maintaining green tests

### 3. Current Feature
- **Active Branch**: `002-code-quality-type`
- **Spec Location**: `/specs/002-code-quality-type/spec.md`
- **Plan Location**: `/specs/002-code-quality-type/plan.md`
- **Tasks Location**: `/specs/002-code-quality-type/tasks.md` (to be generated)

### 4. Recent Features
- **001-production-ready-chat**: Completed - Initial chat interface with streaming support

## Active Technologies

**Language/Version**: TypeScript 5.2+ with React 19 (Strict Mode Enforced)
**Primary Dependencies**: React 19, Zustand, TailwindCSS, Headless UI, OpenAI JavaScript SDK, TanStack Query, React Router v6
**Testing**: Vitest for unit tests, Playwright for end-to-end testing
**Storage**: Browser localStorage for themes/preferences, memory for conversation state
**Project Type**: Frontend web application with backend API integration

## Code Quality Requirements (Feature 002)

**TypeScript Strict Mode**: NO `any` types allowed - use proper interfaces
**Error Handling**: Structured error messages with user-friendly guidance
**Memory Management**: Proper AbortController cleanup and resource disposal
**Accessibility**: WCAG 2.1 AA compliance with proper ARIA labels
**Test Alignment**: Component APIs must match test contract expectations

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatInput.tsx   # Message input component
│   ├── ChatSettings.tsx # Settings panel
│   ├── MessageBubble.tsx # Individual message display
│   └── TypingIndicator.tsx # Loading states
├── hooks/              # Custom React hooks
├── services/           # API integrations and external services
│   └── api.ts         # OpenAI-compatible API client
├── types/              # TypeScript type definitions
│   └── chat.ts        # Chat-related interfaces
└── assets/            # Static resources
specs/
└── 001-production-ready-chat/
    ├── spec.md         # Business requirements
    ├── plan.md         # Technical implementation plan
    ├── tasks.md        # Step-by-step implementation tasks
    └── contracts/
        └── api-contracts.md # API interface definitions
```

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Type Safety Guidelines (Feature 002)

### 1. Strict TypeScript Enforcement
- **FORBIDDEN**: `any` type usage - use proper interfaces instead
- **REQUIRED**: All API mocks must implement actual interfaces
- **PATTERN**: Use union types and generics for type safety
- **VALIDATION**: Run `npm run type-check` before commits

### 2. Component Test ID Alignment
- **MessageBubble**: Use `data-testid={message-${message.role}}` not `message-bubble`
- **ChatInput**: Wrap textarea with `data-testid="chat-input"` container
- **Pattern**: Component APIs must match test contract expectations
- **Rule**: Tests define the contract - implementation follows

### 3. Error Handling Requirements
- **Structure**: Use ErrorMessage interface with user-friendly messages
- **Specificity**: Handle 401 (auth), 429 (rate limit), timeout scenarios
- **Cleanup**: Proper AbortController disposal on errors
- **Logging**: Detailed context for debugging, simple messages for users

### 4. Accessibility Implementation
- **ARIA Labels**: Dynamic labels for all interactive elements
- **Screen Readers**: Live regions for streaming content updates
- **Semantic HTML**: Proper heading hierarchy and landmark roles
- **Compliance**: WCAG 2.1 AA level required

## Key Development Principles

### 1. OpenAI Streaming Protocol Compatibility
- Use OpenAI JavaScript SDK for streaming responses
- Implement Server-Sent Events (SSE) for real-time communication
- Handle streaming states: loading, streaming, complete, error

### 2. Responsive & Accessible Design
- Mobile-first approach with TailwindCSS
- WCAG 2.1 AA compliance required
- Support both light and dark themes
- Smooth animations (60fps target)

### 3. State Management
- Use Zustand for global state (conversations, themes)
- Local component state for UI interactions
- Persist theme preferences in localStorage

### 4. Error Handling
- Graceful degradation for network issues
- User-friendly error messages
- Retry mechanisms for failed requests
- Loading states for all async operations

## Code Style

**TypeScript**:
- Strict mode enabled
- Explicit return types for functions
- Use interfaces over types where possible
- Prefer functional components with hooks

**React**:
- Functional components only
- Custom hooks for shared logic
- Props destructuring
- Proper error boundaries

**CSS/Styling**:
- TailwindCSS utility-first approach
- Component-scoped CSS modules when needed
- Consistent spacing scale (4, 8, 12, 16, 24, 32px)
- Semantic color naming

## API Integration Guidelines

### Vostok RAG API Compatibility
- Base URL: Configurable via environment variables
- Follows OpenAI Chat Completions API v1 format
- Additional RAG-specific parameters: `max_context_chunks`, `similarity_threshold`
- Streaming responses with source attribution

### Request Format
```typescript
interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  max_context_chunks?: number;
  similarity_threshold?: number;
}
```

### Response Handling
- Parse streaming JSON chunks
- Extract source attributions
- Handle partial responses gracefully
- Implement retry logic for failed streams

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering and behavior
- Hook functionality
- Utility functions
- Service layer methods

### Integration Tests
- API communication
- State management flows
- Theme persistence
- Error scenarios

### End-to-End Tests (Playwright)
- Complete user workflows
- Streaming response handling
- Cross-browser compatibility
- Accessibility compliance

## Recent Changes

- **002-code-quality-type**: ACTIVE - Code quality & type safety improvements with mandatory quality gates
- **001-production-ready-chat**: Completed - TypeScript 5.2+ + React 19 with streaming chat interface, TailwindCSS theming, and OpenAI protocol compatibility

## Implementation Notes

### Current Priority Tasks
1. Set up streaming API client with OpenAI SDK
2. Implement chat message components with markdown rendering
3. Add theme system (light/dark mode)
4. Create responsive layout with mobile support
5. Integrate source attribution display
6. Add comprehensive error handling

### Key Components to Build
- `ChatInterface`: Main chat container
- `MessageBubble`: Individual message display with markdown
- `ChatInput`: Multi-line input with send functionality
- `TypingIndicator`: Streaming response animation
- `SourceAttribution`: Document reference display
- `ThemeProvider`: Light/dark mode context

### Performance Considerations
- Virtualize long conversation histories
- Optimize re-renders with React.memo
- Lazy load markdown renderer
- Implement message streaming buffer
- Cache API responses when appropriate

<!-- MANUAL ADDITIONS START -->
<!-- Add any project-specific instructions or conventions here -->
<!-- MANUAL ADDITIONS END -->
