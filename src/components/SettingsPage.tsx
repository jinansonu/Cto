import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { VoiceTone, InteractionMode } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, loading } = useSettings();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleVoiceToneChange = async (tone: VoiceTone) => {
    try {
      setIsSaving(true);
      await updateSettings({ voice_tone: tone });
      addToast('Voice tone updated!', 'success');
    } catch (error) {
      addToast('Failed to update voice tone', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInteractionModeChange = async (mode: InteractionMode) => {
    try {
      setIsSaving(true);
      await updateSettings({ default_interaction_mode: mode });
      addToast('Default interaction mode updated!', 'success');
    } catch (error) {
      addToast('Failed to update interaction mode', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      setIsSaving(true);
      await updateSettings({ dark_mode: !settings.dark_mode });
      addToast(`Dark mode ${!settings.dark_mode ? 'enabled' : 'disabled'}!`, 'success');
    } catch (error) {
      addToast('Failed to toggle dark mode', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>
      
      <div className="space-y-6">
        {/* Voice Tone Setting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Voice Tone</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Choose the tone for text-to-speech output
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['friendly', 'professional', 'casual'] as VoiceTone[]).map(tone => (
              <button
                key={tone}
                onClick={() => handleVoiceToneChange(tone)}
                disabled={isSaving}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  settings.voice_tone === tone
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="capitalize font-medium dark:text-white">{tone}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Interaction Mode Setting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Default Interaction Mode</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Choose your preferred default interaction mode
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['chat', 'voice', 'text'] as InteractionMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => handleInteractionModeChange(mode)}
                disabled={isSaving}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  settings.default_interaction_mode === mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="capitalize font-medium dark:text-white">{mode}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode Setting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Toggle dark mode for the interface
              </p>
            </div>
            <button
              onClick={handleDarkModeToggle}
              disabled={isSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dark_mode ? 'bg-blue-500' : 'bg-gray-300'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dark_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Status */}
        {isSaving && (
          <div className="text-center text-blue-500 dark:text-blue-400">
            Saving settings...
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;