'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { Activity, Plus, Calendar, Clock, TrendingUp } from 'lucide-react';

export default function ActividadesPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('habika_activities');
    setActivities(stored ? JSON.parse(stored) : []);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 mb-2"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Actividades 📝
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {activities.length} actividades registradas
            </p>
          </div>
          <button
            onClick={() => router.push('/registrar-actividad')}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Lista de actividades */}
        {activities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">No hay actividades registradas</p>
            <button
              onClick={() => router.push('/registrar-actividad')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Registrar primera actividad
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {act.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {act.minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(act.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    act.category === 'energia-fisica' ? 'bg-green-100 text-green-700' :
                    act.category === 'creatividad' ? 'bg-purple-100 text-purple-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {act.category}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
