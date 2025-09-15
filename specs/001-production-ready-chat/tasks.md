# Tasks: Production Ready Chat Interface

**Input**: Design documents from `/specs/001-production-ready-chat/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/api-contracts.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: React 19 + TypeScript, Zustand, TailwindCSS, OpenAI SDK
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → Message, SourceAttribution, ConversationSession, ThemePreference
   → contracts/: api-contracts.md → Chat completions, document endpoints
   → research.md: Extract decisions → React 19, Zustand, Framer Motion, Playwright
3. Generate tasks by category:
   → Setup: Vite project, React 19, dependencies, ESLint
   → Tests: API contract tests, component tests, E2E tests
   → Core: TypeScript interfaces, Zustand stores, React components
   → Integration: OpenAI SDK, theme persistence, streaming
   → Polish: unit tests, accessibility audits, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests? ✓
   → All entities have models? ✓
   → All components implemented? ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend app**: `src/`, `tests/` at repository root
- All paths relative to `/Users/sgerman/vostok/vostok-ui/`

## Phase 3.1: Setup
- [ ] T001 Update Vite config and dependencies per React 19 implementation plan
- [ ] T002 Configure TypeScript with strict mode and React 19 types
- [ ] T003 [P] Configure ESLint with jsx-a11y plugin for accessibility linting
- [ ] T004 [P] Setup TailwindCSS with custom theme configuration
- [ ] T005 [P] Configure Vitest for unit testing with React Testing Library

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test POST /v1/chat/completions streaming in tests/contract/test_chat_completions.test.ts
- [ ] T007 [P] Contract test GET /documents/{document_id} in tests/contract/test_documents.test.ts
- [ ] T008 [P] Contract test GET /documents/search in tests/contract/test_document_search.test.ts
- [ ] T009 [P] Integration test streaming message flow in tests/integration/test_streaming.test.ts
- [ ] T010 [P] Integration test theme persistence in tests/integration/test_theme.test.ts
- [ ] T011 [P] Integration test source attribution in tests/integration/test_sources.test.ts
- [ ] T012 [P] E2E test complete conversation flow in tests/e2e/test_conversation.spec.ts
- [ ] T013 [P] E2E test accessibility compliance in tests/e2e/test_accessibility.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T014 [P] Message interface and types in src/types/chat.ts
- [ ] T015 [P] SourceAttribution interface and types in src/types/sources.ts
- [ ] T016 [P] ConversationSession interface and types in src/types/conversation.ts
- [ ] T017 [P] ThemePreference interface and types in src/types/theme.ts
- [ ] T018 [P] Chat store with Zustand in src/stores/chatStore.ts
- [ ] T019 [P] Theme store with Zustand in src/stores/themeStore.ts
- [ ] T020 [P] Streaming service with OpenAI SDK in src/services/streamingService.ts
- [ ] T021 [P] Theme service with localStorage in src/services/themeService.ts
- [ ] T022 [P] Source service for attribution in src/services/sourceService.ts
- [ ] T023 [P] MessageBubble component in src/components/MessageBubble.tsx
- [ ] T024 [P] ChatInput component in src/components/ChatInput.tsx
- [ ] T025 [P] TypingIndicator component in src/components/TypingIndicator.tsx
- [ ] T026 [P] ChatSettings component in src/components/ChatSettings.tsx
- [ ] T027 ChatInterface main component in src/ChatInterface.tsx
- [ ] T028 Update App.tsx with ChatInterface integration

## Phase 3.4: Integration
- [ ] T029 OpenAI SDK integration with streaming handlers
- [ ] T030 Theme persistence with system preference detection
- [ ] T031 Source attribution with document preview
- [ ] T032 Error boundary components for graceful error handling
- [ ] T033 Accessibility live regions for streaming content
- [ ] T034 Performance optimization with React.memo and virtualization

## Phase 3.5: Polish
- [ ] T035 [P] Unit tests for MessageBubble in tests/unit/MessageBubble.test.tsx
- [ ] T036 [P] Unit tests for ChatInput in tests/unit/ChatInput.test.tsx
- [ ] T037 [P] Unit tests for streaming service in tests/unit/streamingService.test.ts
- [ ] T038 [P] Unit tests for theme service in tests/unit/themeService.test.ts
- [ ] T039 [P] Performance tests for virtualization in tests/performance/test_virtualization.test.ts
- [ ] T040 [P] Accessibility audit with axe-core in tests/accessibility/test_axe.test.ts
- [ ] T041 [P] Update README with setup instructions
- [ ] T042 Code cleanup and remove TODOs
- [ ] T043 Run quickstart.md validation scenarios

## Dependencies
- Setup (T001-T005) before all other phases
- Tests (T006-T013) before implementation (T014-T034)
- Types (T014-T017) before stores and services (T018-T022)
- Services (T018-T022) before components (T023-T026)
- Individual components (T023-T026) before main component (T027)
- T027 blocks T028 (App.tsx integration)
- Core implementation (T014-T028) before integration (T029-T034)
- Integration (T029-T034) before polish (T035-T043)

## Parallel Example
```bash
# Launch T006-T013 together (Phase 3.2 - Contract & Integration Tests):
Task: "Contract test POST /v1/chat/completions streaming in tests/contract/test_chat_completions.test.ts"
Task: "Contract test GET /documents/{document_id} in tests/contract/test_documents.test.ts"
Task: "Contract test GET /documents/search in tests/contract/test_document_search.test.ts"
Task: "Integration test streaming message flow in tests/integration/test_streaming.test.ts"
Task: "Integration test theme persistence in tests/integration/test_theme.test.ts"
Task: "Integration test source attribution in tests/integration/test_sources.test.ts"
Task: "E2E test complete conversation flow in tests/e2e/test_conversation.spec.ts"
Task: "E2E test accessibility compliance in tests/e2e/test_accessibility.spec.ts"

