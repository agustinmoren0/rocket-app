'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '../hooks/useTheme';
import { saveCustomHabit } from '../lib/store';
import habitsData from '../../data/habits.json';

interface Habit {
  id: string;
  name: string;
  description: string;
  suggestedMinutes: number;
  suggestedFrequency: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  habits: Habit[];
}

export default function BibliotecaPage() {
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(habitsData.categories[0].id);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{
    minutes: number;
    frequency: 'daily' | 'weekly' | '3x-week' | 'flexible';
  }>({
    minutes: 0,
    frequency: 'daily'
  });

  const categories = habitsData.categories as Category[];
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const habits = currentCategory?.habits || [];

  const handleSelectHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setFormData({
      minutes: habit.suggestedMinutes,
      frequency: (habit.suggestedFrequency as 'daily' | 'weekly' | '3x-week' | 'flexible') || 'daily'
    });
    setShowModal(true);
  };

  const handleSaveHabit = () => {
    if (!selectedHabit) return;

    saveCustomHabit({
      name: selectedHabit.name,
      description: selectedHabit.description,
      minutes: formData.minutes,
      frequency: formData.frequency,
      category: currentCategory?.name || 'General'
    });

    setShowModal(false);
    setSelectedHabit(null);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center mb-6`}
            >
              ←
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            🌱 Biblioteca de Hábitos
          </h1>
          <p className="text-slate-600 mt-2">
            Elige hábitos inspiradores o crea los tuyos propios
          </p>
        </motion.div>

        {/* Tabs de categorías */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-x-auto pb-2"
        >
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-2xl font-medium transition-all text-sm whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `${currentTheme.button} text-white shadow-md`
                    : `${currentTheme.bgCard} text-slate-900 hover:${currentTheme.bgHover}`
                }`}
              >
                {cat.emoji} {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Descripción de categoría */}
        {currentCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`${currentTheme.bgCard} rounded-2xl p-4 mb-6 border border-slate-200`}
          >
            <p className="text-slate-700">{currentCategory.description}</p>
          </motion.div>
        )}

        {/* Grid de hábitos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {habits.map((habit, i) => (
            <motion.button
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.03 }}
              onClick={() => handleSelectHabit(habit)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`${currentTheme.bgCard} rounded-2xl p-4 border border-slate-200 text-left transition-all hover:shadow-md`}
            >
              <h3 className="font-semibold text-slate-900 mb-1">{habit.name}</h3>
              <p className="text-sm text-slate-600">{habit.description}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {habit.suggestedMinutes > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}>
                    {habit.suggestedMinutes} min
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                  {habit.suggestedFrequency}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      {showModal && selectedHabit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end z-50"
        >
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedHabit.name}
              </h2>
              <p className="text-slate-600 mb-6">{selectedHabit.description}</p>

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Minutos sugeridos
                  </label>
                  <input
                    type="number"
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Frecuencia
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="3x-week">3 veces a la semana</option>
                    <option value="weekly">Una vez a la semana</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-900 font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHabit}
                  style={{ backgroundColor: currentTheme.primary }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Agregar hábito
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
