'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { addActivity, CATEGORIES, type Category } from '../lib/store';
import { showToast } from '../components/Toast';
import { celebrateSave } from '../lib/confetti';
import { useTheme } from '../hooks/useTheme';

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
  const { currentTheme } = useTheme();
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [timeValue, setTimeValue] = useState('');
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours'>('minutes');
  const [note, setNote] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = parseFloat(timeValue);
    if (isNaN(value) || value <= 0) {
      showToast('Por favor, ingresá un tiempo válido', 'error');
      return;
    }

    // Nota es opcional SI hay categoría
    if (!note.trim() && !selectedCategory) {
      showToast('Por favor, elegí una categoría o describí qué hiciste', 'error');
      return;
    }

    // Convertir a minutos si está en horas
    const minutes = timeUnit === 'hours' ? Math.round(value * 60) : Math.round(value);

    // Si no hay nota, usar categoría como nota
    const finalNote = note.trim() || (selectedCategory ? `Actividad de ${selectedCategory}` : '');

    addActivity(
      minutes,
      finalNote,
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
    <main className={`min-h-screen bg-gradient-to-b ${currentTheme.bg} px-6 py-10`}>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className={`w-10 h-10 rounded-full ${currentTheme.bgCard} shadow-sm flex items-center justify-center mb-6 ${currentTheme.bgHover}`}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Tiempo con selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Cuánto tiempo dedicaste?
          </label>
          <div className="flex gap-3">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="number"
              step="0.5"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              placeholder={timeUnit === 'minutes' ? '60' : '1.5'}
              className={`flex-1 h-14 px-4 rounded-2xl ${currentTheme.bgCard} border-2 ${currentTheme.border} focus:outline-none text-lg transition-colors`}
              style={{ borderColor: currentTheme.primary }}
              autoFocus
            />
            <div className={`flex rounded-2xl ${currentTheme.bgHover} p-1`}>
              <button
                type="button"
                onClick={() => setTimeUnit('minutes')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeUnit === 'minutes'
                    ? `${currentTheme.bgCard} text-slate-800 shadow-sm`
                    : 'text-slate-600'
                }`}
              >
                Min
              </button>
              <button
                type="button"
                onClick={() => setTimeUnit('hours')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeUnit === 'hours'
                    ? `${currentTheme.bgCard} text-slate-800 shadow-sm`
                    : 'text-slate-600'
                }`}
              >
                Hs
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {timeUnit === 'minutes' ? 'O podés usar horas →' : '← O podés usar minutos'}
          </p>
        </div>

        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            ¿A qué categoría pertenece?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category, i) => (
              <motion.button
                key={category}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(
                  selectedCategory === category ? '' : category
                )}
                className={`
                  h-16 rounded-2xl flex items-center justify-center text-sm font-medium
                  transition-all
                  ${selectedCategory === category
                    ? `text-white transition-all border-2`
                    : `${currentTheme.bgCard} text-slate-700 ${currentTheme.bgHover} border-2 ${currentTheme.border}`
                  }
                `}
                style={selectedCategory === category ? {
                  backgroundImage: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                  borderColor: currentTheme.primary,
                } : {}}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Nota OPCIONAL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Qué hiciste? <span className="text-slate-400 text-xs">(opcional)</span>
          </label>
          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Escribí 500 palabras de mi novela..."
            rows={4}
            className={`w-full px-4 py-3 rounded-2xl ${currentTheme.bgCard} border-2 ${currentTheme.border} focus:outline-none resize-none transition-colors`}
            style={{ borderColor: currentTheme.primary }}
          />
          <p className="text-xs text-slate-500 mt-2">
            {selectedCategory
              ? 'Tenés categoría elegida, podés dejar esto vacío'
              : 'Si no elegís categoría, escribí qué hiciste'}
          </p>
        </div>

        {/* Emojis opcionales */}
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-3">
            ¿Cómo te sentiste? <span className="text-xs">(opcional)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {emotions.map((emotion, i) => (
              <motion.button
                key={emotion.emoji}
                type="button"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.02 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedEmotion(
                  selectedEmotion === emotion.emoji ? '' : emotion.emoji
                )}
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                  transition-all
                  ${selectedEmotion === emotion.emoji
                    ? `ring-2 transition-all`
                    : `${currentTheme.bgHover} hover:opacity-80`
                  }
                `}
                style={selectedEmotion === emotion.emoji ? {
                  backgroundColor: currentTheme.primary + '20',
                  borderColor: currentTheme.primary,
                  boxShadow: `0 0 0 2px ${currentTheme.primary}`,
                } : {}}
                title={emotion.label}
              >
                {emotion.emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Botón guardar */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className={`w-full h-14 rounded-2xl ${currentTheme.button} text-white font-medium shadow-md hover:shadow-lg transition-all duration-200`}
        >
          Guardar progreso
        </motion.button>
      </motion.form>
    </main>
  );
}
