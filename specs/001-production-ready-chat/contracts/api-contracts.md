# API Contracts: Chat Interface

**Feature**: Production Ready Chat Interface for Vostok RAG System
**Date**: September 13, 2025
**Protocol**: OpenAI Chat Completions API v1 + Vostok RAG Extensions

## Overview

This document defines the API contracts for the chat interface, based on the Vostok RAG System API with full OpenAI Chat Completions compatibility. The implementation includes document source retrieval, RAG-enhanced responses, and WebSocket streaming using the official OpenAI JavaScript library.## Chat Completion Endpoint

### POST /v1/chat/completions

OpenAI-compatible chat completions with advanced RAG capabilities powered by Vostok document collection.

**Request Format (Vostok RAG Extension)**:

```typescript
interface VostokChatCompletionRequest {
  // Standard OpenAI fields
  model: string;                    // LLM model (default: claude-sonnet-4-20250514)
  messages: ChatMessage[];          // Conversation history (min 1 message)
  stream?: boolean;                 // Enable streaming response
  temperature?: number;             // Response randomness (0.0-2.0, default: 0.1)
  max_tokens?: number;             // Maximum response length (1-4000, default: 1000)

  // Vostok RAG-specific parameters
  max_context_chunks?: number;      // Document retrieval limit (1-10, default: 5)
  similarity_threshold?: number;    // Minimum relevance score (0.0-1.0, default: 0.7)

  // OpenAI compatibility (optional)
  top_p?: number;                  // Nucleus sampling parameter
  frequency_penalty?: number;      // Repetition penalty
  presence_penalty?: number;       // Topic diversity penalty
  stop?: string | string[];        // Stop sequences
  user?: string;                   // User identifier
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;                   // Message author name
}
```

**Streaming Response Format (OpenAI Compatible)**:

```typescript
// Server-Sent Events format using OpenAI JavaScript library
interface VostokChatCompletionChunk {
  id: string;                      // Unique completion ID (UUID format)
  object: 'chat.completion.chunk';
  created: number;                 // Unix timestamp
  model: string;                   // Model used (e.g. claude-sonnet-4-20250514)
  choices: VostokStreamChoice[];
}

interface VostokStreamChoice {
  index: number;                   // Choice index (usually 0)
  delta: VostokMessageDelta;       // Incremental content
  finish_reason?: string;          // 'stop', 'length', 'content_filter', etc.
}

interface VostokMessageDelta {
  role?: 'assistant';              // Role (first chunk only)
  content?: string;                // Incremental text content
  // Note: Sources delivered in final chunk when finish_reason = 'stop'
}
```

**Non-Streaming Response Format (OpenAI Compatible)**:

```typescript
interface VostokChatCompletion {
  id: string;                      // Unique completion ID
  object: 'chat.completion';
  created: number;                 // Unix timestamp
  model: string;                   // Model used
  choices: VostokCompletionChoice[];
  usage: VostokTokenUsage;
}

interface VostokCompletionChoice {
  index: number;                   // Choice index (usually 0)
  message: VostokAssistantMessage; // Complete response with sources
  finish_reason: string;           // Completion reason
}

interface VostokAssistantMessage {
  role: 'assistant';
  content: string;                 // Complete response text
  sources?: SourceAttribution[];   // Retrieved document sources
}

interface VostokTokenUsage {
  prompt_tokens: number;           // Input + context tokens
  completion_tokens: number;       // Generated response tokens
  total_tokens: number;            // Sum of prompt + completion
}

interface SourceAttribution {
  id: string;                      // Document ID with 'doc-' prefix
  title?: string;                  // Document title
  content: string;                 // Relevant text snippet
  similarity_score: number;        // Relevance score (0.0-1.0)
  document_url?: string;           // Link to full document
  metadata?: Record<string, any>;  // Additional document metadata
}
```

**Error Response Format**:

```typescript
interface VostokAPIError {
  error: {
    message: string;               // Human-readable error
    type: string;                  // Error category
    param?: string;                // Invalid parameter
    code?: string;                 // Error code
  };
}
```

## Vostok Document Endpoints

### GET /documents/{document_id}

Retrieve specific document by ID with full metadata and content.

**Request Parameters**:
- `document_id`: Document identifier with 'doc-' prefix pattern

**Response Format**:

```typescript
interface VostokDocument {
  id: string;                      // Document ID with 'doc-' prefix
  content: string;                 // Full document content (max 100,000 chars)
  title?: string;                  // Document title (max 500 chars)
  metadata?: Record<string, any>;  // Additional metadata
  created_at: string;              // ISO 8601 creation timestamp
  updated_at: string;              // ISO 8601 update timestamp
  chunk_count: number;             // Number of chunks created
  content_hash: string;            // SHA-256 hash of content
  content_length: number;          // Character count
  embedding_model: string;         // Embedding model (all-MiniLM-L6-v2)
  system_version: string;          // API version
}
```

