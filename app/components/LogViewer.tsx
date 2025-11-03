'use client'

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  args?: any[];
}

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (type: 'log' | 'error' | 'warn' | 'info', args: any[]) => {
      const timestamp = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      setLogs((prev) => {
        const newLogs = [...prev, { timestamp, type, message, args }];
        // Keep only last 50 logs to prevent memory issues
        return newLogs.slice(-50);
      });
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-300';
    }
  };

  const getLogBg = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10';
      case 'warn':
        return 'bg-yellow-500/10';
      case 'info':
        return 'bg-blue-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="fixed bottom-24 right-4 z-40 p-3 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Ver logs"
      >
        <span className="text-xl">📋</span>
      </button>

      {/* Log Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-h-96 bg-gray-900 rounded-lg shadow-2xl z-40 flex flex-col border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <h3 className="text-white font-semibold text-sm">
              Console Logs ({logs.length})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Logs Container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs bg-gray-950">
            {logs.length === 0 ? (
              <div className="text-gray-500 p-2">Esperando logs...</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${getLogBg(log.type)} border-l-2 ${
                    log.type === 'error'
                      ? 'border-red-500'
                      : log.type === 'warn'
                      ? 'border-yellow-500'
                      : log.type === 'info'
                      ? 'border-blue-500'
                      : 'border-gray-600'
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className={getLogColor(log.type)}>
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-300 break-words mt-1">
                    {log.message}
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Clear Button */}
          <div className="p-2 border-t border-gray-700 bg-gray-800 rounded-b-lg">
            <button
              onClick={() => setLogs([])}
              className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
