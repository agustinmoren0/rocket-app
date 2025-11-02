'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import BreathingCircles from '@/components/BreathingCircles';

type PageState = 'intro' | 'breathing' | 'complete';

export default function RespirationPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('intro');

  const handleStartBreathing = () => {
    setPageState('breathing');
  };

  const handleCompleteSession = () => {
    // 2 ciclos: 2 × (4s inhala + 7s mantén + 8s exhala) = 38 segundos ≈ 1 minuto
    const durationMinutes = 1; // 1 minuto para la sesión completa de 2 ciclos
    saveBreathingActivity(durationMinutes);
    setPageState('complete');
  };

  const saveBreathingActivity = (durationMinutes: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const newActivity = {
        id: `breathing-${Date.now()}`,
        name: 'Ejercicio de respiración',
        duration: durationMinutes,
        unit: 'min',
        categoria: 'bienestar',
        color: '#8EB7D1',
        date: today,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Guardar en habika_activities_today (formato por día) - PRINCIPAL
      const activitiesToday = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
      activitiesToday[today] = activitiesToday[today] || [];
      activitiesToday[today].push(newActivity);
      localStorage.setItem('habika_activities_today', JSON.stringify(activitiesToday));

      // También guardar en habika_activities (histórico general)
      const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
      activities.push(newActivity);
      localStorage.setItem('habika_activities', JSON.stringify(activities));

      // Y en habika_calendar_YYYY-MM-DD para el calendario
      const calendarKey = `habika_calendar_${today}`;
      const calendarData = JSON.parse(localStorage.getItem(calendarKey) || '{"activities": []}');
      calendarData.activities = calendarData.activities || [];
      calendarData.activities.push(newActivity);
      localStorage.setItem(calendarKey, JSON.stringify(calendarData));

      console.log('✅ Actividad de respiración guardada:', newActivity);
    } catch (error) {
      console.error('Error saving breathing activity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#EAF0F4] pb-40">
      {/* Header con botón cerrar */}
      {pageState !== 'intro' && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-start px-6 py-4 bg-gradient-to-b from-[#F8FAFB] to-transparent">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="p-2 rounded-full bg-[#F3EEEA] hover:bg-white transition-colors"
          >
            <X size={24} className="text-[#3D2C28]" />
          </motion.button>
        </div>
      )}

      {/* Intro Screen */}
      {pageState === 'intro' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-7xl mb-4">🌬️</div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-[#3D2C28] mb-4"
          >
            Respiremos Juntos
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#6B9B9E] mb-12 max-w-sm"
          >
            Solo 2 minutos para volver a tu centro y encontrar la calma que necesitas.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-8 mb-8 border border-[#8EB7D1]/20 shadow-sm"
          >
            <div className="space-y-6 text-left">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">📍</span>
                <div>
                  <h3 className="font-semibold text-[#3D2C28] mb-1">Respira conscientemente</h3>
                  <p className="text-sm text-[#6B9B9E]">Sigue el ritmo de los círculos animados</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">⏱️</span>
                <div>
                  <h3 className="font-semibold text-[#3D2C28] mb-1">Menos de 2 minutos</h3>
                  <p className="text-sm text-[#6B9B9E]">Una sesión rápida y efectiva</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">💾</span>
                <div>
                  <h3 className="font-semibold text-[#3D2C28] mb-1">Registrado automáticamente</h3>
                  <p className="text-sm text-[#6B9B9E]">Se suma a tu progreso diario</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartBreathing}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#8EB7D1] to-[#6B9B9E] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Comencemos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-sm py-3 border-2 border-[#8EB7D1]/30 text-[#3D2C28] rounded-2xl font-semibold mt-3 hover:bg-[#F3EEEA] transition-colors"
          >
            Quizás después
          </motion.button>
        </motion.div>
      )}

      {/* Breathing Screen */}
      {pageState === 'breathing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-screen px-6 pt-20"
        >
          <BreathingCircles
            isActive={pageState === 'breathing'}
            onComplete={handleCompleteSession}
          />
        </motion.div>
      )}

      {/* Complete Screen */}
      {pageState === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="mb-8"
          >
            <div className="text-7xl">🌸</div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-[#3D2C28] mb-4"
          >
            Bien hecho
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-12 text-lg text-[#6B9B9E]"
          >
            <p className="text-2xl font-semibold">"Has vuelto a tu centro"</p>
            <p className="text-base">Tu calma es tu superpoder</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-8 border border-[#8EB7D1]/20 shadow-sm mb-8"
          >
            <p className="text-[#3D2C28] text-sm font-medium">
              ✓ Actividad registrada en tu progreso diario
            </p>
            <p className="text-[#6B9B9E] text-xs mt-2">
              Ejercicio de respiración guardado
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#8EB7D1] to-[#6B9B9E] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Volver al inicio
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