### GET /documents/search

Semantic similarity search across document collection using vector embeddings.

**Request Parameters**:
- `q`: Search query (required)
- `limit`: Maximum results (1-50, default: 10)

**Response Format**:

```typescript
interface VostokDocumentSearchResponse {
  items: VostokDocument[];         // Matching documents
  query: string;                   // Search query used
  total_found: number;             // Total documents found
  search_time_ms: number;          // Search execution time
}
```

### GET /documents

List documents with pagination support.

**Request Parameters**:
- `skip`: Number of documents to skip (default: 0)
- `limit`: Number of documents to return (1-100, default: 20)

**Response Format**:

```typescript
interface VostokDocumentListResponse {
  items: VostokDocument[];         // Document list
  total: number;                   // Total document count
  page: number;                    // Current page number
  page_size: number;               // Items per page
  total_pages: number;             // Total number of pages
}
```

### GET /documents/stats

Retrieve comprehensive analytics and statistics for document collection.

**Response Format**:

```typescript
interface VostokDocumentStats {
  total_documents: number;         // Complete document count
  total_content_length: number;    // Aggregate character count
  total_chunks: number;            // Total embedding chunks
  last_updated: string;            // ISO 8601 last update time
  embedding_model: string;         // Current embedding model
}
```

## OpenAI JavaScript Library Integration

### Streaming Implementation

Use the official OpenAI JavaScript library for Server-Sent Events streaming.

**Installation**:
```bash
npm install openai
```

**Client Implementation**:

```typescript
import OpenAI from 'openai';

// Initialize client with Vostok RAG endpoint
const openai = new OpenAI({
  baseURL: 'https://api.vostok.example.com/v1',
  apiKey: 'your-api-key',
});

// Stream chat completion with RAG parameters
const stream = await openai.chat.completions.create({
  model: 'claude-sonnet-4-20250514',
  messages: [
    { role: 'user', content: 'What is our refund policy?' }
  ],
  stream: true,
  temperature: 0.1,
  max_tokens: 1000,
  // Vostok RAG extensions
  max_context_chunks: 5,
  similarity_threshold: 0.7,
});

// Process streaming chunks
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    // Update UI with incremental content
    updateMessageContent(content);
  }

  // Handle completion with sources
  if (chunk.choices[0]?.finish_reason === 'stop') {
    const sources = chunk.choices[0]?.message?.sources;
    if (sources) {
      displaySourceAttribution(sources);
    }
  }
}
```

**Error Handling**:

```typescript
try {
  const stream = await openai.chat.completions.create({...});
  // Process stream...
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    console.error('OpenAI API Error:', error.message);
    // Handle specific error types
    switch (error.type) {
      case 'invalid_request_error':
        // Handle validation errors
        break;
      case 'rate_limit_exceeded':
        // Handle rate limiting
        break;
      default:
        // Handle other API errors
    }
  } else {
    console.error('Network Error:', error);
  }
}
```

**Stream Cancellation**:

```typescript
// Create AbortController for cancellation
const controller = new AbortController();

const stream = await openai.chat.completions.create({
  // ... other parameters
  stream: true,
}, {
  signal: controller.signal, // Pass abort signal
});

// Cancel stream when needed
function cancelStream() {
  controller.abort();
}
```

## Authentication & Authorization

### Bearer Token Authentication

All API requests require authentication via Bearer token in the Authorization header.

**Header Format**:
```
Authorization: Bearer <access_token>
```

**Token Validation**:
- Tokens must be valid JWT format
- Tokens expire after 1 hour
- Refresh tokens available for seamless re-authentication
- Invalid tokens return 401 Unauthorized

### Rate Limiting

API endpoints implement rate limiting to ensure fair usage and system stability.

**Rate Limits**:
- Chat completions: 60 requests/minute per user
- Source retrieval: 200 requests/minute per user
- WebSocket connections: 5 concurrent connections per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1694676000
```

## Error Handling

### HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Temporary service outage

### Error Response Format

All errors follow consistent JSON format with actionable error messages.

```typescript
interface ErrorResponse {
  error: {
    code: string;                  // Error code for programmatic handling
    message: string;               // Human-readable error description
    details?: Record<string, any>; // Additional error context
    requestId: string;             // Request ID for support
  };
}
```

**Common Error Codes**:
- `invalid_request` - Malformed request
- `authentication_failed` - Invalid credentials
- `rate_limit_exceeded` - Too many requests
- `model_unavailable` - Requested model not available
- `content_filtered` - Content blocked by filters
- `context_length_exceeded` - Message too long

---

**Contract Status**: ✅ Complete
**Compatibility**: OpenAI Chat Completions API v1 + Vostok RAG System v2.0.0
**Streaming**: Official OpenAI JavaScript library with Server-Sent Events
**Next Phase**: Contract test implementation with Vostok backend integration
