'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PhaseType = 'prepare' | 'inhale' | 'hold' | 'exhale';

interface BreathingCirclesProps {
  isActive: boolean;
  onComplete?: () => void;
}

const PHASES = [
  { type: 'inhale' as PhaseType, duration: 4000, label: 'Inhala', color: '#8EB7D1' },
  { type: 'hold' as PhaseType, duration: 7000, label: 'Mantén', color: '#CBE3EE' },
  { type: 'exhale' as PhaseType, duration: 8000, label: 'Exhala', color: '#E8F0F5' },
];

const TOTAL_CYCLES = 3;
const PREPARE_DURATION = 3000; // 3 segundos para prepararse

export default function BreathingCircles({ isActive, onComplete }: BreathingCirclesProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const currentPhase = PHASES[phaseIndex];
  const phaseType = currentPhase.type;
  const phaseDuration = currentPhase.duration / 1000; // en segundos

  // Countdown inicial (3, 2, 1, ¡Comienza!)
  useEffect(() => {
    if (!isActive || !isPreparing) return;

    const countdownTimer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      setIsPreparing(false);
      setCountdown(3);
      setTimeRemaining(Math.ceil(phaseDuration));
    }

    return () => clearTimeout(countdownTimer);
  }, [isActive, isPreparing, countdown, phaseDuration]);

  // Temporizador para contar hacia atrás durante cada fase
  useEffect(() => {
    if (!isActive || isPreparing || isComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Cambiar a siguiente fase
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
            } else {
              // Retornar el tiempo de la siguiente fase
              return Math.ceil(PHASES[0].duration / 1000);
            }
          } else {
            // Retornar el tiempo de la siguiente fase
            return Math.ceil(PHASES[nextPhaseIndex].duration / 1000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPreparing, phaseIndex, cycleCount, isComplete, onComplete]);

  // Calcular escala del círculo según fase y tiempo
  const getCircleScale = () => {
    const progress = (phaseDuration - timeRemaining) / phaseDuration;

    if (phaseType === 'inhale') {
      // Expande de 1 a 1.5+ (fuera de pantalla)
      return 1 + progress * 0.8;
    }
    if (phaseType === 'exhale') {
      // Contrae de 1.5+ a 0.8
      return 1.5 - progress * 0.7;
    }
    // Hold: mantiene la escala
    return 1.3;
  };

  const circleScale = getCircleScale();

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#F5FAFB] via-[#F8FAFC] to-[#EAF0F4]">
      {/* Preparación - Countdown 3, 2, 1 */}
      <AnimatePresence>
        {isPreparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-9xl font-bold text-[#3D2C28]"
            >
              {countdown === 0 ? '¡Comienza!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Círculo grande animado (fluye fuera de pantalla) */}
      {!isPreparing && (
        <motion.div
          animate={{
            scale: circleScale,
          }}
          transition={{
            duration: 0.05,
            ease: 'linear',
          }}
          className="absolute w-48 h-48 rounded-full border-4"
          style={{
            borderColor: `${currentPhase.color}99`,
            boxShadow: `0 0 60px ${currentPhase.color}40, inset 0 0 60px ${currentPhase.color}20`,
          }}
        />
      )}

      {/* Círculos secundarios para efecto layered */}
      {!isPreparing && (
        <>
          <motion.div
            animate={{
              scale: circleScale * 0.7,
            }}
            transition={{
              duration: 0.05,
              ease: 'linear',
            }}
            className="absolute w-48 h-48 rounded-full border-2"
            style={{
              borderColor: `${currentPhase.color}4D`,
            }}
          />
          <motion.div
            animate={{
              scale: circleScale * 1.3,
            }}
            transition={{
              duration: 0.05,
              ease: 'linear',
            }}
            className="absolute w-48 h-48 rounded-full border-2"
            style={{
              borderColor: `${currentPhase.color}33`,
            }}
          />
        </>
      )}

      {/* Contenido central - Texto y Countdown */}
      {!isPreparing && !isComplete && (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Fase actual grande */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.h2
                className="text-6xl font-bold text-[#3D2C28] mb-2"
                animate={{
                  scale: phaseType === 'hold' ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {currentPhase.label}
              </motion.h2>
            </motion.div>
          </AnimatePresence>

          {/* Contador grande y prominente */}
          <motion.div
            key={`${phaseIndex}-${timeRemaining}`}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-8xl font-bold text-[#8EB7D1]"
          >
            {timeRemaining}
          </motion.div>

          {/* Información del ciclo */}
          <motion.p
            className="text-sm text-[#6B9B9E] mt-4"
            animate={{
              opacity: phaseType === 'hold' ? 0.8 : 0.6,
            }}
          >
            Ciclo {cycleCount} de {TOTAL_CYCLES}
          </motion.p>
        </motion.div>
      )}

      {/* Pantalla de Finalización */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative z-50 text-center flex flex-col items-center gap-6"
          >
            {/* Animación de corazón pulsante */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-8xl"
            >
              ✨
            </motion.div>

            <div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-[#3D2C28] mb-3"
              >
                ¡Bien hecho!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-[#6B9B9E]"
              >
                Tu cuerpo y mente están en calma
              </motion.p>
            </div>

            {/* Estadísticas de la sesión */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur rounded-3xl p-6 mt-4"
            >
              <p className="text-sm text-[#6B9B9E]">
                ✓ Completaste 3 ciclos de respiración completa
              </p>
              <p className="text-xs text-[#A67B6B] mt-2">
                Sesión: ~1 minuto • Actividad registrada
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
