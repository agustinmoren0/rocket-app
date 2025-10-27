'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Activity, Plus, Calendar, Clock, TrendingUp, Edit2, Trash2, X } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ActividadesPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('habika_activities');
    setActivities(stored ? JSON.parse(stored) : []);
  }, []);

  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    localStorage.setItem('habika_activities', JSON.stringify(updated));
    setSelectedActivity(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-40">
      <div className="max-w-4xl mx-auto p-6">
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
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedActivity(act)}
                className="w-full p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all text-left"
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
              </motion.button>
            ))}
          </div>
        )}

        {/* Modal Editar/Eliminar */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className={`${currentTheme.bgCard} rounded-3xl p-6 max-w-sm w-full border border-white/40`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{selectedActivity.name}</h3>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  {selectedActivity.minutes} minutos · {new Date(selectedActivity.date).toLocaleDateString('es-ES')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      router.push(`/editar-actividad/${selectedActivity.id}`);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 font-medium flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(selectedActivity.id)}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2 hover:bg-red-600"
                  >
                    <Trash2 size={18} />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </main>
  );
}
