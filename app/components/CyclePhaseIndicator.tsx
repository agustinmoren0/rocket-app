'use client'

import { useCycle } from '../context/CycleContext';
import { motion } from 'framer-motion';

export default function CyclePhaseIndicator() {
  const { cycleData, getPhaseInfo } = useCycle();

  if (!cycleData.isActive) return null;

  const phaseInfo = getPhaseInfo(cycleData.currentPhase);
  const progress = (cycleData.currentDay / cycleData.cycleLengthDays) * 100;

  return (
    <div className="relative">
      {/* Circular progress bar */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-rose-100"
          />
          {/* Progress circle */}
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 251 }}
            animate={{
              strokeDashoffset: 251 - (251 * progress) / 100,
            }}
            style={{
              strokeDasharray: 251,
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{phaseInfo.emoji}</span>
          <span className="text-xs font-bold text-slate-700">Día {cycleData.currentDay}</span>
        </div>
      </div>
    </div>
  );
}
