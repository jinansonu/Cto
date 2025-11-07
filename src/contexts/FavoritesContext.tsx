import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Favorite } from '../lib/supabase';

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  addToFavorites: (interactionId: string, note?: string) => Promise<void>;
  removeFromFavorites: (favoriteId: string) => Promise<void>;
  updateFavoriteNote: (favoriteId: string, note: string) => Promise<void>;
  isFavorite: (interactionId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Mock data for now - in a real app, this would fetch from Supabase
      const mockFavorites: Favorite[] = [
        {
          id: '1',
          interaction_id: '1',
          note: 'Great interaction about AI',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user-1',
          interaction: {
            id: '1',
            title: 'AI Discussion',
            content: 'We talked about artificial intelligence and its future.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'user-1'
          }
        }
      ];
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (interactionId: string, note = '') => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      interaction_id: interactionId,
      note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
    };

    setFavorites(prev => [...prev, newFavorite]);
    
    // In a real app, this would persist to Supabase
    try {
      // await supabase.from('favorites').insert(newFavorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      // Rollback on error
      setFavorites(prev => prev.filter(f => f.id !== newFavorite.id));
      throw error;
    }
  };

  const removeFromFavorites = async (favoriteId: string) => {
    const originalFavorites = [...favorites];
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    
    // In a real app, this would delete from Supabase
    try {
      // await supabase.from('favorites').delete().eq('id', favoriteId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Rollback on error
      setFavorites(originalFavorites);
      throw error;
    }
  };

  const updateFavoriteNote = async (favoriteId: string, note: string) => {
    const originalFavorites = [...favorites];
    setFavorites(prev => 
      prev.map(f => f.id === favoriteId ? { ...f, note, updated_at: new Date().toISOString() } : f)
    );
    
    // In a real app, this would update in Supabase
    try {
      // await supabase.from('favorites').update({ note }).eq('id', favoriteId);
    } catch (error) {
      console.error('Error updating favorite note:', error);
      // Rollback on error
      setFavorites(originalFavorites);
      throw error;
    }
  };

  const isFavorite = (interactionId: string): boolean => {
    return favorites.some(f => f.interaction_id === interactionId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      addToFavorites,
      removeFromFavorites,
      updateFavoriteNote,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};