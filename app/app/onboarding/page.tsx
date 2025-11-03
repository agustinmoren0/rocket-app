'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOnboarding } from '@/app/lib/store';
import { useTheme } from '@/app/context/ThemeContext';
import { useUser } from '@/app/context/UserContext';

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
  const { setUsername } = useUser();
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
    setUsername(name.trim());
    router.replace('/app');
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 pb-20 bg-[#FFF5F0]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60 animate-float" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
      </div>
      <AnimatePresence mode="wait">
        {!showNameInput ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full max-w-md relative z-10"
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
              className="text-3xl font-bold text-center text-[#3D2C28] mb-4"
            >
              {currentStep.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base text-center text-[#6B9B9E] mb-12 leading-relaxed"
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
                    backgroundColor: i === step ? '#FF9B7B' : '#FFB4A8'
                  }}
                />
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FF9B7B] to-[#FFB4A8] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isLastStep ? 'Empezar' : 'Siguiente'}
            </motion.button>

            {step > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setStep(step - 1)}
                className="w-full mt-3 text-sm text-[#A67B6B] hover:text-[#6B9B9E] transition-colors"
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
            className="w-full max-w-md relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-6xl text-center mb-8"
            >
              ✨
            </motion.div>

            <h2 className="text-3xl font-bold text-center text-[#3D2C28] mb-3">
              ¿Cómo te llamamos?
            </h2>

            <p className="text-base text-center text-[#6B9B9E] mb-8">
              Personaliza tu experiencia
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 mb-6 backdrop-blur-xl border border-white/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
                placeholder="Tu nombre"
                autoFocus
                className="w-full bg-transparent text-[#3D2C28] text-xl font-semibold placeholder-[#A67B6B]/50 focus:outline-none"
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinish}
              disabled={!name.trim()}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FF9B7B] to-[#FFB4A8] text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comenzar mi viaje
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowNameInput(false)}
              className="w-full mt-3 text-sm text-[#A67B6B] hover:text-[#6B9B9E] transition-colors"
            >
              Atrás
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
