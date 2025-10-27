'use client'

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reflection {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'tough';
  achievements: string;
  learnings: string;
  improvements: string;
  createdAt: string;
}

const MOOD_DATA = {
  great: { emoji: '🚀', label: 'Excelente', color: 'text-green-600' },
  good: { emoji: '😊', label: 'Bien', color: 'text-blue-600' },
  okay: { emoji: '😐', label: 'Normal', color: 'text-yellow-600' },
  tough: { emoji: '😤', label: 'Difícil', color: 'text-red-600' },
};

export default function ReflexionesPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'tough'>('good');
  const [achievements, setAchievements] = useState('');
  const [learnings, setLearnings] = useState('');
  const [improvements, setImprovements] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Load reflections from localStorage
    const stored = localStorage.getItem('habika_reflections');
    if (stored) {
      setReflections(JSON.parse(stored));
    }
    setLoading(false);

    // Check if it's Sunday and no reflection created today
    checkSundayReminder();
  }, []);

  const checkSundayReminder = () => {
    const today = new Date();
    const isSunday = today.getDay() === 0;

    if (isSunday) {
      const stored = localStorage.getItem('habika_reflections');
      const reflectionsList: Reflection[] = stored ? JSON.parse(stored) : [];

      const todayReflection = reflectionsList.find((r) => {
        const refDate = new Date(r.date);
        return (
          refDate.getFullYear() === today.getFullYear() &&
          refDate.getMonth() === today.getMonth() &&
          refDate.getDate() === today.getDate()
        );
      });

      if (!todayReflection) {
        // Show reminder/auto-focus on create form
        setIsCreating(true);
      }
    }
  };

  const handleCreateReflection = () => {
    if (!achievements.trim()) {
      alert('Por favor, cuéntame al menos qué lograste.');
      return;
    }

    const newReflection: Reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      achievements,
      learnings,
      improvements,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReflection, ...reflections];
    setReflections(updated);
    localStorage.setItem('habika_reflections', JSON.stringify(updated));

    // Reset form
    setAchievements('');
    setLearnings('');
    setImprovements('');
    setMood('good');
    setIsCreating(false);
  };

  const handleDeleteReflection = (id: string) => {
    const updated = reflections.filter((r) => r.id !== id);
    setReflections(updated);
    localStorage.setItem('habika_reflections', JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} p-4`}>
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} p-4 pb-24`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
            Reflexiones Semanales
          </h1>
          <p className={`${currentTheme.textSecondary}`}>
            Cada semana, reflexiona sobre tu camino. Sin juzgarte, solo observando.
          </p>
        </motion.div>

        {/* Create Reflection Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border} mb-6`}
            >
              <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>
                Nueva Reflexión
              </h2>

              {/* Mood Selector */}
              <div className="mb-6">
                <p className={`text-sm font-medium ${currentTheme.textSecondary} mb-3`}>
                  ¿Cómo te sientes esta semana?
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {(
                    Object.entries(MOOD_DATA) as [
                      'great' | 'good' | 'okay' | 'tough',
                      (typeof MOOD_DATA)[keyof typeof MOOD_DATA],
                    ][]
                  ).map(([key, data]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMood(key)}
                      className={`py-3 px-2 rounded-lg font-medium transition-all ${
                        mood === key
                          ? `${currentTheme.gradient} text-white shadow-lg`
                          : `${currentTheme.buttonHover} ${currentTheme.text}`
                      }`}
                    >
                      <div className="text-2xl mb-1">{data.emoji}</div>
                      <div className="text-xs">{data.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Guided Questions */}
              <div className="space-y-4 mb-6">
                {/* Achievements */}
                <div>
                  <label
                    className={`block text-sm font-medium ${currentTheme.textSecondary} mb-2`}
                  >
                    ¿Qué lograste?
                  </label>
                  <textarea
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="Cuéntame tus logros, sin importar el tamaño..."
                    className={`w-full p-3 rounded-lg border ${currentTheme.border} ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500`}
                    rows={3}
                  />
                </div>

                {/* Learnings */}
                <div>
                  <label
                    className={`block text-sm font-medium ${currentTheme.textSecondary} mb-2`}
                  >
                    ¿Qué aprendiste?
                  </label>
                  <textarea
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    placeholder="Lecciones, insights, momentos de claridad..."
                    className={`w-full p-3 rounded-lg border ${currentTheme.border} ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500`}
                    rows={3}
                  />
                </div>

                {/* Improvements */}
                <div>
                  <label
                    className={`block text-sm font-medium ${currentTheme.textSecondary} mb-2`}
                  >
                    ¿Qué mejorarás?
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ideas para la próxima semana..."
                    className={`w-full p-3 rounded-lg border ${currentTheme.border} ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500`}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateReflection}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium ${currentTheme.gradient} text-white transition-all`}
                >
                  <Send size={18} />
                  Guardar Reflexión
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreating(false)}
                  className={`py-3 px-4 rounded-lg font-medium ${currentTheme.buttonHover} transition-all`}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Button */}
        {!isCreating && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className={`w-full py-3 px-4 rounded-lg font-medium mb-6 ${currentTheme.gradient} text-white transition-all`}
          >
            + Nueva Reflexión
          </motion.button>
        )}

        {/* Reflections List */}
        <div className="space-y-4">
          {reflections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${currentTheme.bgCard} rounded-xl p-8 border ${currentTheme.border} text-center`}
            >
              <BookOpen
                size={48}
                className={`${currentTheme.primary} mx-auto mb-4`}
              />
              <h2 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>
                Aún no hay reflexiones
              </h2>
              <p className={currentTheme.textSecondary}>
                Crea tu primera reflexión semanal. Tómate un momento para observar tu semana sin juzgarte.
              </p>
            </motion.div>
          ) : (
            reflections.map((reflection, index) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {MOOD_DATA[reflection.mood].emoji}
                      </span>
                      <span className={`text-sm font-medium ${currentTheme.textSecondary}`}>
                        {MOOD_DATA[reflection.mood].label}
                      </span>
                    </div>
                    <p className={`text-xs ${currentTheme.textMuted}`}>
                      {formatDate(reflection.date)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteReflection(reflection.id)}
                    className={`p-2 rounded-lg ${currentTheme.buttonHover} transition-all`}
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {reflection.achievements && (
                    <div>
                      <p className={`text-sm font-semibold ${currentTheme.text} mb-1`}>
                        ✅ Logros
                      </p>
                      <p className={`text-sm ${currentTheme.textSecondary} leading-relaxed`}>
                        {reflection.achievements}
                      </p>
                    </div>
                  )}

                  {reflection.learnings && (
                    <div>
                      <p className={`text-sm font-semibold ${currentTheme.text} mb-1`}>
                        💡 Aprendizajes
                      </p>
                      <p className={`text-sm ${currentTheme.textSecondary} leading-relaxed`}>
                        {reflection.learnings}
                      </p>
                    </div>
                  )}

                  {reflection.improvements && (
                    <div>
                      <p className={`text-sm font-semibold ${currentTheme.text} mb-1`}>
                        🎯 Mejoras
                      </p>
                      <p className={`text-sm ${currentTheme.textSecondary} leading-relaxed`}>
                        {reflection.improvements}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
