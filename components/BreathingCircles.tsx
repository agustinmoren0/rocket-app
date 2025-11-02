'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PhaseType = 'prepare' | 'inhale' | 'hold' | 'exhale';

interface BreathingCirclesProps {
  isActive: boolean;
  onComplete?: () => void;
}

const PHASES = [
  { type: 'inhale' as PhaseType, duration: 4000, label: 'Inhala', shortLabel: 'Inhalando', color: '#8EB7D1', bgColor: 'rgba(142, 183, 209, 0.15)' },
  { type: 'hold' as PhaseType, duration: 7000, label: 'Mantén', shortLabel: 'Reteniendo', color: '#CBE3EE', bgColor: 'rgba(203, 227, 238, 0.15)' },
  { type: 'exhale' as PhaseType, duration: 8000, label: 'Exhala', shortLabel: 'Exhalando', color: '#E8F0F5', bgColor: 'rgba(232, 240, 245, 0.15)' },
];

const TOTAL_CYCLES = 3;

export default function BreathingCircles({ isActive, onComplete }: BreathingCirclesProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 a 1 para animación fluida

  // Timestamps para sincronizar animaciones
  const phaseStartTimeRef = useRef<number>(0);
  const prepareStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const phaseType = currentPhase.type;
  const phaseDurationMs = currentPhase.duration;

  // Countdown inicial (3, 2, 1, ¡Comienza!)
  useEffect(() => {
    if (!isActive || !isPreparing) return;

    const countdownTimer = setTimeout(() => {
      setCountdown((prev) => {
        const newCount = prev - 1;
        if (newCount === 0) {
          setIsPreparing(false);
          setCountdown(3);
          setTimeRemaining(Math.ceil(phaseDurationMs / 1000));
          setPhaseProgress(0);
          phaseStartTimeRef.current = Date.now();
        }
        return newCount;
      });
    }, 1000);

    return () => clearTimeout(countdownTimer);
  }, [isActive, isPreparing, countdown, phaseDurationMs]);

  // Actualizar timeRemaining cada segundo (solo para el display)
  useEffect(() => {
    if (!isActive || isPreparing || isComplete) return;

    const updateTimer = setInterval(() => {
      const elapsedMs = Date.now() - phaseStartTimeRef.current;
      const remainingMs = phaseDurationMs - elapsedMs;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeRemaining(remainingSeconds);

      // Cambiar de fase cuando el tiempo se acabe
      if (remainingMs <= 0) {
        const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
        setPhaseIndex(nextPhaseIndex);
        setPhaseProgress(0);
        phaseStartTimeRef.current = Date.now();

        // Si completamos un ciclo
        if (nextPhaseIndex === 0) {
          const nextCycleCount = cycleCount + 1;
          setCycleCount(nextCycleCount);

          // Si completamos todos los ciclos
          if (nextCycleCount > TOTAL_CYCLES) {
            setIsComplete(true);
            onComplete?.();
          } else {
            setTimeRemaining(Math.ceil(PHASES[0].duration / 1000));
          }
        } else {
          setTimeRemaining(Math.ceil(PHASES[nextPhaseIndex].duration / 1000));
        }
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [isActive, isPreparing, isComplete, phaseIndex, cycleCount, phaseDurationMs]);

  // AnimationFrame para progreso suave y continuo
  useEffect(() => {
    if (isPreparing || isComplete) return;

    const updateProgress = () => {
      const elapsedMs = Date.now() - phaseStartTimeRef.current;
      const progress = Math.min(1, Math.max(0, elapsedMs / phaseDurationMs));
      setPhaseProgress(progress);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPreparing, isComplete, phaseDurationMs]);

  // Calcular escala de los círculos según fase - FLUIDA Y CONTINUA
  const getCircleScale = (layer: number) => {
    const baseScale = layer;

    if (phaseType === 'inhale') {
      // Expande fluidamente de baseScale a baseScale+0.6 durante toda la inhalación
      return baseScale + (phaseProgress * 0.6);
    }
    if (phaseType === 'exhale') {
      // Contrae fluidamente de baseScale+0.5 a baseScale-0.1 durante toda la exhalación
      return (baseScale + 0.5) - (phaseProgress * 0.6);
    }
    // Hold: mantiene la escala con pequeña oscillación suave
    return baseScale + (Math.sin(phaseProgress * Math.PI * 2) * 0.05);
  };

  const scale1 = getCircleScale(1);
  const scale07 = getCircleScale(0.7);
  const scale13 = getCircleScale(1.3);

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000"
      style={{
        backgroundColor: currentPhase.bgColor,
        backgroundImage: `linear-gradient(135deg, ${currentPhase.bgColor}, rgba(248, 250, 251, 0.5))`,
      }}
    >
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
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-9xl font-bold text-[#3D2C28]"
            >
              {countdown === 0 ? '¡Comienza!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Círculos concéntricos - Efecto Glowin - MOVIMIENTO FLUIDO */}
      {!isPreparing && !isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Círculo externo - más grande */}
          <div
            className="absolute w-56 h-56 rounded-full border-2"
            style={{
              borderColor: `${currentPhase.color}40`,
              boxShadow: `0 0 40px ${currentPhase.color}20`,
              transform: `scale(${scale13})`,
              transition: 'none', // Sin transición para fluidez perfecta
            }}
          />

          {/* Círculo medio principal */}
          <div
            className="absolute w-48 h-48 rounded-full border-4"
            style={{
              borderColor: `${currentPhase.color}CC`,
              boxShadow: `0 0 80px ${currentPhase.color}50, inset 0 0 40px ${currentPhase.color}30`,
              transform: `scale(${scale1})`,
              transition: 'none', // Sin transición para fluidez perfecta
            }}
          />

          {/* Círculo interno - más pequeño */}
          <div
            className="absolute w-40 h-40 rounded-full border-2"
            style={{
              borderColor: `${currentPhase.color}80`,
              boxShadow: `0 0 30px ${currentPhase.color}30`,
              transform: `scale(${scale07})`,
              transition: 'none', // Sin transición para fluidez perfecta
            }}
          />
        </div>
      )}

      {/* Contenido central - Texto y Countdown */}
      {!isPreparing && !isComplete && (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Indicador de fase - Color y nombre */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Badge de la fase actual */}
              <motion.div
                className="inline-block px-6 py-2 rounded-full text-white font-semibold mb-4 text-lg"
                style={{
                  backgroundColor: currentPhase.color,
                }}
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                {currentPhase.shortLabel}
              </motion.div>

              {/* Nombre de la fase grande */}
              <motion.h2
                className="text-7xl font-bold text-[#3D2C28]"
                animate={{
                  scale: phaseType === 'hold' ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {currentPhase.label}
              </motion.h2>
            </motion.div>
          </AnimatePresence>

          {/* Contador grande y prominente - Mostrando segundos que quedan */}
          <div className="text-9xl font-bold text-[#8EB7D1]">
            {timeRemaining}
          </div>

          {/* Barra de progreso visual - FLUIDA */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-48 h-1 bg-gray-300/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: currentPhase.color,
                  width: `${phaseProgress * 100}%`,
                  transition: 'none', // Sin transición para máxima fluidez
                }}
              />
            </div>
          </div>

          {/* Información del ciclo con mejor visibilidad */}
          <motion.div
            className="mt-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: `${currentPhase.color}20`,
            }}
          >
            <p className="text-sm font-semibold text-[#3D2C28]">
              Ciclo {cycleCount} de {TOTAL_CYCLES}
            </p>
          </motion.div>
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
            {/* Animación de brillo pulsante */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
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
