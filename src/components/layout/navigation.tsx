'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'voice', label: 'Voice', emoji: '🎤', href: '/' },
  { id: 'text', label: 'Text', emoji: '💬', href: '/text' },
  { id: 'camera', label: 'Camera', emoji: '📷', href: '/camera' },
  { id: 'history', label: 'History', emoji: '⏱️', href: '/history' },
  { id: 'insights', label: 'Insights', emoji: '💡', href: '/insights' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐', href: '/favorites' },
  { id: 'settings', label: 'Settings', emoji: '⚙️', href: '/settings' },
];

export function Navigation() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-nav bg-white dark:bg-gray-900 border-t border-border flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center h-full relative group cursor-pointer"
          >
            <motion.div
              className="flex flex-col items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-foreground/50 group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>
            </motion.div>

            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
