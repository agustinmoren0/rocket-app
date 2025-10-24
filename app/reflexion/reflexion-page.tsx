// app/reflexion/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addActivity } from '../lib/store';

export default function ReflexionPage() {
  const router = useRouter();
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const mins = parseInt(minutes);
    if (isNaN(mins) || mins <= 0) {
      alert('Por favor, ingresá un tiempo válido');
      return;
    }
    
    if (!note.trim()) {
      alert('Por favor, contanos qué lograste');
      return;
    }
    
    addActivity(mins, note);
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      {/* Header */}
      <header className="mb-8">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6"
        >
          ← 
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          ¿Qué lograste hoy?
        </h1>
        <p className="text-slate-600">
          Registrá tu progreso creativo del día.
        </p>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Minutos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Minutos dedicados
          </label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="60"
            className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Qué hiciste?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Escribí 500 palabras de mi novela..."
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* Sugerencias */}
        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-sm text-amber-900 mb-2 font-medium">💡 Ideas:</p>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Escribí, diseñé o codeé algo</li>
            <li>• Leí o investigué sobre mi proyecto</li>
            <li>• Revisé y mejoré trabajos anteriores</li>
          </ul>
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg"
        >
          Guardar progreso
        </button>
      </form>
    </main>
  );
}
