# Baseline Behavior: Strict TypeScript Mode

**Date**: September 16, 2025
**Branch**: `003-switch-from-strict`
**Configuration**: Strict mode enabled

## Current TypeScript Configuration

### `tsconfig.app.json` (Current Strict Settings)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx"
  }
}
```

## Build System Behavior

### Performance Metrics
- **TypeScript type-check**: ~0.200 seconds total
- **Full build**: ~3.509 seconds total
- **Bundle size**: 395.32 kB (121.23 kB gzipped)

### Compilation Behavior
- Strict null checking enforced
- Implicit `any` types not allowed
- All type annotations required
- Strict function type checking
- Unused variables/parameters reported as errors

## Development Experience

### IDE Integration (VS Code)
- Type errors shown as red squiggly lines
- IntelliSense provides strict type suggestions
- Auto-completion requires precise type matching
- Refactoring tools work with full type information

### Common Developer Friction Points
1. **Implicit Any Errors**: Functions without explicit return types cause errors
2. **Null/Undefined Checks**: Requires explicit null checking for all potentially undefined values
3. **Strict Function Parameters**: All parameters must be explicitly typed
4. **Object Property Access**: Requires type guards for dynamic property access

### Error Examples (Current Strict Mode)
```typescript
// These would cause errors in strict mode:
function processData(data) { // Error: Parameter 'data' implicitly has an 'any' type
  return data.value;
}

let user = { name: "John" };
console.log(user.age); // Error: Property 'age' does not exist on type

let value: string | null = getValue();
console.log(value.length); // Error: Object is possibly 'null'
```

## Test Suite Behavior

### Current Test Results
- Unit tests: All passing with strict type checking
- Integration tests: Type-safe mocks required
- E2E tests: Full type checking during compilation

### Test Compilation
- All test files must pass strict type checking
- Mock objects require explicit typing
- Type assertions needed for test scenarios

## Expected Changes After Migration

### What Should Improve
- Faster development iteration
- Less blocking type errors during development
- More permissive IDE experience
- Reduced need for explicit type annotations

### What Should Remain
- Core functionality unchanged
- Build output identical
- Test suite continues passing
- Essential type safety preserved

## Rollback Criteria

If any of these behaviors regress after migration:
- Build process fails
- Test suite stops passing
- Runtime errors increase
- Bundle output changes significantly
- Development server stops working

Then rollback to strict mode using backup files in `backup/tsconfig-strict-backup/`.
