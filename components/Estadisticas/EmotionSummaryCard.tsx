'use client';

import { motion } from 'framer-motion';

type MoodType = 'calma' | 'energico' | 'reflexivo' | 'estresado';

interface EmotionSummaryCardProps {
  mood: MoodType;
  summaryText: string;
}

const moodColors: Record<MoodType, { bg: string; icon: string; textColor: string }> = {
  calma: { bg: 'from-blue-100 to-blue-50', icon: '🧘', textColor: 'text-blue-900' },
  energico: { bg: 'from-yellow-100 to-yellow-50', icon: '⚡', textColor: 'text-yellow-900' },
  reflexivo: { bg: 'from-purple-100 to-purple-50', icon: '💭', textColor: 'text-purple-900' },
  estresado: { bg: 'from-orange-100 to-orange-50', icon: '🌊', textColor: 'text-orange-900' },
};

export default function EmotionSummaryCard({ mood, summaryText }: EmotionSummaryCardProps) {
  const moodStyle = moodColors[mood];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${moodStyle.bg} rounded-3xl p-6 mb-6 border border-white/40 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{moodStyle.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${moodStyle.textColor} mb-2`}>
            Tu Estado Emocional
          </h3>
          <p className={`${moodStyle.textColor} text-sm leading-relaxed opacity-90`}>
            {summaryText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
