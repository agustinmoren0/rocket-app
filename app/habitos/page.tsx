'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { LUCIDE_ICONS } from '../utils/icons';

export default function HabitosPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'formar' | 'dejar' | 'todos'>('formar');
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored.filter((h: any) => h.status === 'active'));
  };

  const getFilteredHabits = () => {
    if (filter === 'todos') return habits;
    return habits.filter(h => h.type === filter);
  };

  const getHabitStats = (habitId: string) => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitComps = completions[habitId] || [];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    const completed = habitComps.filter((c: any) =>
      last30Days.includes(c.date) && c.status === 'completed'
    ).length;
    const consistency = Math.round((completed / 30) * 100);
    return { streak: completed, consistency };
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    if (!completions[habitId]) completions[habitId] = [];

    const existing = completions[habitId].findIndex((c: any) => c.date === today);
    if (existing >= 0) {
      completions[habitId].splice(existing, 1);
    } else {
      completions[habitId].push({ date: today, status: 'completed' });
    }

    localStorage.setItem('habika_completions', JSON.stringify(completions));
    loadHabits();
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    return (completions[habitId] || []).some((c: any) => c.date === today);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Mis Hábitos</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button
          onClick={() => setFilter('formar')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'formar' ? 'bg-[#FF8C66] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          A Formar
        </button>
        <button
          onClick={() => setFilter('dejar')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'dejar' ? 'bg-[#FF8C66] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          A Dejar
        </button>
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'todos' ? 'bg-[#FF8C66] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          Todos
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-3 pb-6">
        {getFilteredHabits().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A67B6B] text-sm">No tienes hábitos en esta categoría</p>
          </div>
        ) : (
          getFilteredHabits().map((habit) => {
            const Icon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS.Star;
            const stats = getHabitStats(habit.id);
            const completed = isCompletedToday(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#FFF5F0] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#FF8C66]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#3D2C28]">{habit.name}</p>
                      <p className="text-xs text-[#A67B6B]">
                        {habit.goalValue} {habit.goalUnit} • {habit.frequency === 'diario' ? 'Diario' : habit.frequency === 'semanal' ? 'Semanal' : 'Mensual'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-[#3D2C28]">{stats.streak}</span>
                        <span className="text-xs text-[#A67B6B]">| {stats.consistency}% constancia</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      completed
                        ? 'bg-[#FF8C66] scale-100'
                        : 'bg-white border-2 border-[#FF8C66]/30 scale-90'
                    }`}
                  >
                    {completed && (
                      <svg className="w-6 h-6 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="max-w-md mx-auto px-6 pb-6">
        <button
          onClick={() => router.push('/biblioteca')}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Hábito
        </button>
      </div>
    </div>
  );
}
