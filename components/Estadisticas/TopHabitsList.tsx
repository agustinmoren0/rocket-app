'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Droplets, Zap, Dumbbell, BookOpen, Heart, Moon, Sun } from 'lucide-react';

interface TopHabit {
  id: string;
  name: string;
  icon: string;
  completed: number;
  total: number;
}

interface TopHabitsListProps {
  topHabits: TopHabit[];
  summary: string;
}

const getHabitIcon = (habitName: string) => {
  const name = habitName.toLowerCase();
  if (name.includes('agua')) return Droplets;
  if (name.includes('meditación') || name.includes('meditacion')) return Heart;
  if (name.includes('ejercicio') || name.includes('correr') || name.includes('yoga')) return Dumbbell;
  if (name.includes('lectura') || name.includes('leer')) return BookOpen;
  if (name.includes('dormir') || name.includes('sueño')) return Moon;
  if (name.includes('energía') || name.includes('energia')) return Zap;
  if (name.includes('sol') || name.includes('luz')) return Sun;
  return Heart; // Default
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export default function TopHabitsList({ topHabits, summary }: TopHabitsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-3xl p-6 mb-6 border border-[#FFB4A8]/30 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star size={20} className="text-[#FF99AC]" />
        <h3 className="text-lg font-semibold text-[#3D2C28]">Hábitos Estrella</h3>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-4"
      >
        {topHabits.length > 0 ? (
          topHabits.map((habit, idx) => {
            const percentage = Math.round((habit.completed / habit.total) * 100);
            const isPerfect = percentage === 100;
            const IconComponent = getHabitIcon(habit.name);

            return (
              <motion.div
                key={habit.id}
                variants={itemVariants}
                className={`p-4 rounded-2xl transition-all ${
                  isPerfect
                    ? 'bg-gradient-to-r from-[#FFE8F0] to-[#FFF5F0] border-2 border-[#FF99AC]'
                    : 'bg-[#FFF5F0] border border-[#FFB4A8]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <IconComponent className="w-6 h-6 text-[#FF99AC] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#3D2C28] truncate">{habit.name}</p>
                      <p className="text-xs text-[#A67B6B]">
                        {habit.completed}/{habit.total} días
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPerfect && (
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrendingUp size={16} className="text-[#FF99AC]" />
                      </motion.div>
                    )}
                    <span className={`text-sm font-bold ${isPerfect ? 'text-[#FF99AC]' : 'text-[#A67B6B]'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-[#FFB4A8]/20 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-[#A67B6B] text-center py-4">
            No hay hábitos completados aún
          </p>
        )}
      </motion.div>

      <p className="text-sm text-[#A67B6B] bg-[#FFF5F0] p-4 rounded-2xl">
        ✨ {summary}
      </p>
    </motion.div>
  );
}
