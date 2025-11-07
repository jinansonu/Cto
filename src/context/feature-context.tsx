'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

export type FeatureModule =
  | 'voice'
  | 'text'
  | 'camera'
  | 'history'
  | 'insights'
  | 'favorites'
  | 'settings';

interface FeatureState {
  activeModule: FeatureModule;
  isLoading: Record<FeatureModule, boolean>;
}

interface FeatureContextType {
  state: FeatureState;
  setActiveModule: (module: FeatureModule) => void;
  setModuleLoading: (module: FeatureModule, loading: boolean) => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

const initialState: FeatureState = {
  activeModule: 'voice',
  isLoading: {
    voice: false,
    text: false,
    camera: false,
    history: false,
    insights: false,
    favorites: false,
    settings: false,
  },
};

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FeatureState>(initialState);

  const setActiveModule = useCallback((module: FeatureModule) => {
    setState((prev) => ({
      ...prev,
      activeModule: module,
    }));
  }, []);

  const setModuleLoading = useCallback((module: FeatureModule, loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [module]: loading,
      },
    }));
  }, []);

  return (
    <FeatureContext.Provider value={{ state, setActiveModule, setModuleLoading }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
}
