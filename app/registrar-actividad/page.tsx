'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Clock, Calendar, Save, X } from 'lucide-react';

export default function RegistrarActividadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    minutes: 30,
    date: new Date().toISOString().split('T')[0],
    category: 'energia-fisica',
    notes: '',
  });

  const categories = [
    { value: 'energia-fisica', label: 'Energía Física', color: 'bg-green-100 text-green-700' },
    { value: 'creatividad', label: 'Creatividad', color: 'bg-purple-100 text-purple-700' },
    { value: 'aprendizaje', label: 'Aprendizaje', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'social', label: 'Social', color: 'bg-pink-100 text-pink-700' },
    { value: 'bienestar', label: 'Bienestar', color: 'bg-blue-100 text-blue-700' },
  ];

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresá el nombre de la actividad');
      return;
    }

    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
    const newActivity = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    activities.push(newActivity);
    localStorage.setItem('habika_activities', JSON.stringify(activities));

    router.push('/actividades');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Nueva Actividad
          </h1>
          <div className="w-10" />
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 p-6 space-y-6"
        >
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Qué actividad realizaste?
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Caminar en el parque"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Minutos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock size={16} className="inline mr-2" />
              Duración (minutos)
            </label>
            <input
              type="number"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    formData.category === cat.value
                      ? `${cat.color} ring-2 ring-offset-2 ring-slate-300`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Cómo te sentiste, detalles..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
