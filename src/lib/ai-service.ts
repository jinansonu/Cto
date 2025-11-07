import OpenAI from 'openai';
import { AiRequest, AiResponse, AiStreamChunk } from '@/types/ai';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'deepseek/deepseek-chat';

class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: this.getApiKey(),
      baseURL: OPENROUTER_API_URL,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'AI Service App',
      },
    });
  }

  private getApiKey(): string {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    return apiKey;
  }

  private enrichPrompt(request: AiRequest): string {
    const { mode, question, context } = request;
    
    let systemPrompt = '';
    switch (mode) {
      case 'chat':
        systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';
        break;
      case 'analyze':
        systemPrompt = 'You are an analytical AI. Analyze the given information and provide insights with confidence levels.';
        break;
      case 'summarize':
        systemPrompt = 'You are a summarization AI. Create concise summaries while preserving key information.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant.';
    }

    let fullPrompt = systemPrompt;
    
    if (context) {
      fullPrompt += `\n\nContext: ${context}`;
    }
    
    fullPrompt += `\n\nQuestion: ${question}`;
    
    return fullPrompt;
  }

  private generateSummary(content: string): string {
    // Simple summary generation - in production, you might want to use a separate AI call
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return content.trim();
    
    return sentences.slice(0, 2).join('.').trim() + '.';
  }

  private calculateConfidence(content: string, mode: string): number {
    // Simple confidence calculation based on content characteristics
    const wordCount = content.split(/\s+/).length;
    let confidence = 0.5;

    if (wordCount > 50) confidence += 0.2;
    if (wordCount > 100) confidence += 0.1;
    if (content.includes('uncertain') || content.includes('might') || content.includes('possibly')) {
      confidence -= 0.2;
    }
    if (mode === 'analyze' && content.includes('analysis') && content.includes('data')) {
      confidence += 0.1;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }

  async generateResponse(request: AiRequest): Promise<AiResponse> {
    try {
      const enrichedPrompt = this.enrichPrompt(request);
      const model = request.userSettings?.model || DEFAULT_MODEL;

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: enrichedPrompt }
        ],
        temperature: request.userSettings?.temperature || 0.7,
        max_tokens: request.userSettings?.maxTokens || 1000,
      });

      const content = completion.choices[0]?.message?.content || '';
      const summary = this.generateSummary(content);
      const confidence = this.calculateConfidence(content, request.mode);

      return {
        content,
        confidence,
        summary,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
        model: completion.model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *generateStreamingResponse(request: AiRequest): AsyncGenerator<AiStreamChunk> {
    try {
      const enrichedPrompt = this.enrichPrompt(request);
      const model = request.userSettings?.model || DEFAULT_MODEL;

      const stream = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: enrichedPrompt }
        ],
        temperature: request.userSettings?.temperature || 0.7,
        max_tokens: request.userSettings?.maxTokens || 1000,
        stream: true,
      });

      let fullContent = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          yield {
            content,
            done: false,
          };
        }
      }

      // Send final chunk with summary and confidence
      const summary = this.generateSummary(fullContent);
      const confidence = this.calculateConfidence(fullContent, request.mode);

      yield {
        summary,
        confidence,
        done: true,
      };
    } catch (error) {
      console.error('AI Streaming Error:', error);
      yield {
        error: `AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        done: true,
      };
    }
  }

  validateRequest(request: any): request is AiRequest {
    return (
      typeof request === 'object' &&
      request !== null &&
      typeof request.mode === 'string' &&
      ['chat', 'analyze', 'summarize'].includes(request.mode) &&
      typeof request.question === 'string' &&
      request.question.trim().length > 0 &&
      request.question.length <= 10000 &&
      (!request.context || typeof request.context === 'string') &&
      (!request.userSettings || typeof request.userSettings === 'object')
    );
  }
}

// Singleton instance
const aiService = new AiService();

export default aiService;