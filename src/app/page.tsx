'use client';

import { useState } from 'react';
import { useAiResponse } from '@/hooks/useAiResponse';
import { AiRequest } from '@/types/ai';

export default function Home() {
  const [mode, setMode] = useState<AiRequest['mode']>('chat');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [enableStreaming, setEnableStreaming] = useState(false);
  
  const {
    response,
    isLoading,
    error,
    streamContent,
    confidence,
    summary,
    isStreaming,
    generateResponse,
    reset,
    cancel,
  } = useAiResponse({ enableStreaming });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    const request: AiRequest = {
      mode,
      question: question.trim(),
      context: context.trim() || undefined,
      userSettings: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    };

    await generateResponse(request);
  };

  const handleReset = () => {
    reset();
    setQuestion('');
    setContext('');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          AI Service Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as AiRequest['mode'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isStreaming}
              >
                <option value="chat">Chat</option>
                <option value="analyze">Analyze</option>
                <option value="summarize">Summarize</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ask your question..."
                disabled={isLoading || isStreaming}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context (optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional context..."
                disabled={isLoading || isStreaming}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="streaming"
                checked={enableStreaming}
                onChange={(e) => setEnableStreaming(e.target.checked)}
                disabled={isLoading || isStreaming}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="streaming" className="text-sm font-medium text-gray-700">
                Enable streaming
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || isStreaming || !question.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading || isStreaming ? 'Processing...' : 'Generate Response'}
              </button>
              
              {(isLoading || isStreaming) && (
                <button
                  type="button"
                  onClick={cancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || isStreaming}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error.error}</p>
            {error.code && (
              <p className="text-sm text-red-600 mt-1">Code: {error.code}</p>
            )}
          </div>
        )}

        {(streamContent || response) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isStreaming ? 'Streaming Response' : 'AI Response'}
            </h3>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {streamContent || response?.content}
              </p>
            </div>

            {(confidence > 0 || summary) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {confidence > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Confidence: </span>
                    <span className="text-sm text-gray-900">{(confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
                
                {summary && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Summary: </span>
                    <span className="text-sm text-gray-900">{summary}</span>
                  </div>
                )}
              </div>
            )}

            {response && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div>Model: {response.model}</div>
                <div>Timestamp: {new Date(response.timestamp).toLocaleString()}</div>
                {response.usage && (
                  <div className="mt-1">
                    Tokens: {response.usage.totalTokens} 
                    (Prompt: {response.usage.promptTokens}, 
                    Completion: {response.usage.completionTokens})
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}