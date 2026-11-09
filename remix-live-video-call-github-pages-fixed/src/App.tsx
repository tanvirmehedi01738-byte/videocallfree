import { useState, useEffect } from 'react';
import { CallConfig, DEFAULT_CALL_CONFIG } from './types';
import { CallingScreen } from './components/CallingScreen';
import { AdminPanel } from './components/AdminPanel';
import { subscribeToCallConfig, testFirestoreConnection } from './firebase';

export default function App() {
  const [callConfig, setCallConfig] = useState<CallConfig>(DEFAULT_CALL_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Validate connection to Firestore on boot
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore ping note:', err);
    });

    // 2. Real-time subscription to call config in Firestore
    const unsubscribe = subscribeToCallConfig(
      (newConfig) => {
        setCallConfig(newConfig);
        setIsInitializing(false);
      },
      (error) => {
        console.warn('Could not load live config, using local default:', error);
        setIsInitializing(false);
      }
    );

    // 3. Listen to URL hash for direct hidden admin access e.g. /#admin
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    // 4. Keyboard shortcut for admin: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Safety fallback: ensure initializing spinner is dismissed even if network is delayed on GitHub Pages
    const fallbackTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleConfigSaved = (updatedConfig: CallConfig) => {
    setCallConfig(updatedConfig);
  };

  return (
    <main className="w-full min-h-screen bg-black text-white relative selection:bg-emerald-500 selection:text-white">
      {/* Real-time Calling Screen (Main Experience) */}
      <CallingScreen
        config={callConfig}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hidden Admin Modal */}
      <AdminPanel
        currentConfig={callConfig}
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        onConfigSaved={handleConfigSaved}
      />

      {/* Initial loading screen if needed */}
      {isInitializing && (
        <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-white/50 tracking-wider">
            Connecting secure line...
          </span>
        </div>
      )}
    </main>
  );
}
