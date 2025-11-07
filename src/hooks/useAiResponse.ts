'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AiRequest, AiResponse, AiStreamChunk, ApiError } from '@/types/ai';

interface UseAiResponseOptions {
  enableStreaming?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

interface UseAiResponseState {
  response: AiResponse | null;
  isLoading: boolean;
  error: ApiError | null;
  streamContent: string;
  confidence: number;
  summary: string;
  isStreaming: boolean;
}

interface UseAiResponseReturn extends UseAiResponseState {
  generateResponse: (request: AiRequest) => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useAiResponse(options: UseAiResponseOptions = {}): UseAiResponseReturn {
  const {
    enableStreaming = false,
    retryCount = 3,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  const [state, setState] = useState<UseAiResponseState>({
    response: null,
    isLoading: false,
    error: null,
    streamContent: '',
    confidence: 0,
    summary: '',
    isStreaming: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setState({
      response: null,
      isLoading: false,
      error: null,
      streamContent: '',
      confidence: 0,
      summary: '',
      isStreaming: false,
    });
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
      error: {
        error: 'Request cancelled',
        code: 'CANCELLED',
      },
    }));
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const generateResponse = useCallback(async (request: AiRequest) => {
    reset();
    setState(prev => ({ ...prev, isLoading: true }));

    let currentRetry = 0;

    const attemptRequest = async (): Promise<void> => {
      if (currentRetry > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(enableStreaming && { Accept: 'text/event-stream' }),
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw errorData;
        }

        if (enableStreaming && response.headers.get('content-type')?.includes('text/event-stream')) {
          // Handle streaming response
          setState(prev => ({ ...prev, isStreaming: true }));
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let streamContent = '';

          if (!reader) {
            throw new Error('Unable to read response stream');
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6)) as AiStreamChunk;
                    
                    if (data.error) {
                      throw new Error(data.error);
                    }

                    if (data.content) {
                      streamContent += data.content;
                      setState(prev => ({
                        ...prev,
                        streamContent,
                      }));
                    }

                    if (data.confidence !== undefined) {
                      setState(prev => ({
                        ...prev,
                        confidence: data.confidence,
                      }));
                    }

                    if (data.summary) {
                      setState(prev => ({
                        ...prev,
                        summary: data.summary,
                      }));
                    }

                    if (data.done) {
                      const finalResponse: AiResponse = {
                        content: streamContent,
                        confidence: data.confidence || 0,
                        summary: data.summary || '',
                        model: 'deepseek/deepseek-chat',
                        timestamp: new Date().toISOString(),
                      };

                      setState(prev => ({
                        ...prev,
                        response: finalResponse,
                        isLoading: false,
                        isStreaming: false,
                      }));
                      return;
                    }
                  } catch (parseError) {
                    console.error('Error parsing stream chunk:', parseError);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } else {
          // Handle non-streaming response
          const data: AiResponse = await response.json();
          setState(prev => ({
            ...prev,
            response: data,
            confidence: data.confidence,
            summary: data.summary,
            streamContent: data.content,
            isLoading: false,
          }));
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Request was cancelled
        }

        const apiError = error as ApiError;
        
        if (currentRetry < retryCount && apiError.code !== 'INVALID_REQUEST' && apiError.code !== 'RATE_LIMIT_EXCEEDED') {
          currentRetry++;
          retryTimeoutRef.current = setTimeout(() => {
            attemptRequest();
          }, retryDelay * currentRetry);
          return;
        }

        setState(prev => ({
          ...prev,
          error: apiError,
          isLoading: false,
          isStreaming: false,
        }));
      }
    };

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (state.isLoading) {
        cancel();
        setState(prev => ({
          ...prev,
          error: {
            error: 'Request timeout',
            code: 'TIMEOUT',
          },
          isLoading: false,
          isStreaming: false,
        }));
      }
    }, timeout);

    try {
      await attemptRequest();
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
    }
  }, [reset, cancel, enableStreaming, retryCount, retryDelay, timeout, state.isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    generateResponse,
    reset,
    cancel,
  };
}