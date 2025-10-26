'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { getCustomHabits, deleteCustomHabit } from '../lib/store';

export default function MisHabitosPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const loadedHabits = getCustomHabits();
    setHabits(loadedHabits);
  }, []);

  const handleDelete = (id: string) => {
    deleteCustomHabit(id);
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Mis Hábitos 📊
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {habits.length} hábitos activos
            </p>
          </div>
          <button
            onClick={() => router.push('/biblioteca')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600"
          >
            + Nuevo
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm ${
                filter === f
                  ? 'bg-white shadow-md text-slate-900'
                  : 'bg-white/50 text-slate-600'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Completados'}
            </button>
          ))}
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🌱</p>
            <p className="text-slate-600 mb-4">Aún no tenés hábitos</p>
            <button
              onClick={() => router.push('/biblioteca')}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium"
            >
              Explorar biblioteca
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-white rounded-2xl shadow-sm flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: (habit.color || '#3b82f6') + '20' }}
                >
                  {habit.icon || '✨'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{habit.name}</h3>
                  <p className="text-sm text-slate-600">
                    {habit.minutes} min · {habit.frequency === 'daily' ? 'Diario' : 'Personalizado'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="w-10 h-10 rounded-full hover:bg-red-50 text-red-500 flex items-center justify-center"
                >
                  🗑️
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
