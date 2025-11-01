'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingCirclesProps {
  isActive: boolean;
  onPhaseChange?: (phase: Phase) => void;
}

export default function BreathingCircles({ isActive, onPhaseChange }: BreathingCirclesProps) {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(1);

  const phases: { name: Phase; duration: number; label: string; scale: number; color: string }[] = [
    { name: 'inhale', duration: 4, label: 'Inhala', scale: 1.3, color: '#8EB7D1' },
    { name: 'hold', duration: 5, label: 'Retén el aire', scale: 1.3, color: '#CBE3EE' },
    { name: 'exhale', duration: 6, label: 'Exhala', scale: 0.8, color: '#F8F9F7' },
    { name: 'pause', duration: 2, label: 'Respira naturalmente', scale: 0.8, color: '#EAF0F4' },
  ];

  useEffect(() => {
    if (!isActive) return;

    let currentPhaseIndex = 0;
    const interval = setInterval(() => {
      const currentPhase = phases[currentPhaseIndex];
      setPhase(currentPhase.name);
      onPhaseChange?.(currentPhase.name);

      // Cambiar a siguiente fase después de su duración
      setTimeout(() => {
        currentPhaseIndex++;
        if (currentPhaseIndex >= phases.length) {
          currentPhaseIndex = 0;
          setCycleCount((prev) => prev + 1);
        }
      }, currentPhase.duration * 1000);
    }, 17); // 60fps

    return () => clearInterval(interval);
  }, [isActive, onPhaseChange, phases]);

  const currentPhaseData = phases.find((p) => p.name === phase);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      {/* Círculos animados */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Círculo exterior (capa 3) */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.8 : 1,
            opacity: phase === 'hold' ? 0.7 : 0.5,
          }}
          transition={{ duration: phases[phases.findIndex((p) => p.name === phase)].duration, ease: 'easeInOut' }}
          className="absolute w-48 h-48 rounded-full border-4 border-opacity-30"
          style={{ borderColor: currentPhaseData?.color }}
        />

        {/* Círculo medio (capa 2) */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.85 : 1,
            opacity: phase === 'hold' ? 0.6 : 0.4,
          }}
          transition={{ duration: phases[phases.findIndex((p) => p.name === phase)].duration, ease: 'easeInOut' }}
          className="absolute w-36 h-36 rounded-full border-3 border-opacity-40"
          style={{ borderColor: currentPhaseData?.color }}
        />

        {/* Círculo interior (capa 1) */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.1 : phase === 'exhale' ? 0.9 : 1,
            opacity: phase === 'hold' ? 0.5 : 0.3,
          }}
          transition={{ duration: phases[phases.findIndex((p) => p.name === phase)].duration, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full border-2 border-opacity-50"
          style={{ borderColor: currentPhaseData?.color }}
        />

        {/* Punto central */}
        <motion.div
          animate={{
            scale: phase === 'hold' ? 1.1 : 0.9,
            opacity: phase === 'hold' ? 1 : 0.6,
          }}
          transition={{ duration: 0.3 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: currentPhaseData?.color }}
        />
      </div>

      {/* Texto guía */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mt-12 text-center"
      >
        <h2 className="text-3xl font-bold text-[#3D2C28] mb-2">{currentPhaseData?.label}</h2>
        <p className="text-sm text-[#6B9B9E] mb-6">Respiración {cycleCount}</p>
      </motion.div>

      {/* Indicador de progreso visual */}
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < cycleCount ? 1 : 0.8,
              opacity: i < cycleCount ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: i < cycleCount ? currentPhaseData?.color : '#D4D4D4',
            }}
          />
        ))}
      </div>
    </div>
  );
}
