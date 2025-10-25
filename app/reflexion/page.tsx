'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { addActivity, CATEGORIES, type Category } from '../lib/store';
import { showToast } from '../components/Toast';
import { celebrateSave } from '../lib/confetti';

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

    celebrateSave();
    showToast('¡Progreso guardado! 🚀', 'success');

    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-slate-50"
        >
          ←
        </motion.button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          ¿Qué lograste hoy?
        </h1>
        <p className="text-slate-600">
          Registrá tu progreso creativo del día
        </p>
      </motion.header>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Minutos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Cuánto tiempo dedicaste?
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="60"
            className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg transition-all"
            autoFocus
          />
        </motion.div>

        {/* Nota */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Qué hiciste?
          </label>
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Escribí 500 palabras de mi novela..."
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none transition-all"
          />
        </motion.div>

        {/* Categorías */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-slate-700 mb-3">
            ¿A qué categoría pertenece? (opcional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category, i) => (
              <motion.button
                key={category}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(
                  selectedCategory === category ? '' : category
                )}
                className={`
                  h-16 rounded-2xl flex items-center justify-center text-sm font-medium
                  transition-all
                  ${selectedCategory === category
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                  }
                `}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Emojis opcionales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-medium text-slate-500 mb-3">
            ¿Cómo te sentiste? (opcional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {emotions.map((emotion, i) => (
              <motion.button
                key={emotion.emoji}
                type="button"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 + i * 0.05 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedEmotion(
                  selectedEmotion === emotion.emoji ? '' : emotion.emoji
                )}
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                  transition-all
                  ${selectedEmotion === emotion.emoji
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'bg-slate-50 hover:bg-slate-100'
                  }
                `}
                title={emotion.label}
              >
                {emotion.emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Botón guardar */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700 transition-all"
        >
          Guardar progreso
        </motion.button>
      </motion.form>
    </main>
  );
}
