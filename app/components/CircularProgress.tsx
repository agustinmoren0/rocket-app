'use client'

import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

type Props = {
  percentage: number;
};

export default function CircularProgress({ percentage }: Props) {
  const { currentTheme } = useTheme();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="none"
        />

        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke={currentTheme.primary}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <motion.span
          key={percentage}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold text-slate-800"
        >
          {percentage}%
        </motion.span>
        <span className="text-sm text-slate-500 mt-1">Completado</span>
      </motion.div>

      {percentage === 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xl -z-10"
          style={{ backgroundColor: currentTheme.primary }}
        />
      )}
    </div>
  );
}
