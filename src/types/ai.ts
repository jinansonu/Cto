export interface AiRequest {
  mode: 'chat' | 'analyze' | 'summarize';
  question: string;
  context?: string;
  userSettings?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface AiResponse {
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

export interface AiStreamChunk {
  content?: string;
  confidence?: number;
  summary?: string;
  done?: boolean;
  error?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}