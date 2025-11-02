'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PhaseType = 'inhale' | 'hold' | 'exhale';

interface BreathingCirclesProps {
  isActive: boolean;
  onComplete?: () => void;
}

const PHASES = [
  { type: 'inhale' as PhaseType, duration: 4000, label: 'Inhala 🌿', emoji: '🌿' },
  { type: 'hold' as PhaseType, duration: 7000, label: 'Mantén ✨', emoji: '✨' },
  { type: 'exhala' as PhaseType, duration: 8000, label: 'Exhala 💨', emoji: '💨' },
];

const TOTAL_CYCLES = 3;
const CYCLE_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0);

export default function BreathingCircles({ isActive, onComplete }: BreathingCirclesProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const currentPhase = PHASES[phaseIndex];
  const phaseType = currentPhase.type;

  // Sincronizar fases con timers precisos
  useEffect(() => {
    if (!isActive || isComplete) return;

    const timer = setTimeout(() => {
      // Avanzar a siguiente fase
      const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
      setPhaseIndex(nextPhaseIndex);

      // Si completamos un ciclo
      if (nextPhaseIndex === 0) {
        const nextCycleCount = cycleCount + 1;
        setCycleCount(nextCycleCount);

        // Si completamos todos los ciclos
        if (nextCycleCount > TOTAL_CYCLES) {
          setIsComplete(true);
          onComplete?.();
        }
      }
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [isActive, phaseIndex, cycleCount, isComplete, currentPhase.duration, onComplete]);

  // Calcular escala según fase
  const getScale = () => {
    if (phaseType === 'inhale') return 1.4;
    if (phaseType === 'exhale') return 0.9;
    return 1.1;
  };

  // Calcular opacidad según fase
  const getOpacity = () => {
    if (phaseType === 'hold') return 0.8;
    return 0.5;
  };

  // Calcular progreso visual (círculos indicadores)
  const getTotalProgress = () => {
    return (cycleCount - 1) * PHASES.length + phaseIndex + 1;
  };

  const totalSteps = TOTAL_CYCLES * PHASES.length;

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[500px] px-6">
      {!isComplete ? (
        <>
          {/* Fondo con degradado suave */}
          <div className="absolute inset-0 -z-10 rounded-3xl"
            style={{
              background: 'radial-gradient(circle at center, #F5FAFB 0%, #E9F1F5 100%)',
            }}
          />

          {/* Contenedor de círculos */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            {/* Tres círculos concéntricos con leve offset de delay */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: phaseType === 'inhale' ? 1.2 + i * 0.1 : phaseType === 'exhale' ? 0.9 - i * 0.05 : 1 + i * 0.05,
                  opacity: 0.3 + i * 0.2,
                }}
                transition={{
                  duration: currentPhase.duration / 1000,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
                className="absolute rounded-full border-2"
                style={{
                  width: `${160 - i * 40}px`,
                  height: `${160 - i * 40}px`,
                  borderColor: '#A7C3CF',
                }}
              />
            ))}

            {/* Punto central que brilla */}
            <motion.div
              animate={{
                scale: phaseType === 'hold' ? 1.2 : 0.8,
                opacity: phaseType === 'hold' ? 1 : 0.4,
              }}
              transition={{
                duration: currentPhase.duration / 1000,
                ease: 'easeInOut',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: '#8EB7D1' }}
            />
          </div>

          {/* Texto guía sincronizado */}
          <div className="text-center mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-5xl">{currentPhase.emoji}</div>
                <h2 className="text-4xl font-semibold text-[#3D2C28]">
                  {currentPhase.label.split(' ')[0]}
                </h2>
                <p className="text-sm text-[#6B9B9E] mt-2">
                  Ciclo {cycleCount} de {TOTAL_CYCLES}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicador de progreso */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i < getTotalProgress() ? 1 : 0.7,
                  opacity: i < getTotalProgress() ? 1 : 0.2,
                }}
                transition={{ duration: 0.3 }}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i < getTotalProgress() ? '#8EB7D1' : '#D4D4D4',
                }}
              />
            ))}
          </div>

          {/* Timer visual */}
          <div className="mt-12 text-center">
            <p className="text-sm text-[#6B9B9E]">
              {Math.ceil(currentPhase.duration / 1000)} segundos
            </p>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-3xl font-bold text-[#3D2C28] mb-2">¡Bien hecho!</h2>
          <p className="text-[#6B9B9E] text-lg">
            Tu cuerpo y mente están en calma
          </p>
        </motion.div>
      )}
    </div>
  );
}
