# AI Service App

A Next.js application demonstrating a reusable AI service layer that integrates with OpenRouter and DeepSeek API.

## Features

- **AI Service Layer**: Reusable service module with OpenRouter integration
- **Next.js API Route**: `/api/ai` endpoint with streaming support
- **React Hook**: `useAiResponse` hook with retry/cancellation support
- **Rate Limiting**: Built-in rate limiting for API protection
- **Error Handling**: Structured error responses with proper validation
- **Streaming**: Optional streaming responses for real-time AI interactions
- **TypeScript**: Full TypeScript support with type definitions
- **Testing**: Comprehensive unit tests for all components

## Architecture

### Service Layer (`src/lib/ai-service.ts`)
- Handles OpenRouter API integration
- Prompt enrichment based on mode (chat/analyze/summarize)
- Response normalization with confidence scoring
- Streaming and non-streaming response generation
- Request validation

### API Route (`src/app/api/ai/route.ts`)
- Next.js route handler at `/api/ai`
- Rate limiting (10 requests per minute per IP)
- Request validation and error handling
- Support for both streaming and non-streaming responses
- Structured error responses

### React Hook (`src/hooks/useAiResponse.ts`)
- `useAiResponse` hook for client-side consumption
- Retry logic with exponential backoff
- Request cancellation support
- Timeout handling
- Streaming response handling

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-service-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AI Service App
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Usage

### Non-Streaming Request
```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mode: 'chat',
    question: 'What is the meaning of life?',
    context: 'Provide a philosophical perspective',
    userSettings: {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'deepseek/deepseek-chat'
    }
  })
});

const data = await response.json();
```

### Streaming Request
```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  },
  body: JSON.stringify({
    mode: 'chat',
    question: 'Tell me a story'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data);
    }
  }
}
```

## Hook Usage

```javascript
import { useAiResponse } from '@/hooks/useAiResponse';

function MyComponent() {
  const {
    response,
    isLoading,
    error,
    streamContent,
    confidence,
    summary,
    generateResponse,
    reset,
    cancel
  } = useAiResponse({ 
    enableStreaming: true,
    retryCount: 3,
    timeout: 30000
  });

  const handleGenerate = async () => {
    await generateResponse({
      mode: 'chat',
      question: 'What is AI?',
      userSettings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Generate Response'}
      </button>
      
      {error && <div>Error: {error.error}</div>}
      
      {streamContent && <div>{streamContent}</div>}
      
      {response && (
        <div>
          <p>{response.content}</p>
          <p>Confidence: {response.confidence}</p>
          <p>Summary: {response.summary}</p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Request Format
```typescript
interface AiRequest {
  mode: 'chat' | 'analyze' | 'summarize';
  question: string;
  context?: string;
  userSettings?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}
```

### Response Format
```typescript
interface AiResponse {
  content: string;
  confidence: number;
  summary: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  timestamp: string;
}
```

### Streaming Chunk Format
```typescript
interface AiStreamChunk {
  content?: string;
  confidence?: number;
  summary?: string;
  done?: boolean;
  error?: string;
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes:
- AI service unit tests
- API route handler tests
- React hook tests
- Mock implementations for external dependencies

## Rate Limiting

The API includes rate limiting to prevent abuse:
- 10 requests per minute per IP address
- In-memory storage (use Redis in production)
- Automatic cleanup of expired entries

## Error Handling

The service provides structured error responses:
```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: any;
}
```

Common error codes:
- `INVALID_JSON`: Malformed request body
- `INVALID_REQUEST`: Invalid request format
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `TIMEOUT`: Request timeout
- `CANCELLED`: Request cancelled
- `INTERNAL_ERROR`: Server error

## Configuration

### Environment Variables
- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
- `NEXT_PUBLIC_APP_URL`: Application URL (default: http://localhost:3000)
- `NEXT_PUBLIC_APP_NAME`: Application name (default: AI Service App)

### Default Settings
- Model: `deepseek/deepseek-chat`
- Temperature: 0.7
- Max Tokens: 1000
- Rate Limit: 10 requests/minute
- Request Timeout: 30 seconds

## License

MIT License
