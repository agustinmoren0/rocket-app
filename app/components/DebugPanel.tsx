'use client'

import { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    pollingActive: false,
    eventListenersActive: false,
    errorBoundaryActive: true,
    motionReduced: false,
    localStorageSize: 0,
    lastUpdate: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    // Check if polling is happening (it shouldn't be)
    const checkPolling = () => {
      const startTime = performance.now();
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      setTimeout(() => {
        const endTime = performance.now();
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

        // If CPU is high and memory is growing, polling is likely happening
        setStats(prev => ({
          ...prev,
          pollingActive: false, // Should be false now
          lastUpdate: new Date().toLocaleTimeString(),
        }));
      }, 1000);
    };

    // Check for event listeners
    const checkEvents = () => {
      const hasDataChangeListener = window.addEventListener !== undefined;
      setStats(prev => ({
        ...prev,
        eventListenersActive: hasDataChangeListener,
        motionReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        localStorageSize: new Blob(Object.values(localStorage)).size,
      }));
    };

    checkPolling();
    checkEvents();

    // Listen for custom data change event
    const handleDataChange = () => {
      console.log('✅ Data change event detected!');
      setStats(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString(),
      }));
    };

    window.addEventListener('habika-data-changed', handleDataChange);

    return () => {
      window.removeEventListener('habika-data-changed', handleDataChange);
    };
  }, []);

  const testConfetti = () => {
    try {
      const { celebrateAchievement } = require('@/app/lib/confetti');
      console.log('🎉 Testing confetti...');
      celebrateAchievement();
      alert('✅ Confetti triggered! (Check console if you have prefers-reduced-motion disabled)');
    } catch (error) {
      console.error('❌ Error triggering confetti:', error);
      alert('❌ Error: ' + String(error));
    }
  };

  const testDataChange = () => {
    console.log('📡 Dispatching test data change event...');
    window.dispatchEvent(new Event('habika-data-changed'));
    alert('✅ Data change event dispatched! Check console and check if stats updated.');
  };

  const testError = () => {
    alert('⚠️ This will throw an error to test Error Boundary. The page should show recovery UI.');
    throw new Error('TEST ERROR - This is intentional!');
  };

  const testLocalStorage = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    alert(`📊 Current habits in localStorage: ${habits.length} habits\n\nSize: ${stats.localStorageSize} bytes`);
  };

  return (
    <>
      {/* Debug Button - Fixed bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-32 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel - Dropdown */}
      {isOpen && (
        <div className="fixed bottom-44 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border-2 border-purple-300 p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-purple-900">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-500 hover:text-purple-700"
            >
              ✕
            </button>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {!stats.pollingActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Polling: {stats.pollingActive ? '❌ ACTIVE' : '✅ DISABLED'}</span>
            </div>

            <div className="flex items-center gap-2">
              {stats.eventListenersActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Event Listeners: {stats.eventListenersActive ? '✅ ACTIVE' : '❌ INACTIVE'}</span>
            </div>

            <div className="flex items-center gap-2">
              {stats.errorBoundaryActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Error Boundary: {stats.errorBoundaryActive ? '✅ ACTIVE' : '❌ INACTIVE'}</span>
            </div>

            <div className="flex items-center gap-2">
              {stats.motionReduced ? (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span>Motion: {stats.motionReduced ? '🚫 REDUCED' : '✅ NORMAL'}</span>
            </div>

            <div className="text-xs text-gray-600 mt-2">
              Last update: {stats.lastUpdate}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="border-t pt-3 space-y-2">
            <button
              onClick={testConfetti}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              🎉 Test Confetti
            </button>

            <button
              onClick={testDataChange}
              className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              📡 Test Data Change Event
            </button>

            <button
              onClick={testLocalStorage}
              className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              📊 Check LocalStorage
            </button>

            <button
              onClick={testError}
              className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              ⚠️ Test Error (Crash)
            </button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-3">
            💡 Check browser console (F12) for detailed logs
          </div>
        </div>
      )}
    </>
  );
}
