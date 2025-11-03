'use client'
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Check for updates periodically (every 60 seconds)
        const interval = setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for new service worker ready
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available, refresh to update');
              }
            });
          }
        });

        return () => clearInterval(interval);
      }).catch(() => {
        // Silent fail
      });
    }
  }, []);
  return null;
}
