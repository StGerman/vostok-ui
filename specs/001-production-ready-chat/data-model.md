# Data Model: Production Ready Chat Interface

**Feature**: Production Ready Chat Interface for Vostok RAG System
**Date**: September 13, 2025
**Status**: Phase 1 - Design Complete

## Overview

This document defines the data structures, relationships, and state management for the chat interface. The model supports real-time streaming conversations with source attribution and theme management.

## Core Entities

### Message Entity
Represents individual user questions and AI responses in the conversation.

```typescript
interface Message {
  id: string;                    // Unique identifier (UUID v4)
  content: string;               // Message text content
  role: 'user' | 'assistant';    // Message sender type
  timestamp: Date;               // Creation timestamp
  status: MessageStatus;         // Delivery/processing status
  sources?: SourceAttribution[]; // Associated document sources (AI only)
  metadata?: MessageMetadata;    // Additional context data
}

enum MessageStatus {
  SENDING = 'sending',           // User message being sent
  SENT = 'sent',                 // Successfully delivered
  STREAMING = 'streaming',       // AI response in progress
  COMPLETE = 'complete',         // AI response finished
  ERROR = 'error',               // Failed to send/receive
  CANCELLED = 'cancelled'        // User cancelled generation
}

interface MessageMetadata {
  tokenCount?: number;           // Message token length
  processingTime?: number;       // Response generation time (ms)
  modelUsed?: string;           // AI model identifier
  errorDetails?: string;        // Error information if applicable
}
```

### Source Attribution Entity
Links AI responses to specific documents with confidence and preview data.

```typescript
interface SourceAttribution {
  id: string;                   // Unique source identifier
  documentId: string;           // Referenced document ID
  documentTitle: string;        // Human-readable document name
  pageNumber?: number;          // Specific page reference
  snippet: string;              // Relevant text excerpt
  confidence: number;           // Relevance score (0-1)
  imageUrl?: string;           // Associated image URL
  linkUrl: string;             // Full document/section link
  previewData?: SourcePreview; // Additional preview information
}

interface SourcePreview {
  thumbnailUrl?: string;        // Document thumbnail
  documentType: string;         // PDF, DOCX, etc.
  lastModified: Date;          // Document modification date
  fileSize?: number;           // Document size in bytes
  highlights: TextHighlight[]; // Highlighted text sections
}

interface TextHighlight {
  startOffset: number;         // Character start position
  endOffset: number;          // Character end position
  text: string;               // Highlighted text content
  context: string;            // Surrounding context
}
```

### Conversation Session Entity
Manages current chat state and user context.

```typescript
interface ConversationSession {
  id: string;                  // Session identifier
  messages: Message[];         // Conversation history
  isActive: boolean;           // Session status
  createdAt: Date;            // Session start time
  lastActivity: Date;         // Last message timestamp
  context: ConversationContext; // Session metadata
  streamingState?: StreamingState; // Active streaming info
}

interface ConversationContext {
  userId?: string;            // User identifier
  documentScope?: string[];   // Available document IDs
  preferences: UserPreferences; // User settings
  capabilities: string[];     // Available features
}

interface StreamingState {
  isStreaming: boolean;       // Currently streaming response
  messageId: string;          // Target message ID
  controller?: AbortController; // Stream cancellation control
  startTime: Date;           // Stream start timestamp
  partialContent: string;    // Accumulated response text
  expectedTokens?: number;   // Estimated response length
}
```

### Theme Preference Entity
Manages user interface theme and accessibility settings.

