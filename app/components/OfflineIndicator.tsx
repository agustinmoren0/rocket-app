'use client'

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl shadow-lg ${
              isOnline
                ? 'bg-green-500/90 text-white'
                : 'bg-slate-700/90 text-white'
            }`}
          >
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="font-medium">
              {isOnline ? 'Conectado' : 'Modo offline'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
