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
  great: { emoji: '🚀', label: 'Excelente', bg: 'from-[#FF9B7B] to-[#FFC0A9]', color: '#FF9B7B' },
  good: { emoji: '😊', label: 'Bien', bg: 'from-[#8EB7D1] to-[#CBE3EE]', color: '#8EB7D1' },
  okay: { emoji: '😐', label: 'Normal', bg: 'from-[#FFB4A8] to-[#FFD4C7]', color: '#FFB4A8' },
  tough: { emoji: '😤', label: 'Difícil', bg: 'from-[#A67B6B] to-[#C4A09E]', color: '#A67B6B' },
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0] p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-[#FFB4A8]/20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0] p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#3D2C28] mb-2">
            Reflexiones
          </h1>
          <p className="text-[#A67B6B]">
            Tu diario de crecimiento personal
          </p>
        </motion.div>

        {/* Create Reflection Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-6 mb-6 backdrop-blur-xl border border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              <h2 className="text-xl font-semibold text-[#3D2C28] mb-4">
                Nueva Reflexión
              </h2>

              {/* Mood Selector */}
              <div className="mb-6">
                <p className="text-sm font-medium text-[#A67B6B] mb-3">
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
                      className={`py-3 px-2 rounded-xl font-medium transition-all ${
                        mood === key
                          ? `bg-gradient-to-br ${data.bg} text-white shadow-lg backdrop-blur-md`
                          : 'bg-white/40 hover:bg-white/60 text-[#3D2C28] border border-white/30 backdrop-blur-md'
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
                  <label className="block text-sm font-medium text-[#3D2C28] mb-2">
                    ¿Qué lograste?
                  </label>
                  <textarea
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="Cuéntame tus logros, sin importar el tamaño..."
                    className="w-full p-3 rounded-xl border border-white/30 bg-white/40 backdrop-blur-md text-[#3D2C28] placeholder-[#A67B6B]/60 focus:outline-none focus:border-white/60 transition-all"
                    rows={3}
                  />
                </div>

                {/* Learnings */}
                <div>
                  <label className="block text-sm font-medium text-[#3D2C28] mb-2">
                    ¿Qué aprendiste?
                  </label>
                  <textarea
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    placeholder="Lecciones, insights, momentos de claridad..."
                    className="w-full p-3 rounded-xl border border-white/30 bg-white/40 backdrop-blur-md text-[#3D2C28] placeholder-[#A67B6B]/60 focus:outline-none focus:border-white/60 transition-all"
                    rows={3}
                  />
                </div>

                {/* Improvements */}
                <div>
                  <label className="block text-sm font-medium text-[#3D2C28] mb-2">
                    ¿Qué mejorarás?
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ideas para la próxima semana..."
                    className="w-full p-3 rounded-xl border border-white/30 bg-white/40 backdrop-blur-md text-[#3D2C28] placeholder-[#A67B6B]/60 focus:outline-none focus:border-white/60 transition-all"
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-[#FF9B7B] to-[#FFB4A8] text-white transition-all hover:shadow-lg shadow-md"
                >
                  <Send size={18} />
                  Guardar Reflexión
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreating(false)}
                  className="py-3 px-4 rounded-xl font-medium bg-white/40 backdrop-blur-md text-[#3D2C28] transition-all hover:bg-white/60 border border-white/30"
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
            className="w-full py-3 px-4 rounded-xl font-medium mb-6 bg-gradient-to-r from-[#FF9B7B] to-[#FFB4A8] text-white transition-all hover:shadow-lg shadow-md"
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
              className="rounded-2xl p-8 backdrop-blur-xl border border-white/20 text-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              <BookOpen
                size={48}
                className="text-[#FF9B7B] mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-[#3D2C28] mb-2">
                Aún no hay reflexiones
              </h2>
              <p className="text-[#A67B6B]">
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
                className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {MOOD_DATA[reflection.mood].emoji}
                      </span>
                      <span className="text-sm font-medium text-[#A67B6B]">
                        {MOOD_DATA[reflection.mood].label}
                      </span>
                    </div>
                    <p className="text-xs text-[#D4B5A9]">
                      {formatDate(reflection.date)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteReflection(reflection.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {reflection.achievements && (
                    <div>
                      <p className="text-sm font-semibold text-[#3D2C28] mb-1">
                        ✅ Logros
                      </p>
                      <p className="text-sm text-[#A67B6B] leading-relaxed">
                        {reflection.achievements}
                      </p>
                    </div>
                  )}

                  {reflection.learnings && (
                    <div>
                      <p className="text-sm font-semibold text-[#3D2C28] mb-1">
                        💡 Aprendizajes
                      </p>
                      <p className="text-sm text-[#A67B6B] leading-relaxed">
                        {reflection.learnings}
                      </p>
                    </div>
                  )}

                  {reflection.improvements && (
                    <div>
                      <p className="text-sm font-semibold text-[#3D2C28] mb-1">
                        🎯 Mejoras
                      </p>
                      <p className="text-sm text-[#A67B6B] leading-relaxed">
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
