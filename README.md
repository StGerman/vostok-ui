# Vostok Chat Interface

A production-ready React application that provides a modern chat interface for the Vostok RAG (Retrieval-Augmented Generation) system.

## ✨ Features

- **🚀 Modern Stack**: React 19, TypeScript 5.2+ (recommended settings), Zustand, TailwindCSS
- **♿ Accessibility First**: WCAG 2.1 AA compliant with live regions for screen readers
- **🌙 Theme Support**: Light/dark mode with system preference detection
- **📱 Responsive Design**: Mobile-first approach with smooth animations
- **🔄 Streaming Responses**: Real-time AI responses with OpenAI SDK integration
- **📚 Source Attribution**: Document references and citations
- **⚡ Performance Optimized**: React.memo, virtualization, and error boundaries
- **🧪 Comprehensive Testing**: Unit, integration, and E2E tests

## 🔧 TypeScript Configuration

This project uses **TypeScript recommended settings** for optimal developer experience:

```json
{
  "strict": false,
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

This configuration provides:
- **Flexible Development**: Less restrictive type checking for faster iteration
- **Essential Safety**: Unused variables and fallthrough case detection
- **Production Ready**: Full compilation and build system compatibility

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
