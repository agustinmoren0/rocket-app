'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Heart, BookOpen } from 'lucide-react';

interface ProgressGridProps {
  habitsCompleted: number;
  totalHabits: number;
  totalActivityHours: number;
  meditationMinutes: number;
  gratitudeCount: number;
  comparison?: {
    habitsLastWeek?: number;
    meditationDelta?: number;
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
  meditationMinutes,
  gratitudeCount,
  comparison,
}: ProgressGridProps) {
  const habitsPercent = Math.round((habitsCompleted / totalHabits) * 100);

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
            {habitsCompleted}/{totalHabits}
          </p>
          <p className="text-xs text-[#A67B6B]">Hábitos completados</p>
        </div>
        {comparison?.habitsLastWeek !== undefined && (
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
            {totalActivityHours}h
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">
            {totalActivityHours}h {Math.round((totalActivityHours % 1) * 60)}m
          </p>
          <p className="text-xs text-[#A67B6B]">Tiempo total activo</p>
        </div>
        <p className="text-xs text-[#A67B6B]">En actividades registradas</p>
      </motion.div>

      {/* Meditación */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-[#FFB4A8]/30 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <Heart size={24} className="text-[#FF99AC] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#FF99AC] bg-[#FFE8F0] px-2 py-1 rounded-full">
            {meditationMinutes}m
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">
            {Math.floor(meditationMinutes / 60)}h {meditationMinutes % 60}m
          </p>
          <p className="text-xs text-[#A67B6B]">Meditación</p>
        </div>
        {comparison?.meditationDelta !== undefined && (
          <p className="text-xs text-[#FF99AC] font-medium">
            {comparison.meditationDelta > 0
              ? `+${comparison.meditationDelta}m vs semana pasada`
              : 'Sin cambios'}
          </p>
        )}
      </motion.div>

      {/* Gratitud */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-[#FFB4A8]/30 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <BookOpen size={24} className="text-[#FF99AC] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#FF99AC] bg-[#FFE8F0] px-2 py-1 rounded-full">
            {gratitudeCount}
          </span>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-[#3D2C28]">{gratitudeCount}</p>
          <p className="text-xs text-[#A67B6B]">Entradas de gratitud</p>
        </div>
        <p className="text-xs text-[#A67B6B]">Registradas</p>
      </motion.div>
    </motion.div>
  );
}
