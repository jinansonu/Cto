import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import InteractionsPage from './components/InteractionsPage';
import FavoritesPage from './components/FavoritesPage';
import SettingsPage from './components/SettingsPage';
import './index.css';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<InteractionsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </FavoritesProvider>
      </SettingsProvider>
    </ToastProvider>
  );
};

export default App;