import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import FavoriteItem from './FavoriteItem';

const FavoritesPage: React.FC = () => {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No favorites yet</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Start adding interactions to your favorites to see them here!
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You have {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {favorites.map(favorite => (
              <FavoriteItem key={favorite.id} favorite={favorite} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;