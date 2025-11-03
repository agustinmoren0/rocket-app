'use client'
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('✅ Service Worker registered successfully');
        console.log(`   Scope: ${registration.scope}`);

        // Check for updates periodically (every 60 seconds)
        const interval = setInterval(() => {
          console.log('🔄 Checking for SW updates...');
          registration.update();
        }, 60000);

        // Listen for new service worker ready
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔔 New SW update found');
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log(`⚙️  SW state changed to: ${newWorker.state}`);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('💡 New service worker available, refresh to update');
              }
            });
          }
        });

        // Check current controller
        if (navigator.serviceWorker.controller) {
          console.log('ℹ️  Active service worker is controlling the page');
        } else {
          console.log('ℹ️  No active service worker controlling the page yet');
        }

        return () => clearInterval(interval);
      }).catch((err) => {
        console.error('❌ Failed to register Service Worker:', err);
      });
    } else {
      console.warn('⚠️  Service Workers not supported in this browser');
    }
  }, []);
  return null;
}
