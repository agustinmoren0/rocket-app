'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Brain, Cloud } from 'lucide-react';

type MoodType = 'calma' | 'energico' | 'reflexivo' | 'estresado';

interface EmotionSummaryCardProps {
  mood: MoodType;
  summaryText: string;
}

const moodColors: Record<MoodType, { bg: string; icon: any; textColor: string; title: string }> = {
  calma: {
    bg: 'from-blue-100 to-blue-50',
    icon: Heart,
    textColor: 'text-blue-900',
    title: 'En Calma'
  },
  energico: {
    bg: 'from-yellow-100 to-yellow-50',
    icon: Zap,
    textColor: 'text-yellow-900',
    title: 'Energético'
  },
  reflexivo: {
    bg: 'from-purple-100 to-purple-50',
    icon: Brain,
    textColor: 'text-purple-900',
    title: 'Reflexivo'
  },
  estresado: {
    bg: 'from-orange-100 to-orange-50',
    icon: Cloud,
    textColor: 'text-orange-900',
    title: 'Bajo Estrés'
  },
};

export default function EmotionSummaryCard({ mood, summaryText }: EmotionSummaryCardProps) {
  const moodStyle = moodColors[mood];
  const Icon = moodStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${moodStyle.bg} rounded-3xl p-6 mb-6 border border-white/40 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className={`${moodStyle.textColor} w-8 h-8`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${moodStyle.textColor} mb-2`}>
            {moodStyle.title}
          </h3>
          <p className={`${moodStyle.textColor} text-sm leading-relaxed opacity-90`}>
            {summaryText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
