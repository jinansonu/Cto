export interface VoiceInteraction {
  id: string;
  mode: 'voice';
  transcript: string;
  response: string;
  confidence?: number;
  summary?: string;
  timestamp: Date;
  duration?: number;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface VoiceSettings {
  voiceTone: 'default' | 'male' | 'female' | 'robotic';
  language: string;
  autoReplay: boolean;
}

export interface AIResponse {
  text: string;
  summary?: string;
  confidence?: number;
}