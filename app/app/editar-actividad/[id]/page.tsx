'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { Save, X } from 'lucide-react';

export default function EditarActividadPage() {
  const router = useRouter();
  const params = useParams();
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    minutes: 20,
    unit: 'min',
    category: 'energia-fisica',
    date: '',
    notes: '',
  });

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
    const activity = activities.find((a: any) => a.id === params.id);
    if (activity) setFormData(activity);
  }, [params.id]);

  const handleSave = () => {
    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
    const updated = activities.map((a: any) =>
      a.id === params.id ? { ...formData, id: params.id } : a
    );
    localStorage.setItem('habika_activities', JSON.stringify(updated));
    router.push('/app/actividades');
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40`}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Editar Actividad</h1>
          <button onClick={() => router.back()} className="p-2 hover:bg-white/50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className={`${currentTheme.bgCard} rounded-3xl p-6 border border-white/40 space-y-6`}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duración
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.minutes}
                  onChange={(e) => setFormData({...formData, minutes: parseInt(e.target.value)})}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="min">min</option>
                  <option value="hs">hs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Save size={20} />
            Guardar cambios
          </button>
        </div>
      </div>
    </main>
  );
}
