'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { triggerSuccess } from './Confetti';
import { calculateStreak, recordCompletion, getStreakDisplay } from '../lib/streakLogic';

interface HabitCheckboxProps {
  habitId: string;
  habitName: string;
  date?: string;
  onComplete?: () => void;
}

export default function HabitCheckbox({ habitId, habitName, date, onComplete }: HabitCheckboxProps) {
  const { currentTheme } = useTheme();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const currentDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitCompletions = completions[habitId] || [];
    setIsCompleted(habitCompletions.some((d: string) => d.split('T')[0] === currentDate.split('T')[0]));
  }, [habitId, currentDate]);

  const handleToggle = async () => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitCompletions = completions[habitId] || [];

    if (isCompleted) {
      // Desmarcar
      const updated = habitCompletions.filter((d: string) => d.split('T')[0] !== currentDate.split('T')[0]);
      completions[habitId] = updated;
      localStorage.setItem('habika_completions', JSON.stringify(completions));
    } else {
      // Marcar como completado
      const today = new Date();
      const todayStr = today.toISOString();
      habitCompletions.push(todayStr);
      completions[habitId] = habitCompletions;
      localStorage.setItem('habika_completions', JSON.stringify(completions));

      // Registrar en streak logic
      recordCompletion(habitId);

      // Animación y confetti
      setShowAnimation(true);
      triggerSuccess();

      // Verificar si llegamos a múltiplo de 7
      const streak = getStreakDisplay(habitId);
      if (streak.current >= 7 && streak.current % 7 === 0) {
        setTimeout(() => {
          import('./Confetti').then(({ triggerConfetti }) => triggerConfetti());
        }, 500);
      }

      setTimeout(() => setShowAnimation(false), 2000);
    }

    setIsCompleted(!isCompleted);

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={`relative w-8 h-8 rounded-lg border-2 transition-all ${
          isCompleted
            ? `${currentTheme.gradient} border-transparent`
            : `border-slate-300 hover:border-slate-400 ${currentTheme.bgHover}`
        }`}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check size={20} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Animación flotante al completar */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none top-0"
          >
            <div className="text-2xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
