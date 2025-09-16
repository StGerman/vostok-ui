# Test Fixes Checklist

## Immediate Actions Required

### MessageBubble Component Fixes

- [ ] **Fix Test ID**: Change `data-testid="message-bubble"` to `data-testid={`message-${message.role}`}`
  - **File**: `/src/components/MessageBubble.tsx`
  - **Line**: ~80
  - **Impact**: Fixes 7 failing tests

- [ ] **Add Dark Mode Class**: Add `${isDark ? 'dark' : ''}` to container className
  - **File**: `/src/components/MessageBubble.tsx`
  - **Line**: ~80
  - **Impact**: Fixes dark mode styling tests

- [ ] **Implement Source Attribution**: Add source rendering after timestamp
  - **File**: `/src/components/MessageBubble.tsx`
  - **Location**: After timestamp div
  - **Code Needed**:
    ```tsx
    {message.sources && message.sources.length > 0 && (
      <div className="sources-section mt-2">
        {message.sources.map((source, index) => (
          <a key={index} href={source.url} className="source-link">
            {source.title} (Page {source.page}, {Math.round(source.score * 100)}%)
          </a>
        ))}
      </div>
    )}
    ```
  - **Impact**: Fixes source attribution tests

### ChatInput Component Fixes

- [ ] **Fix Test ID**: Add wrapper div with `data-testid="chat-input"`
  - **File**: `/src/components/ChatInput.tsx`
  - **Line**: Around textarea
  - **Impact**: Fixes 9 failing tests

## Verification Steps

1. **Run Single Component Tests**:
   ```bash
   npx vitest run tests/unit/MessageBubble.test.tsx
   npx vitest run tests/unit/ChatInput.test.tsx
   ```

2. **Run All Tests**:
   ```bash
   npm run test
   ```

3. **Expected Result**:
   - All 20 currently failing tests should pass
   - Total: 138/138 tests passing

## Files to Modify

1. `/src/components/MessageBubble.tsx` - 3 changes
2. `/src/components/ChatInput.tsx` - 1 change

## Test Status After Fixes

- **Before**: 118 passing, 20 failing
- **After**: 138 passing, 0 failing (expected)

## Notes

- These are **TDD implementation fixes** - tests were written first
- Source types already exist in `/src/types/sources.ts`
- Architecture is solid, just need UI implementation
- No breaking changes required
