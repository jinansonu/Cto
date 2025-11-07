import { renderHook, act, waitFor } from '@testing-library/react';
import { useAiResponse } from '../useAiResponse';
import { AiRequest } from '@/types/ai';

// Mock fetch
global.fetch = jest.fn();

// Mock AbortController
const mockAbort = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  abort: mockAbort,
  signal: {},
})) as any;

describe('useAiResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAiResponse());

      expect(result.current).toBeDefined();
      expect(result.current.response).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.streamContent).toBe('');
      expect(result.current.confidence).toBe(0);
      expect(result.current.summary).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(typeof result.current.generateResponse).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });
  });

  describe('non-streaming mode', () => {
    it('should handle successful response', async () => {
      const mockResponse = {
        content: 'Test AI response',
        confidence: 0.85,
        summary: 'Test summary',
        model: 'deepseek/deepseek-chat',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      });

      const { result } = renderHook(() => useAiResponse());
      const request: AiRequest = {
        mode: 'chat',
        question: 'What is AI?',
      };

      act(() => {
        result.current.generateResponse(request);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.response).toEqual(mockResponse);
      expect(result.current.streamContent).toBe(mockResponse.content);
      expect(result.current.confidence).toBe(mockResponse.confidence);
      expect(result.current.summary).toBe(mockResponse.summary);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error response', async () => {
      const mockError = {
        error: 'Invalid request',
        code: 'INVALID_REQUEST',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      });

      const { result } = renderHook(() => useAiResponse());
      const request: AiRequest = {
        mode: 'chat',
        question: 'What is AI?',
      };

      act(() => {
        result.current.generateResponse(request);
      });

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.response).toBeNull();
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAiResponse());
      const request: AiRequest = {
        mode: 'chat',
        question: 'What is AI?',
      };

      act(() => {
        result.current.generateResponse(request);
      });

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.error).toContain('Network error');
      expect(result.current.response).toBeNull();
    });
  });

  describe('reset functionality', () => {
    it('should reset state to initial values', () => {
      const { result } = renderHook(() => useAiResponse());

      act(() => {
        result.current.reset();
      });

      expect(result.current.response).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.streamContent).toBe('');
      expect(result.current.confidence).toBe(0);
      expect(result.current.summary).toBe('');
      expect(result.current.isStreaming).toBe(false);
    });
  });

  describe('cancel functionality', () => {
    it('should cancel ongoing request', async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise(resolve => {
        resolveFetch = resolve;
      });

      (fetch as jest.Mock).mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useAiResponse());
      const request: AiRequest = {
        mode: 'chat',
        question: 'Test question',
      };

      act(() => {
        result.current.generateResponse(request);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.cancel();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error?.error).toBe('Request cancelled');
      expect(mockAbort).toHaveBeenCalled();
    });
  });
});