```typescript
interface ThemePreference {
  mode: ThemeMode;            // Current theme selection
  systemPreference: ThemeMode; // OS theme preference
  customColors?: ColorScheme; // User color overrides
  accessibility: AccessibilitySettings; // A11y preferences
  animations: AnimationSettings; // Motion preferences
}

enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'           // Follow OS preference
}

interface ColorScheme {
  primary: string;            // Primary brand color
  accent: string;             // Accent color
  background: string;         // Background color
  text: string;              // Text color
  border: string;            // Border color
}

interface AccessibilitySettings {
  highContrast: boolean;      // High contrast mode
  reduceMotion: boolean;      // Reduced motion preference
  fontSize: FontSize;         // Text size preference
  focusVisible: boolean;      // Enhanced focus indicators
}

enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
}

interface AnimationSettings {
  enableTransitions: boolean; // CSS transitions
  enableAnimations: boolean;  // Complex animations
  transitionSpeed: number;    // Animation duration multiplier
  easingPreference: string;   // CSS easing function
}
```

## State Management Architecture

### Zustand Store Structure
The application uses a single Zustand store with domain-specific slices.

```typescript
interface ChatStore {
  // Conversation State
  conversation: ConversationSession;

  // UI State
  theme: ThemePreference;
  ui: UIState;

  // Actions
  actions: ChatActions;
}

interface UIState {
  isLoading: boolean;         // Global loading state
  error: string | null;       // Current error message
  inputValue: string;         // Current input text
  isInputFocused: boolean;    // Input focus state
  sourcesPanelOpen: boolean;  // Sources panel visibility
  selectedMessage: string | null; // Currently selected message
}

interface ChatActions {
  // Message Actions
  sendMessage: (content: string) => Promise<void>;
  cancelMessage: (messageId: string) => void;
  copyMessage: (messageId: string) => void;

  // Streaming Actions
  startStreaming: (messageId: string) => void;
  updateStreamingContent: (content: string) => void;
  completeStreaming: (sources: SourceAttribution[]) => void;

  // Theme Actions
  setTheme: (mode: ThemeMode) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;

  // UI Actions
  setError: (error: string | null) => void;
  toggleSourcesPanel: () => void;
  selectMessage: (messageId: string | null) => void;
  updateInputValue: (value: string) => void;
}
```

## Data Flow Patterns

### Message Lifecycle
1. **User Input**: User types message → UI updates input state
2. **Optimistic Update**: Message added with SENDING status
3. **API Request**: Send to backend with OpenAI streaming
4. **Stream Response**: AI response streams in real-time
5. **Source Attribution**: Sources added when streaming completes
6. **Final State**: Message marked COMPLETE with sources

### Error Handling
1. **Network Errors**: Automatic retry with exponential backoff
2. **Stream Interruption**: Graceful degradation, partial content saved
3. **Validation Errors**: User feedback with correction suggestions
4. **Rate Limiting**: Queue messages, inform user of delays

### Persistence Strategy
- **Session Storage**: Current conversation (cleared on close)
- **Local Storage**: Theme preferences, accessibility settings
- **No Persistence**: Message content (privacy consideration)
- **Cache**: Source previews (IndexedDB for offline access)

## Validation Rules

### Message Validation
- Content: 1-4000 characters, no only whitespace
- Role: Must be 'user' or 'assistant'
- Timestamp: Must be valid Date object
- Status: Must match MessageStatus enum

### Source Validation
- Document ID: Must be non-empty string
- Confidence: Must be number between 0 and 1
- Snippet: Maximum 500 characters
- URLs: Must be valid URL format

### Theme Validation
- Mode: Must match ThemeMode enum
- Colors: Must be valid CSS color values
- Font size: Must match FontSize enum
- Animation speed: Must be positive number

## Performance Considerations

### Memory Management
- **Message Limit**: Maximum 1000 messages per session
- **LRU Cache**: Source previews with 50MB limit
- **Cleanup**: Remove old sessions after 24 hours
- **Virtualization**: Only render visible messages in DOM

### Update Optimization
- **Immutable Updates**: Zustand with immer for state updates
- **Selective Re-renders**: React.memo for message components
- **Debounced Actions**: Input handling, source loading
- **Batch Updates**: Group streaming updates for smooth display

---

**Status**: ✅ Phase 1 Complete
**Next**: Contract generation and test creation
**Dependencies**: OpenAI API types, document service interfaces
