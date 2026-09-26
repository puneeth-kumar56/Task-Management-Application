import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Login } from './components/Auth/Login.jsx';
import { Register } from './components/Auth/Register.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { ProjectGuideModal } from './components/ProjectGuideModal.jsx';
import { api, authStorage } from './services/api.js';
import { initSocket } from './services/socket.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // Initialize socket client
    initSocket();

    // Check stored authentication
    const token = authStorage.getToken();
    const storedUser = authStorage.getUser();

    if (token) {
      if (storedUser) {
        setUser(storedUser);
      }
      api.auth
        .getMe()
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          authStorage.clear();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Initializing TaskFlow Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="py-6 sm:py-12">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1 rounded-full inline-block mb-3">
                Full-Stack Task Ecosystem
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Manage Tasks With Real-Time Synchronization
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Production-ready MERN-stack architecture powered by Express REST endpoints, JWT authorization, MongoDB models, and bi-directional Socket.IO updates.
              </p>
            </div>

            {authView === 'login' ? (
              <Login
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthView('register')}
              />
            ) : (
              <Register
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthView('login')}
              />
            )}
          </div>
        ) : (
          <Dashboard
            currentUser={user}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Project Specs & Local Setup Modal */}
      <ProjectGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow Enterprise Platform &copy; 2026. Built with Express, MongoDB, Socket.IO & React (JavaScript).</span>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Standalone Architecture & Deployment Specs
          </button>
        </div>
      </footer>
    </div>
  );
}
