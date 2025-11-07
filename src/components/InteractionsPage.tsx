import React, { useState } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSettings } from '../contexts/SettingsContext';
import Interaction from './Interaction';
import { useToast } from '../contexts/ToastContext';

const InteractionsPage: React.FC = () => {
  const { addToFavorites } = useFavorites();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'text'>(
    settings?.default_interaction_mode || 'chat'
  );

  // Mock interactions data
  const interactions = [
    {
      id: '1',
      title: 'AI Discussion',
      content: 'We had an engaging conversation about artificial intelligence, its current capabilities, and the future potential. Topics included machine learning, neural networks, and the ethical implications of AI development.'
    },
    {
      id: '2',
      title: 'Travel Planning',
      content: 'Discussed various travel destinations, planning tips, and budget considerations. Explored options for both domestic and international travel, including visa requirements, local customs, and must-see attractions.'
    },
    {
      id: '3',
      title: 'Cooking Tips',
      content: 'Shared cooking techniques, recipe ideas, and kitchen organization tips. Covered various cuisines, cooking methods, and ways to make meal preparation more efficient and enjoyable.'
    }
  ];

  const handleFavorite = async (interactionId: string) => {
    try {
      await addToFavorites(interactionId, 'Added from interactions page');
    } catch (error) {
      addToast('Failed to add to favorites', 'error');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice tone settings
      switch (settings?.voice_tone) {
        case 'professional':
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          break;
        case 'casual':
          utterance.rate = 1.1;
          utterance.pitch = 0.9;
          break;
        case 'friendly':
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.1;
          break;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      addToast('Text-to-speech not supported in your browser', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Interactions</h1>
      
      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          {(['chat', 'voice', 'text'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mode-specific content */}
      {activeMode === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Chat Mode</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chat mode allows you to have conversational interactions. Select an interaction below to continue.
          </p>
        </div>
      )}

      {activeMode === 'voice' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Voice Mode</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Voice mode uses text-to-speech to read content aloud. Current tone: {settings?.voice_tone}
          </p>
          <button
            onClick={() => speakText('This is a sample of the text-to-speech functionality.')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            🔊 Test Voice
          </button>
        </div>
      )}

      {activeMode === 'text' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Text Mode</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Text mode provides a clean reading experience without voice output.
          </p>
        </div>
      )}

      {/* Interactions List */}
      <div className="space-y-4">
        {interactions.map(interaction => (
          <Interaction
            key={interaction.id}
            {...interaction}
            onFavorite={handleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default InteractionsPage;