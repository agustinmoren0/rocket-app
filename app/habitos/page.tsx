'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LUCIDE_ICONS } from '../utils/icons';

export default function HabitosPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'formar' | 'dejar' | 'todos'>('formar');
  const [habits, setHabits] = useState<any[]>([]);
  const [swipedHabit, setSwipedHabit] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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
      completions[habitId].push({ date: today, status: 'completed', timestamp: new Date().toISOString() });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    localStorage.setItem('habika_completions', JSON.stringify(completions));
    loadHabits();
  };

  const handleTouchStart = (e: React.TouchEvent, habitId: string) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, habitId: string) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) setSwipedHabit(habitId);
      else setSwipedHabit(null);
    }
    setTouchStart(null);
  };

  const handlePause = (habitId: string) => {
    const reason = prompt('¿Por qué pausas este hábito?');
    if (!reason) return;

    const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const updated = allHabits.map((h: any) =>
      h.id === habitId
        ? { ...h, status: 'paused', pausedAt: new Date().toISOString(), pausedReason: reason }
        : h
    );

    localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
    loadHabits();
    setSwipedHabit(null);
  };

  const handleDelete = (habitId: string) => {
    if (confirm('¿Eliminar este hábito?\nSe perderá todo el historial.')) {
      const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
      const updated = allHabits.filter((h: any) => h.id !== habitId);
      localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
      loadHabits();
      setSwipedHabit(null);
    }
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
                onTouchStart={(e) => handleTouchStart(e as any, habit.id)}
                onTouchEnd={(e) => handleTouchEnd(e as any, habit.id)}
                className="relative bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Swipe Actions */}
                <AnimatePresence>
                  {swipedHabit === habit.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-end gap-2 px-4 bg-red-50 z-10"
                    >
                      <button
                        onClick={() => handlePause(habit.id)}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium"
                      >
                        Pausar
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-4 flex items-center justify-between">
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
