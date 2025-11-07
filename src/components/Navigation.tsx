import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Interactions', icon: '💬' },
    { path: '/favorites', label: 'Favorites', icon: '⭐' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                location.pathname === item.path
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;