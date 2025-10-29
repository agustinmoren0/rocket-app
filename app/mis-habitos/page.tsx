'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MisHabitosPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'formar' | 'dejar' | 'todos'>('formar');
  const [swipedHabit, setSwipedHabit] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored.filter((h: any) => h.status === 'active'));
  };

  const filteredHabits = habits.filter(h => {
    if (filter === 'todos') return true;
    if (filter === 'formar') return h.type !== 'dejar';
    if (filter === 'dejar') return h.type === 'dejar';
    return true;
  });

  const handleComplete = (habitId: string) => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitCompletions = completions[habitId] || [];
    const today = new Date().toISOString().split('T')[0];

    habitCompletions.push({
      date: today,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });

    completions[habitId] = habitCompletions;
    localStorage.setItem('habika_completions', JSON.stringify(completions));

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

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
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const habitComps = completions[habitId] || [];
    return habitComps.some((c: any) => c.date === today && c.status === 'completed');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-32 bg-[#FFF5F0]">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60" />
      </div>

      {/* Header sticky */}
      <header className="sticky top-0 z-20 p-4 pt-6 glass-stitch border-0">
        <h1 className="text-3xl font-bold tracking-tight text-center text-[#3D2C28]">Mis Hábitos</h1>
        <div className="mt-4 p-1 glass-stitch rounded-full flex items-center justify-between text-sm">
          <button
            onClick={() => setFilter('formar')}
            className={`w-1/3 py-2 rounded-full font-semibold transition-all ${
              filter === 'formar' ? 'bg-white text-[#FF8C66] shadow' : 'text-[#A67B6B]'
            }`}
          >
            A Formar
          </button>
          <button
            onClick={() => setFilter('dejar')}
            className={`w-1/3 py-2 rounded-full font-semibold transition-all ${
              filter === 'dejar' ? 'bg-white text-[#FF8C66] shadow' : 'text-[#A67B6B]'
            }`}
          >
            A Dejar
          </button>
          <button
            onClick={() => setFilter('todos')}
            className={`w-1/3 py-2 rounded-full font-semibold transition-all ${
              filter === 'todos' ? 'bg-white text-[#FF8C66] shadow' : 'text-[#A67B6B]'
            }`}
          >
            Todos
          </button>
        </div>
      </header>

      {/* Hábitos list */}
      <main className="flex-grow p-4 space-y-4">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A67B6B] text-lg mb-4">No tienes hábitos aquí</p>
            <button
              onClick={() => router.push('/biblioteca')}
              className="px-6 py-3 bg-gradient-to-br from-[#FF8C66] to-[#FF99AC] text-white rounded-xl font-bold shadow-lg"
            >
              Crear primer hábito
            </button>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const isSwiped = swipedHabit === habit.id;
            const completed = isCompletedToday(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                {/* Swipe actions background */}
                <AnimatePresence>
                  {isSwiped && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-end gap-2 pr-4 rounded-xl bg-gradient-to-l from-red-500/20 to-transparent"
                    >
                      <button
                        onClick={() => router.push(`/editar-habito/${habit.id}`)}
                        className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-white text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => handlePause(habit.id)}
                        className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-white text-xl">pause</span>
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-white text-xl">delete</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Habit card */}
                <motion.div
                  onTouchStart={(e) => handleTouchStart(e, habit.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, habit.id)}
                  animate={{ x: isSwiped ? -150 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="glass-stitch rounded-xl shadow-lg p-4 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-4xl">
                    {habit.icon || habit.name.charAt(0)}
                  </div>

                  <div className="flex-grow">
                    <p className="font-bold text-[#3D2C28]">{habit.name}</p>
                    <p className="text-sm text-[#A67B6B] mt-1">
                      {habit.frequency === 'diario' ? 'Cada día' : 'Personalizado'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-medium">
                      <span>🔥 {habit.streak || 0}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-[#3D2C28]/80">{habit.totalCompletions || 0}% constancia</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <input
                      checked={completed}
                      onChange={() => !completed && handleComplete(habit.id)}
                      className="hidden"
                      id={`habit-${habit.id}`}
                      type="checkbox"
                    />
                    <label
                      htmlFor={`habit-${habit.id}`}
                      className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        completed
                          ? 'bg-gradient-to-br from-[#FF8C66] to-[#FFC0A9]'
                          : 'border-2 border-[#FF8C66]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-white">check</span>
                    </label>
                  </div>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </main>

      {/* Botón crear hábito */}
      <div className="fixed bottom-[8rem] left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => router.push('/biblioteca')}
          className="group flex items-center justify-center gap-2 pl-5 pr-6 h-14 bg-gradient-to-br from-[#FF8C66] to-[#FF99AC] rounded-full shadow-lg text-white font-semibold transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add_circle</span>
          <span>Crear Hábito</span>
        </button>
      </div>
    </div>
  );
}
