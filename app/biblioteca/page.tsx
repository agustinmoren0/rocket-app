'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Plus, ChevronDown, Zap, Heart, Brain, Smile, Users } from 'lucide-react';

interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  category: string;
  type: 'formar' | 'dejar';
  frequency: string;
  tips?: string[];
}

const HABIT_TEMPLATES: HabitTemplate[] = [
  // Formar - Física
  {
    id: 'h1',
    name: 'Correr',
    description: 'Corre 20-30 minutos para mejorar tu cardio',
    icon: '🏃',
    duration: 30,
    category: 'Física',
    type: 'formar',
    frequency: 'diario',
    tips: ['Calienta antes', 'Hidrátate', 'Estira después'],
  },
  {
    id: 'h2',
    name: 'Beber 2L de agua',
    description: 'Mantente hidratado durante el día',
    icon: '💧',
    duration: 5,
    category: 'Física',
    type: 'formar',
    frequency: 'diario',
  },
  {
    id: 'h3',
    name: 'Estirar',
    description: 'Realiza 10-15 minutos de estiramientos',
    icon: '🧘',
    duration: 15,
    category: 'Física',
    type: 'formar',
    frequency: 'diario',
  },
  // Formar - Mental
  {
    id: 'h4',
    name: 'Meditar',
    description: 'Practica meditación para calmar tu mente',
    icon: '🧘‍♀️',
    duration: 10,
    category: 'Mental',
    type: 'formar',
    frequency: 'diario',
  },
  {
    id: 'h5',
    name: 'Leer',
    description: 'Lee al menos 20 páginas de un libro',
    icon: '📚',
    duration: 30,
    category: 'Mental',
    type: 'formar',
    frequency: 'diario',
  },
  {
    id: 'h6',
    name: 'Escribir',
    description: 'Escribe tus pensamientos o un diario',
    icon: '✍️',
    duration: 20,
    category: 'Mental',
    type: 'formar',
    frequency: 'diario',
  },
  // Formar - Bienestar
  {
    id: 'h7',
    name: 'Dormir bien',
    description: 'Duerme 7-8 horas cada noche',
    icon: '😴',
    duration: 480,
    category: 'Bienestar',
    type: 'formar',
    frequency: 'diario',
  },
  {
    id: 'h8',
    name: 'Yoga',
    description: 'Practica yoga para flexibilidad y paz',
    icon: '🤸',
    duration: 30,
    category: 'Bienestar',
    type: 'formar',
    frequency: 'diario',
  },
  // Dejar
  {
    id: 'h9',
    name: 'Sin redes sociales',
    description: 'Evita usar redes sociales antes de dormir',
    icon: '📵',
    duration: 60,
    category: 'Digital',
    type: 'dejar',
    frequency: 'diario',
  },
  {
    id: 'h10',
    name: 'Evitar comida chatarra',
    description: 'No consumas comida ultraprocesada',
    icon: '🍔',
    duration: 0,
    category: 'Alimentación',
    type: 'dejar',
    frequency: 'diario',
  },
];

const CATEGORIES = [
  { id: 'fisica', label: 'Física', icon: Zap, color: 'from-orange-400 to-red-500' },
  { id: 'mental', label: 'Mental', icon: Brain, color: 'from-purple-400 to-pink-500' },
  { id: 'bienestar', label: 'Bienestar', icon: Heart, color: 'from-red-400 to-pink-500' },
  { id: 'creatividad', label: 'Creatividad', icon: Smile, color: 'from-green-400 to-cyan-500' },
  { id: 'social', label: 'Social', icon: Users, color: 'from-blue-400 to-purple-500' },
];

export default function BibliotecaPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habitType, setHabitType] = useState<'formar' | 'dejar'>('formar');
  const [expandedCategory, setExpandedCategory] = useState<string>('fisica');

  const filteredTemplates = HABIT_TEMPLATES.filter((h) => h.type === habitType);

  const groupedByCategory = filteredTemplates.reduce((acc, habit) => {
    const category = habit.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, HabitTemplate[]>);

  const handleAddHabit = (template: HabitTemplate) => {
    const habit = {
      id: `habit_${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      duration: template.duration,
      category: template.category,
      type: template.type,
      frequency: template.frequency,
      status: 'active',
      createdAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    };

    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    stored.push(habit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(stored));
    router.push('/mis-habitos');
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-32 pt-20 lg:pt-8 lg:pb-8`}>
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Biblioteca</h1>
          <p className={`text-sm ${currentTheme.textMuted}`}>
            Elige de nuestros hábitos pre-diseñados o crea uno personalizado
          </p>
        </motion.div>

        {/* Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-8"
        >
          {['formar' as const, 'dejar' as const].map((type) => (
            <motion.button
              key={type}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setHabitType(type);
                setExpandedCategory(type === 'formar' ? 'Física' : 'Digital');
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                habitType === type
                  ? `${currentTheme.gradient} text-white shadow-lg`
                  : `${currentTheme.bgCard} text-slate-700 border ${currentTheme.border}`
              }`}
            >
              {type === 'formar' ? '✨ A Formar' : '🚫 A Dejar'}
            </motion.button>
          ))}
        </motion.div>

        {/* Habit Templates */}
        <motion.div
          layout
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {Object.entries(groupedByCategory).map(([category, habits], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                {/* Category Header */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category ? '' : category)
                  }
                  className={`w-full ${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border} flex items-center justify-between hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {habitType === 'formar' && category === 'Física' && '🏃'}
                      {habitType === 'formar' && category === 'Mental' && '🧠'}
                      {habitType === 'formar' && category === 'Bienestar' && '❤️'}
                      {habitType === 'dejar' && category === 'Digital' && '📱'}
                      {habitType === 'dejar' && category === 'Alimentación' && '🍽️'}
                    </span>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-900">{category}</h3>
                      <p className={`text-xs ${currentTheme.textMuted}`}>{habits.length} hábitos</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCategory === category ? 180 : 0 }}
                    className={currentTheme.textMuted}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </motion.button>

                {/* Expanded Habits */}
                <AnimatePresence>
                  {expandedCategory === category && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 mt-2 pl-4"
                    >
                      {habits.map((habit, idx) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`${currentTheme.bgCard} rounded-xl p-4 border ${currentTheme.border} flex items-center justify-between`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{habit.icon}</span>
                              <div>
                                <h4 className="font-semibold text-slate-900">{habit.name}</h4>
                                <p className={`text-xs ${currentTheme.textMuted}`}>
                                  {habit.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddHabit(habit)}
                            className={`${currentTheme.gradient} text-white p-2 rounded-lg flex-shrink-0 hover:shadow-lg transition-shadow`}
                          >
                            <Plus size={20} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Create Custom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${currentTheme.bgCard} rounded-2xl p-6 border ${currentTheme.border} text-center mt-8`}
        >
          <p className="text-sm text-slate-700 mb-3">
            ¿No encuentras lo que buscas?
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/crear-habito')}
            className={`${currentTheme.gradient} text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2`}
          >
            <Plus size={18} />
            Crear hábito personalizado
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
