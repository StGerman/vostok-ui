# Tasks: Switch to Recommended TypeScript Settings

**Input**: Design documents from `/specs/003-switch-from-strict/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Implementation plan loaded successfully
   → Tech stack: TypeScript 5.2+ with React 19, Vite, Vitest, Playwright
2. Load optional design documents:
   → data-model.md: ✅ 3 entities identified → validation tasks
   → contracts/: ✅ Build system contracts → contract test tasks
   → research.md: ✅ Technical decisions → setup tasks
   → quickstart.md: ✅ 5 test scenarios → validation tasks
3. Generate tasks by category:
   → Setup: Backup and preparation tasks
   → Tests: Configuration validation, build system, test suite
   → Core: TypeScript configuration changes
   → Integration: Build system validation, development server testing
   → Polish: Performance testing, documentation, rollback procedures
4. Apply task rules:
   → Different files/systems = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✅ All contracts have tests
   → ✅ All entities have validation tasks
   → ✅ All test scenarios covered
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/systems, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Repository structure follows React TypeScript pattern
- All paths relative to repository root `/Users/sgerman/vostok/vostok-ui/`

## Phase 3.1: Setup & Preparation
- [ ] **T001** Create backup of current TypeScript configuration files in `backup/tsconfig-strict-backup/`
- [ ] **T002** [P] Record baseline performance metrics using `time npm run build` and `time npm run type-check`
- [ ] **T003** [P] Document current strict mode behavior in `specs/003-switch-from-strict/baseline-behavior.md`
- [ ] **T004** [P] Validate current build system works correctly with `npm run build && npm run test`

## Phase 3.2: Contract & Integration Tests (TDD ENFORCED)
- [ ] **T006** [P] Execute all tests in `tests/contract/` to confirm they fail with strict settings

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Configuration Changes
- [ ] **T012** Update TypeScript configuration in `tsconfig.app.json` - change `strict: true` to `strict: false`
- [ ] **T013** Update TypeScript configuration in `tsconfig.app.json` - change `noImplicitAny: true` to `noImplicitAny: false`
- [ ] **T014** Update TypeScript configuration in `tsconfig.app.json` - change `strictNullChecks: true` to `strictNullChecks: false`
- [ ] **T015** Verify TypeScript configuration in `tsconfig.app.json` - keep `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch: true`

## Phase 3.4: System Validation

### Build System Validation [P]
- [ ] **T016** [P] Validate TypeScript compilation with `npm run type-check` succeeds with recommended settings
- [ ] **T017** [P] Validate Vite build process with `npm run build` completes successfully
- [ ] **T018** [P] Validate development server with `npm run dev` starts and functions correctly
- [ ] **T019** [P] Validate generated bundle output in `dist/` directory is functionally equivalent

### Test Suite Validation [P]
- [ ] **T020** [P] Execute unit test suite with `npm run test` to ensure all tests pass
- [ ] **T021** [P] Execute end-to-end test suite with `npm run test:e2e` to verify functionality
- [ ] **T022** [P] Validate test coverage with `npm run test:coverage` remains accurate

## Phase 3.5: Experience Validation & Polish

### Development Experience Testing
- [ ] **T025** Verify ESLint integration with `npm run lint` continues working independently

### Performance & Documentation [P]
- [ ] **T029** [P] Execute all quickstart validation scenarios from `specs/003-switch-from-strict/quickstart.md`

## Dependencies

### Phase Dependencies
- **Setup (T001-T004)** before everything else
- **Tests (T005-T011)** before implementation (T012-T015) - **TDD ENFORCED**
- **Core Implementation (T012-T015)** before validation (T016-T025)
- **System Validation (T016-T022)** before experience testing (T023-T029)

### Specific Task Dependencies
- T001 (backup) blocks T012-T015 (config changes)
- T002 (baseline metrics) blocks T026 (performance comparison)
- T005-T011 (tests) must fail before T012-T015 (implementation)
- T012-T015 (config changes) block T016-T022 (validation)
- T016-T019 (build validation) block T023-T025 (experience testing)

## Parallel Execution Examples

### Phase 3.2: All Contract & Integration Tests [P]
```bash
# Launch T005-T011 together (different test files):
Task: "Create TypeScript configuration contract test in tests/contract/test_typescript_config.test.ts"
Task: "Create Vite build contract test in tests/contract/test_vite_build.test.ts"
Task: "Create development server contract test in tests/contract/test_dev_server.test.ts"
Task: "Create test suite validation contract in tests/contract/test_suite_validation.test.ts"
Task: "Create build process integration test in tests/integration/test_build_process.test.ts"
Task: "Create development experience validation test in tests/integration/test_dev_experience.test.ts"
Task: "Create TypeScript compilation integration test in tests/integration/test_typescript_compilation.test.ts"
```

### Phase 3.4: All Build System Validation [P]
```bash
# Launch T016-T019 together (different systems):
Task: "Validate TypeScript compilation with npm run type-check"
Task: "Validate Vite build process with npm run build"
Task: "Validate development server with npm run dev"
Task: "Validate generated bundle output in dist/ directory"
```

### Phase 3.4: All Test Suite Validation [P]
```bash
# Launch T020-T022 together (different test suites):
Task: "Execute unit test suite with npm run test"
Task: "Execute end-to-end test suite with npm run test:e2e"
Task: "Validate test coverage with npm run test:coverage"
```

### Phase 3.5: All Documentation & Polish [P]
```bash
# Launch T026-T029 together (different deliverables):
Task: "Compare build performance metrics between strict and recommended settings"
Task: "Update project documentation in README.md"
Task: "Create rollback procedure documentation"
Task: "Execute all quickstart validation scenarios"
```

## Critical Success Metrics

### Configuration Validation
- [ ] TypeScript compilation succeeds with recommended settings (`npm run type-check` passes)
- [ ] All configuration contract tests pass
- [ ] Build system continues working without errors

### Functionality Preservation
- [ ] All existing unit tests continue to pass without modification
- [ ] All end-to-end tests continue to pass
- [ ] Generated bundle output is functionally equivalent
- [ ] Development server starts and functions correctly

### Development Experience Improvements
- [ ] IDE shows warnings instead of blocking errors for implicit any usage
- [ ] Code completion and IntelliSense continue working effectively
- [ ] Build time is same or faster than with strict settings
- [ ] Developer can write code that previously failed strict mode

### Rollback Capability
- [ ] Backup procedure works correctly
- [ ] Configuration can be reverted to strict mode if needed
- [ ] Rollback validation confirms return to previous working state

## Notes
- **[P] tasks** = different files/systems, no dependencies, can run in parallel
- **TDD CRITICAL**: Verify tests fail before implementing (T005-T011 must fail before T012-T015)
- **Configuration Safety**: Always backup before making changes (T001 before T012-T015)
- **Validation Order**: Build validation before experience testing
- Commit after each completed task for clear progress tracking

## Task Generation Rules Applied
✅ **From Contracts**: Each build system contract → contract test task [P]
✅ **From Data Model**: Each entity (Configuration, Build State, Dev Environment) → validation task [P]
✅ **From Quickstart**: Each test scenario → validation task
✅ **Ordering**: Setup → Tests → Implementation → Validation → Polish
✅ **Dependencies**: Tests before implementation, configuration before validation

## Validation Checklist
✅ **All contracts have corresponding tests** (T005-T008)
✅ **All entities have validation tasks** (T016-T025)
✅ **All quickstart scenarios covered** (T029)
✅ **Parallel tasks truly independent** (different files/systems confirmed)
✅ **Each task specifies exact file path** (all paths included)
✅ **No task modifies same file as another [P] task** (verified)
