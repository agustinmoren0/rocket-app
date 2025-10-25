'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addActivity, CATEGORIES, type Category } from '../lib/store';
import { showToast } from '../components/Toast';

const emotions = [
  { emoji: '🔥', label: 'En fuego' },
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😌', label: 'Tranquilo' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😔', label: 'Cansado' },
  { emoji: '😤', label: 'Frustrado' },
];

export default function ReflexionPage() {
  const router = useRouter();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mins = parseInt(minutes);
    if (isNaN(mins) || mins <= 0) {
      showToast('Por favor, ingresá un tiempo válido', 'error');
      return;
    }

    if (!note.trim()) {
      showToast('Por favor, contanos qué lograste', 'error');
      return;
    }

    addActivity(
      mins,
      note,
      selectedEmotion || undefined,
      selectedCategory || undefined
    );
    showToast('¡Progreso guardado! 🚀', 'success');

    setTimeout(() => {
      window.location.href = '/';
    }, 800);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <header className="mb-8 animate-fadeIn">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-slate-50"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          ¿Qué lograste hoy?
        </h1>
        <p className="text-slate-600">
          Registrá tu progreso creativo del día
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
        {/* Minutos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Cuánto tiempo dedicaste?
          </label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="60"
            className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg"
            autoFocus
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

        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            ¿A qué categoría pertenece? (opcional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(
                  selectedCategory === category ? '' : category
                )}
                className={`
                  h-16 rounded-2xl flex items-center justify-center text-sm font-medium
                  transition-all
                  ${selectedCategory === category
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Emojis opcionales */}
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-3">
            ¿Cómo te sentiste? (opcional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {emotions.map((emotion) => (
              <button
                key={emotion.emoji}
                type="button"
                onClick={() => setSelectedEmotion(
                  selectedEmotion === emotion.emoji ? '' : emotion.emoji
                )}
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                  transition-all hover:scale-110
                  ${selectedEmotion === emotion.emoji
                    ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                    : 'bg-slate-50 hover:bg-slate-100'
                  }
                `}
                title={emotion.label}
              >
                {emotion.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700"
        >
          Guardar progreso
        </button>
      </form>
    </main>
  );
}
