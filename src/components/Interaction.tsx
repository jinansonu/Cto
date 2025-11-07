import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface InteractionProps {
  id: string;
  title: string;
  content: string;
  onFavorite?: (id: string) => void;
}

const Interaction: React.FC<InteractionProps> = ({ id, title, content, onFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToast } = useToast();

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(id);
      addToast('Added to favorites!', 'success');
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        <button
          onClick={handleFavorite}
          className="text-2xl hover:scale-110 transition-transform"
          aria-label="Add to favorites"
        >
          ⭐
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        {isExpanded ? content : content.substring(0, 100) + (content.length > 100 ? '...' : '')}
      </p>
      {content.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default Interaction;