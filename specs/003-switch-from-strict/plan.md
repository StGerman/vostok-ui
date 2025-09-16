# Implementation Plan: Switch to Recommended TypeScript Settings

**Branch**: `003-switch-from-strict` | **Date**: September 16, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-switch-from-strict/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Switch TypeScript configuration from strict mode to recommended settings to improve developer experience while maintaining essential type safety. This involves modifying tsconfig.app.json to relax overly restrictive rules like `noImplicitAny` and `strictNullChecks` while preserving core functionality and build process stability.

## Technical Context
**Language/Version**: TypeScript 5.2+ with React 19
**Primary Dependencies**: Vite, React, Zustand, TailwindCSS, Vitest, Playwright
**Storage**: Browser localStorage for preferences, memory for state
**Testing**: Vitest for unit tests, Playwright for e2e tests
**Target Platform**: Modern web browsers (ES2022 support)
**Project Type**: Single project (frontend web application)
**Performance Goals**: Fast development iteration, stable build times
**Constraints**: Must maintain backward compatibility, no breaking changes to existing code
**Scale/Scope**: Single TypeScript configuration affecting ~30 source files, existing test suite must pass

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (single frontend application) ✅
- Using framework directly? Yes (direct TypeScript/Vite configuration) ✅
- Single data model? Yes (TypeScript configuration options) ✅
- Avoiding patterns? Yes (direct config modification, no abstraction layers) ✅

**Architecture**:
- EVERY feature as library? N/A (configuration change, not new functionality)
- Libraries listed: N/A (modifying existing build configuration)
- CLI per library: N/A (using existing npm scripts)
- Library docs: N/A (configuration documentation only)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes (tests must verify config changes work) ✅
- Git commits show tests before implementation? Yes (will add validation tests first) ✅
- Order: Contract→Integration→E2E→Unit strictly followed? Yes (config validation → build tests → e2e) ✅
- Real dependencies used? Yes (actual TypeScript compiler, not mocks) ✅
- Integration tests for: config changes (TypeScript compilation, build process) ✅
- FORBIDDEN: Implementation before test, skipping RED phase ✅

**Observability**:
- Structured logging included? N/A (configuration change only)
- Frontend logs → backend? N/A (no runtime logging changes)
- Error context sufficient? Yes (TypeScript compiler errors remain informative)

**Versioning**:
- Version number assigned? Yes (will increment BUILD version) ✅
- BUILD increments on every change? Yes ✅
- Breaking changes handled? Yes (validated that no breaking changes occur) ✅

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - This is a configuration change to an existing React TypeScript application

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Configuration validation → contract test tasks [P]
- Build system verification → integration test tasks [P]
- TypeScript configuration → implementation tasks
- Validation scenarios → verification tasks

**Specific Task Categories**:
1. **Configuration Tests** [P]: Validate tsconfig changes work correctly
2. **Build System Tests** [P]: Verify Vite, TypeScript compilation, development server
3. **Test Suite Validation** [P]: Ensure existing tests continue passing
4. **Implementation Tasks**: Update TypeScript configuration files
5. **Validation Tasks**: Execute quickstart scenarios and performance checks

**Ordering Strategy**:
- TDD order: Configuration validation tests before config changes
- Dependency order: Configuration → Build validation → Test execution
- Mark [P] for parallel execution (different systems/files)
- Sequential for configuration file modifications

**Expected Task Structure**:
- Setup & Validation Preparation (T001-T005)
- Configuration Tests [P] (T006-T010)
- Implementation Changes (T011-T015)
- System Validation [P] (T016-T020)
- Performance & Documentation (T021-T025)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no deviations)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
