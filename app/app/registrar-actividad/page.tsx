'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Activity, Clock, Calendar, Save, X, AlertCircle } from 'lucide-react';
import { useActivity } from '@/app/context/ActivityContext';
import { validateName, validateDuration, validateDateNotFuture, ValidationError } from '@/app/lib/validation';
import { useFocusOnError } from '@/app/lib/useFocusManagement';

export default function RegistrarActividadPage() {
  const router = useRouter();
  const { addActivity } = useActivity();
  const [formData, setFormData] = useState({
    name: '',
    minutes: 20,
    unit: 'min',
    category: 'energia-fisica',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const formRef = useFocusOnError([errors]);

  const categories = [
    { value: 'energia-fisica', label: 'Energía Física', color: 'bg-green-100 text-green-700' },
    { value: 'creatividad', label: 'Creatividad', color: 'bg-purple-100 text-purple-700' },
    { value: 'aprendizaje', label: 'Aprendizaje', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'social', label: 'Social', color: 'bg-pink-100 text-pink-700' },
    { value: 'bienestar', label: 'Bienestar', color: 'bg-blue-100 text-blue-700' },
  ];

  const handleSave = async () => {
    const newErrors: ValidationError[] = [];

    // Validate all fields
    const nameError = validateName(formData.name);
    if (nameError) newErrors.push(nameError);

    const durationError = validateDuration(formData.minutes, 1, 1440);
    if (durationError) newErrors.push(durationError);

    const dateError = validateDateNotFuture(formData.date);
    if (dateError) newErrors.push(dateError);

    setErrors(newErrors);

    if (newErrors.length > 0) {
      return;
    }

    // Use ActivityContext to save with dual-layer persistence
    await addActivity({
      name: formData.name,
      duration: parseInt(formData.minutes.toString()),
      unit: formData.unit as 'min' | 'hs',
      categoria: formData.category,
      color: '#6366f1', // Default indigo color
      date: formData.date,
      notes: formData.notes,
    });

    router.push('/app/actividades');
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

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Por favor corregi los siguientes errores:</h3>
                <ul className="space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700">• {error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div
          ref={formRef}
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
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors(errors.filter(e => e.field !== 'name'));
              }}
              placeholder="Ej: Caminar en el parque"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                errors.some(e => e.field === 'name') ? 'border-red-400 focus:ring-red-100' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock size={16} className="inline mr-2" />
              Duración
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.minutes}
                onChange={(e) => {
                  setFormData({...formData, minutes: parseInt(e.target.value) || 0});
                  setErrors(errors.filter(e => e.field !== 'duration'));
                }}
                min="1"
                max="1440"
                className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                  errors.some(e => e.field === 'duration') ? 'border-red-400 focus:ring-red-100' : 'border-slate-200'
                }`}
              />
              <select
                value={formData.unit || 'min'}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="min">min</option>
                <option value="hs">hs</option>
              </select>
            </div>
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
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setErrors(errors.filter(e => e.field !== 'date'));
              }}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                errors.some(e => e.field === 'date') ? 'border-red-400 focus:ring-red-100' : 'border-slate-200'
              }`}
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
        </div>
      </div>
    </main>
  );
}
