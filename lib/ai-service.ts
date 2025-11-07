import { AIResponse } from '@/types/voice'

export class AIService {
  private static instance: AIService

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async processVoiceInput(transcript: string): Promise<AIResponse> {
    try {
      // Simulate API call to AI service
      // In a real implementation, this would call your AI backend
      const response = await this.mockAICall(transcript)
      return response
    } catch (error) {
      console.error('AI service error:', error)
      throw new Error('Failed to process voice input')
    }
  }

  private async mockAICall(transcript: string): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock AI responses based on common queries
    const responses: { [key: string]: AIResponse } = {
      'hello': {
        text: 'Hello! How can I help you today? I can assist with various tasks and answer your questions.',
        summary: 'Greeting response',
        confidence: 0.95,
      },
      'weather': {
        text: 'I can help you check the weather. However, I need your location to provide accurate weather information. Could you please tell me which city you\'re in?',
        summary: 'Weather information request',
        confidence: 0.88,
      },
      'help': {
        text: 'I\'m here to help! You can ask me questions, request information, or have a conversation. I can assist with topics like general knowledge, calculations, recommendations, and much more. What would you like to know?',
        summary: 'Help and guidance',
        confidence: 0.92,
      },
    }

    // Check for keywords in transcript
    const lowerTranscript = transcript.toLowerCase()
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerTranscript.includes(keyword)) {
        return response
      }
    }

    // Default response
    return {
      text: `I understand you said: "${transcript}". That's interesting! While I don't have a specific response for that, I'm here to help with various questions and tasks. Could you tell me more about what you'd like assistance with?`,
      summary: 'General response',
      confidence: 0.75,
    }
  }
}