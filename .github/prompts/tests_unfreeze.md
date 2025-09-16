## GitHub Copilot Agent Prompt Template: Vitest Watch Mode Issue

### Technical Context

```markdown
## Issue: Vitest Hanging in Watch Mode During Agent Execution

### Problem Statement
- Running `npm run test` via GitHub Copilot agent in VS Code terminal
- Vitest enters watch mode after test completion: "PASS Waiting for file changes..."
- Process doesn't exit, freezing agent execution
- Agent cannot complete task or accept new commands

### Current Configuration
```json
"scripts": {
  "test": "vitest",           // ← PROBLEM: Watch mode by default
  "test:run": "vitest run",   // ← SOLUTION: Single run mode
  "test:coverage": "vitest --coverage"
}
```

### Requirements

1. **CRITICAL**: Tests must run once and exit cleanly
2. **HIGH**: Maintain existing test functionality and coverage
3. **MEDIUM**: Preserve watch mode option for development

### Requested Actions

**Immediate Fix:**

1. Analyze current npm scripts configuration
2. Identify why `npm run test` hangs in watch mode
3. Modify the problematic script to run tests once and exit
4. Verify the fix works in VS Code terminal context

**Expected Outcome:**

- `npm run test` executes tests and exits with status code
- Agent can complete execution without manual intervention
- Existing test:run, test:coverage scripts remain functional
- Development workflow (watch mode) still available via separate command

### Solution Options to Evaluate

1. Change `"test": "vitest"` to `"test": "vitest run"`
2. Add `--run` flag to existing test script
3. Create environment-specific test commands
4. Configure vitest.config to detect CI/automation context

### Validation Steps

1. Run `npm run test` in VS Code terminal
2. Confirm process exits after test completion
3. Verify exit codes (0 for pass, 1+ for fail)
4. Test agent can continue execution after test completion

### Context Notes

- Using VS Code terminal exclusively
- GitHub Copilot agent integration required
- No manual intervention acceptable (no 'q' to quit)
- Preserve existing script ecosystem

### Agent Instruction Summary

**Fix the vitest watch mode hang by modifying npm scripts to run tests once and exit cleanly. Prioritize immediate resolution over configuration complexity.**
