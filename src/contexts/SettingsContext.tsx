import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Settings } from '../lib/supabase';

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  toggleDarkMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.dark_mode]);

  const loadSettings = async () => {
    try {
      // For now, use default settings. In a real app, this would fetch from Supabase
      const defaultSettings: Settings = {
        id: 'default',
        voice_tone: 'friendly',
        default_interaction_mode: 'chat',
        dark_mode: false,
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setSettings(updatedSettings);
    
    // In a real app, this would persist to Supabase
    try {
      // await supabase.from('settings').upsert(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Rollback on error
      setSettings(settings);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    if (settings) {
      updateSettings({ dark_mode: !settings.dark_mode });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, toggleDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};