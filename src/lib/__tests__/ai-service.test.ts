// Mock OpenAI before importing the service
import 'openai/shims/node';
jest.mock('openai');
import OpenAI from 'openai';
import aiService from '../ai-service';
import { AiRequest } from '@/types/ai';

const mockCreate = jest.fn();
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

// Set up the mock implementation
mockOpenAI.mockImplementation(() => {
  const instance = {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  };
  return instance;
});

describe('AiService', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mock function
    mockCreate.mockReset();

    // Mock the OpenAI instance
    const mockInstance = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
    mockOpenAI.mockImplementation(() => mockInstance as any);
  });

  describe('validateRequest', () => {
    it('should validate a correct request', () => {
      const validRequest: AiRequest = {
        mode: 'chat',
        question: 'What is the weather like?',
      };

      expect(aiService.validateRequest(validRequest)).toBe(true);
    });

    it('should reject request with invalid mode', () => {
      const invalidRequest = {
        mode: 'invalid',
        question: 'What is the weather like?',
      };

      expect(aiService.validateRequest(invalidRequest)).toBe(false);
    });

    it('should reject request with empty question', () => {
      const invalidRequest = {
        mode: 'chat',
        question: '',
      };

      expect(aiService.validateRequest(invalidRequest)).toBe(false);
    });

    it('should reject request with no mode', () => {
      const invalidRequest = {
        question: 'What is the weather like?',
      };

      expect(aiService.validateRequest(invalidRequest)).toBe(false);
    });

    it('should accept request with optional fields', () => {
      const validRequest: AiRequest = {
        mode: 'analyze',
        question: 'Analyze this data',
        context: 'Some context information',
        userSettings: {
          temperature: 0.5,
          maxTokens: 500,
        },
      };

      expect(aiService.validateRequest(validRequest)).toBe(true);
    });
  });

  describe('generateResponse', () => {
    it('should generate a response successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test response from the AI.',
            },
          },
        ],
        model: 'deepseek/deepseek-chat',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request: AiRequest = {
        mode: 'chat',
        question: 'What is the meaning of life?',
      };

      const response = await aiService.generateResponse(request);

      expect(response).toEqual({
        content: 'This is a test response from the AI.',
        confidence: expect.any(Number),
        summary: 'This is a test response from the AI.',
        usage: {
          promptTokens: 10,
          completionTokens: 15,
          totalTokens: 25,
        },
        model: 'deepseek/deepseek-chat',
        timestamp: expect.any(String),
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('You are a helpful AI assistant'),
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
    });

    it('should use custom settings when provided', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Custom response',
            },
          },
        ],
        model: 'custom-model',
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15,
        },
      };

      mockCreate.mockResolvedValue(mockResponse);

      const request: AiRequest = {
        mode: 'analyze',
        question: 'Analyze this',
        userSettings: {
          temperature: 0.3,
          maxTokens: 500,
          model: 'custom-model',
        },
      };

      await aiService.generateResponse(request);

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'custom-model',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('You are an analytical AI'),
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
    });

    it('should handle API errors', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const request: AiRequest = {
        mode: 'chat',
        question: 'Test question',
      };

      await expect(aiService.generateResponse(request)).rejects.toThrow('AI service failed: API Error');
    });
  });

  describe('generateStreamingResponse', () => {
    it('should handle streaming response', async () => {
      const mockChunks = [
        {
          choices: [
            {
              delta: {
                content: 'Hello',
              },
            },
          ],
        },
        {
          choices: [
            {
              delta: {
                content: ' world',
              },
            },
          ],
        },
      ];

      async function* mockAsyncIterator() {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      }

      mockCreate.mockResolvedValue(mockAsyncIterator());

      const request: AiRequest = {
        mode: 'chat',
        question: 'Stream test',
      };

      const chunks = [];
      for await (const chunk of aiService.generateStreamingResponse(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3); // 2 content chunks + 1 final chunk
      expect(chunks[0]).toEqual({ content: 'Hello', done: false });
      expect(chunks[1]).toEqual({ content: ' world', done: false });
      expect(chunks[2]).toEqual({
        summary: expect.any(String),
        confidence: expect.any(Number),
        done: true,
      });
    });

    it('should handle streaming errors', async () => {
      mockCreate.mockRejectedValue(new Error('Stream error'));

      const request: AiRequest = {
        mode: 'chat',
        question: 'Stream test',
      };

      const chunks = [];
      for await (const chunk of aiService.generateStreamingResponse(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({
        error: 'AI streaming failed: Stream error',
        done: true,
      });
    });
  });
});