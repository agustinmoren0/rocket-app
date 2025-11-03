'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface ProgressGridProps {
  habitsCompleted: number;
  totalHabits: number;
  totalActivityHours: number;
  consistencyPercent: number;
  comparison?: {
    habitsLastWeek?: number;
    consistencyDelta?: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function ProgressGrid({
  habitsCompleted,
  totalHabits,
  totalActivityHours,
  consistencyPercent,
  comparison,
}: ProgressGridProps) {
  const habitsPercent = totalHabits > 0 ? Math.round((habitsCompleted / totalHabits) * 100) : 0;
  const hours = Math.floor(totalActivityHours);
  const minutes = Math.round((totalActivityHours % 1) * 60);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 mb-6"
    >
      {/* Hábitos Completados */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-[#FFB4A8]/30 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <CheckCircle2 size={24} className="text-[#FF99AC] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#FF99AC] bg-[#FFE8F0] px-2 py-1 rounded-full">
            {habitsPercent}%
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">
            {totalHabits > 0 ? `${habitsCompleted}/${totalHabits}` : '—'}
          </p>
          <p className="text-xs text-[#A67B6B]">Hábitos completados</p>
        </div>
        {totalHabits === 0 && (
          <p className="text-xs text-[#A67B6B]">Crea hábitos para empezar</p>
        )}
        {comparison?.habitsLastWeek !== undefined && totalHabits > 0 && (
          <p className="text-xs text-[#FF99AC] font-medium">
            {habitsCompleted > comparison.habitsLastWeek
              ? `+${habitsCompleted - comparison.habitsLastWeek} vs semana pasada`
              : 'Sin cambios'}
          </p>
        )}
      </motion.div>

      {/* Tiempo Total */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-[#FFB4A8]/30 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <Clock size={24} className="text-[#FF99AC] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#FF99AC] bg-[#FFE8F0] px-2 py-1 rounded-full">
            {totalActivityHours > 0 ? `${hours}h` : '—'}
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">
            {totalActivityHours > 0 ? `${hours}h ${minutes}m` : '—'}
          </p>
          <p className="text-xs text-[#A67B6B]">Tiempo activo</p>
        </div>
        {totalActivityHours === 0 && (
          <p className="text-xs text-[#A67B6B]">Registra actividades</p>
        )}
      </motion.div>

      {/* Consistencia */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-[#FFB4A8]/30 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <TrendingUp size={24} className="text-[#FF99AC] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#FF99AC] bg-[#FFE8F0] px-2 py-1 rounded-full">
            {consistencyPercent}%
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">
            {consistencyPercent}%
          </p>
          <p className="text-xs text-[#A67B6B]">Consistencia</p>
        </div>
        {comparison?.consistencyDelta !== undefined && (
          <p className="text-xs text-[#FF99AC] font-medium">
            {comparison.consistencyDelta > 0
              ? `+${comparison.consistencyDelta}% vs semana pasada`
              : 'Sin cambios'}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
