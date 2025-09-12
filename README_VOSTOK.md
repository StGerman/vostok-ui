# Vostok RAG Chat Interface

A production-ready React + TypeScript chat interface for the Vostok RAG system, built with modern web technologies and designed for optimal user experience.

## Features

### 🎨 Modern UI/UX
- Clean, minimalistic design inspired by LangUI
- Dark/light mode with smooth transitions
- Responsive design for desktop and mobile
- Smooth animations and micro-interactions

### 💬 Advanced Chat Features
- Real-time messaging with the RAG API
- Markdown rendering for assistant responses
- Message copying and exporting
- Conversation persistence
- Typing indicators and loading states

### ⚙️ Intelligent Configuration
- Adjustable AI parameters (temperature, max tokens, context chunks)
- Real-time settings with visual feedback
- Token usage tracking and cost estimation
- Model selection (Claude Sonnet, Haiku, Opus)

## Getting Started

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env to set your API endpoint (default: http://localhost:8000)
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`

## Tech Stack

- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **TanStack Query** for API state management
- **Lucide React** for icons
- **React Markdown** for message formatting
- **Vite** for build tooling

## API Integration

The interface connects to your Vostok RAG API at `/v1/chat/completions` endpoint with OpenAI-compatible format.

## Usage

1. Start your Vostok RAG API server on port 8000
2. Launch the chat interface with `npm run dev`
3. Begin chatting with your RAG system
4. Adjust settings using the settings panel
5. Export conversations as needed

## Production Build

```bash
npm run build
npm run preview
```