# Launch T014-T026 together (Phase 3.3 - Core Implementation):
Task: "Message interface and types in src/types/chat.ts"
Task: "SourceAttribution interface and types in src/types/sources.ts"
Task: "ConversationSession interface and types in src/types/conversation.ts"
Task: "ThemePreference interface and types in src/types/theme.ts"
Task: "Chat store with Zustand in src/stores/chatStore.ts"
Task: "Theme store with Zustand in src/stores/themeStore.ts"
Task: "Streaming service with OpenAI SDK in src/services/streamingService.ts"
Task: "Theme service with localStorage in src/services/themeService.ts"
Task: "Source service for attribution in src/services/sourceService.ts"
Task: "MessageBubble component in src/components/MessageBubble.tsx"
Task: "ChatInput component in src/components/ChatInput.tsx"
Task: "TypingIndicator component in src/components/TypingIndicator.tsx"
Task: "ChatSettings component in src/components/ChatSettings.tsx"

# Launch T035-T041 together (Phase 3.5 - Polish Tests & Documentation):
Task: "Unit tests for MessageBubble in tests/unit/MessageBubble.test.tsx"
Task: "Unit tests for ChatInput in tests/unit/ChatInput.test.tsx"
Task: "Unit tests for streaming service in tests/unit/streamingService.test.ts"
Task: "Unit tests for theme service in tests/unit/themeService.test.ts"
Task: "Performance tests for virtualization in tests/performance/test_virtualization.test.ts"
Task: "Accessibility audit with axe-core in tests/accessibility/test_axe.test.ts"
Task: "Update README with setup instructions"
```

## Notes
- [P] tasks = different files, no dependencies between them
- All contract and integration tests must fail before implementation starts
- Each component test must verify accessibility (WCAG 2.1 AA)
- Performance tests must validate <3s response time, 60fps animations
- Streaming tests must verify OpenAI SDK integration and cancellation
- Theme tests must verify system preference detection and persistence
- Commit after each completed task with descriptive messages

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts** (api-contracts.md):
   - POST /v1/chat/completions → T006 (streaming contract test)
   - GET /documents/{document_id} → T007 (document retrieval test)
   - GET /documents/search → T008 (search contract test)

2. **From Data Model** (data-model.md):
   - Message entity → T014 (Message types)
   - SourceAttribution entity → T015 (Source types)
   - ConversationSession entity → T016 (Conversation types)
   - ThemePreference entity → T017 (Theme types)

3. **From User Stories** (quickstart.md):
   - Basic chat functionality → T009 (streaming integration test)
   - Theme switching → T010 (theme persistence test)
   - Source attribution → T011 (source integration test)
   - Complete conversation flow → T012 (E2E conversation test)
   - Accessibility compliance → T013 (E2E accessibility test)

4. **Ordering**:
   - Setup (T001-T005) → Tests (T006-T013) → Types (T014-T017) → Services & Stores (T018-T022) → Components (T023-T026) → Integration (T027-T034) → Polish (T035-T043)
   - TDD enforced: All tests must be written and failing before implementation

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T006-T008 cover api-contracts.md)
- [x] All entities have model tasks (T014-T017 cover all data-model.md entities)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path (all tasks include specific file locations)
- [x] No task modifies same file as another [P] task (verified file uniqueness)
- [x] All quickstart scenarios have corresponding tests (T009-T013)
- [x] React 19 + TypeScript + Zustand architecture implemented (T001-T028)
- [x] OpenAI streaming protocol fully covered (T006, T009, T020, T029)
- [x] Accessibility compliance enforced (T003, T013, T033, T040)
- [x] Performance requirements validated (T034, T039)
