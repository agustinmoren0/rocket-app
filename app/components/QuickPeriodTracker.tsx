'use client'

import { useState } from 'react';
import { useCycle } from '../context/CycleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Check } from 'lucide-react';
import { showToast } from './Toast';

export default function QuickPeriodTracker() {
  const { cycleData, registerNewPeriod } = useCycle();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!cycleData.isActive) return null;

  const today = new Date().toISOString().split('T')[0];
  const isInPeriod = cycleData.currentDay <= cycleData.periodLengthDays;

  const handleQuickRegister = () => {
    if (confirm('¿Tu periodo comenzó hoy?')) {
      registerNewPeriod(today);
      setShowSuccess(true);
      showToast('Periodo registrado ✅', 'success');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <>
      {!isInPeriod && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={handleQuickRegister}
          className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Droplet size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 right-6 lg:bottom-16 lg:right-8 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
          >
            <Check size={20} />
            <span className="font-medium">Periodo registrado</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
