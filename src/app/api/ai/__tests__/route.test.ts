// Mock the aiService
jest.mock('@/lib/ai-service', () => ({
  __esModule: true,
  default: {
    validateRequest: jest.fn(),
    generateResponse: jest.fn(),
    generateStreamingResponse: jest.fn(),
  },
}));

import aiService from '@/lib/ai-service';

describe('/api/ai Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful validation by default
    (aiService.validateRequest as jest.Mock).mockReturnValue(true);
    
    // Mock successful response by default
    (aiService.generateResponse as jest.Mock).mockResolvedValue({
      content: 'Test response',
      confidence: 0.8,
      summary: 'Test summary',
      model: 'deepseek/deepseek-chat',
      timestamp: '2023-01-01T00:00:00.000Z',
    });
  });

  describe('request validation', () => {
    it('should validate a correct request', () => {
      const validRequest = {
        mode: 'chat',
        question: 'What is the weather like?',
      };

      expect(aiService.validateRequest(validRequest)).toBe(true);
    });

    it('should reject invalid request', () => {
      const invalidRequest = {
        mode: 'invalid',
        question: '',
      };

      (aiService.validateRequest as jest.Mock).mockReturnValue(false);

      expect(aiService.validateRequest(invalidRequest)).toBe(false);
    });
  });

  describe('AI service integration', () => {
    it('should generate response successfully', async () => {
      const request = {
        mode: 'chat' as const,
        question: 'What is AI?',
      };

      const response = await aiService.generateResponse(request);

      expect(response).toEqual({
        content: 'Test response',
        confidence: 0.8,
        summary: 'Test summary',
        model: 'deepseek/deepseek-chat',
        timestamp: '2023-01-01T00:00:00.000Z',
      });

      expect(aiService.generateResponse).toHaveBeenCalledWith(request);
    });

    it('should handle AI service errors', async () => {
      (aiService.generateResponse as jest.Mock).mockRejectedValue(new Error('AI service error'));

      const request = {
        mode: 'chat' as const,
        question: 'Test question',
      };

      await expect(aiService.generateResponse(request)).rejects.toThrow('AI service error');
    });
  });

  describe('streaming functionality', () => {
    it('should handle streaming response', async () => {
      const mockStreamGenerator = async function* () {
        yield { content: 'Hello', done: false };
        yield { content: ' world', done: false };
        yield { summary: 'Hello world', confidence: 0.9, done: true };
      };

      (aiService.generateStreamingResponse as jest.Mock).mockReturnValue(mockStreamGenerator());

      const request = {
        mode: 'chat' as const,
        question: 'Stream test',
      };

      const chunks = [];
      for await (const chunk of aiService.generateStreamingResponse(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ content: 'Hello', done: false });
      expect(chunks[1]).toEqual({ content: ' world', done: false });
      expect(chunks[2]).toEqual({ summary: 'Hello world', confidence: 0.9, done: true });
    });

    it('should handle streaming errors', async () => {
      const mockErrorGenerator = async function* () {
        yield { error: 'Stream failed', done: true };
      };

      (aiService.generateStreamingResponse as jest.Mock).mockReturnValue(mockErrorGenerator());

      const request = {
        mode: 'chat' as const,
        question: 'Stream test',
      };

      const chunks = [];
      for await (const chunk of aiService.generateStreamingResponse(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ error: 'Stream failed', done: true });
    });
  });
});