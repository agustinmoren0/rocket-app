/* INSTRUCCIONES PARA CLAUDE VS CODE:
Creá el archivo app/components/Toast.tsx con EXACTAMENTE este código
*/

'use client'

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

let toastCounter = 0;
const toastListeners: Array<(toast: ToastMessage) => void> = [];

export function showToast(message: string, type: ToastType = 'success') {
  const toast: ToastMessage = {
    id: toastCounter++,
    message,
    type,
  };
  toastListeners.forEach(listener => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };

    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm
            flex items-center gap-3 animate-slideUp
            ${toast.type === 'success' ? 'bg-green-500/90 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500/90 text-white' : ''}
            ${toast.type === 'info' ? 'bg-indigo-500/90 text-white' : ''}
          `}
        >
          <span className="text-xl">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <p className="flex-1 font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
