'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOnboarding, setUserName } from '../lib/store';
import { useTheme } from '../hooks/useTheme';

const steps = [
  {
    emoji: '👋',
    title: 'Bienvenido a HABIKA',
    description: 'Visualizá tu progreso real, sin tareas, sin culpa.',
  },
  {
    emoji: '📊',
    title: 'Progreso honesto',
    description: 'HABIKA te muestra cuánto avanzaste de verdad, no cuántas tareas completaste.',
  },
  {
    emoji: '🎯',
    title: 'Sin presión',
    description: 'No hay listas interminables. Solo tu constancia y bienestar.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      setShowNameInput(true);
    } else {
      setStep(step + 1);
    }
  }

  function handleFinish() {
    if (!name.trim()) return;

    completeOnboarding(name.trim());
    router.replace('/');
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex flex-col items-center justify-center px-6`}>
      <AnimatePresence mode="wait">
        {!showNameInput ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full max-w-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-8xl text-center mb-8"
            >
              {currentStep.emoji}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center text-slate-900 mb-4"
            >
              {currentStep.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base text-center text-slate-600 mb-12 leading-relaxed"
            >
              {currentStep.description}
            </motion.p>

            <div className="flex gap-2 justify-center mb-8">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? 'w-8' : 'w-2'
                  }`}
                  style={{
                    backgroundColor: i === step ? currentTheme.primary : '#cbd5e1'
                  }}
                />
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleNext}
              className={`w-full h-12 rounded-2xl ${currentTheme.button} text-white font-medium shadow-md hover:shadow-lg transition-all`}
            >
              {isLastStep ? 'Empezar' : 'Siguiente'}
            </motion.button>

            {step > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setStep(step - 1)}
                className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Atrás
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="text-6xl text-center mb-6">✨</div>

            <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">
              ¿Cómo te llamamos?
            </h2>

            <p className="text-sm text-center text-slate-600 mb-8">
              Personaliza tu experiencia
            </p>

            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
              placeholder="Tu nombre"
              autoFocus
              className="w-full h-12 px-4 rounded-2xl bg-white/80 border-2 border-slate-200 focus:outline-none transition-all"
            />

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleFinish}
              disabled={!name.trim()}
              className={`w-full h-12 rounded-2xl mt-6 ${currentTheme.button} text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Comenzar mi viaje
            </motion.button>

            <button
              onClick={() => setShowNameInput(false)}
              className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Atrás
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
