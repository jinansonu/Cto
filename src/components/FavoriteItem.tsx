import React, { useState } from 'react';
import { Favorite } from '../lib/supabase';
import { useFavorites } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';

const FavoriteItem: React.FC<{ favorite: Favorite }> = ({ favorite }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(favorite.note);
  const { updateFavoriteNote, removeFromFavorites } = useFavorites();
  const { addToast } = useToast();

  const handleSaveNote = async () => {
    try {
      await updateFavoriteNote(favorite.id, note);
      setIsEditing(false);
      addToast('Note updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update note', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await removeFromFavorites(favorite.id);
      addToast('Removed from favorites', 'success');
    } catch (error) {
      addToast('Failed to remove favorite', 'error');
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold dark:text-white">
            {favorite.interaction?.title || 'Unknown Interaction'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(favorite.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 ml-4"
          aria-label="Remove from favorites"
        >
          🗑️
        </button>
      </div>
      
      {favorite.interaction && (
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          {favorite.interaction.content}
        </p>
      )}
      
      <div className="border-t dark:border-gray-600 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium dark:text-white">Note:</span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={3}
              placeholder="Add a note..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNote(favorite.note);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 italic">
            {note || 'No note added'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FavoriteItem;