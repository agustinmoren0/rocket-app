'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { getCustomHabits, deleteCustomHabit } from '../../lib/store';
import {
  Activity, X, Pencil, Trash2, Save
} from 'lucide-react';

export default function EditarHabitoPage() {
  const router = useRouter();
  const params = useParams();
  const { currentTheme } = useTheme();
  const [habit, setHabit] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetValue: 20,
    targetUnit: 'min' as 'min' | 'hs',
    targetPeriod: 'por día',
    frequency: 'daily' as 'daily' | 'weekly' | '3x-week' | 'flexible',
  });

  useEffect(() => {
    const habits = getCustomHabits();
    const found = habits.find(h => h.id === params.id);
    if (found) {
      setHabit(found);
      setFormData({
        name: found.name,
        targetValue: found.minutes,
        targetUnit: 'min',
        targetPeriod: 'por día',
        frequency: found.frequency || 'daily',
      });
    }
  }, [params.id]);

  const handleSave = () => {
    // Actualizar hábito en localStorage
    const habits = getCustomHabits();
    const updatedHabits = habits.map(h =>
      h.id === params.id
        ? {
            ...h,
            name: formData.name,
            minutes: formData.targetUnit === 'hs' ? formData.targetValue * 60 : formData.targetValue,
            frequency: formData.frequency
          }
        : h
    );
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
    router.push('/habitos');
  };

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen ${currentTheme.bg} p-6`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Editar hábito
          </h1>
          <div className="w-20" />
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
          {/* Icon + Name */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: (habit.color || '#3b82f6') + '20' }}
            >
              <Activity size={32} style={{ color: habit.color || '#3b82f6' }} />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="flex-1 text-xl font-semibold border-0 border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-2"
              placeholder="Nombre del hábito"
            />
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Objetivo
            </label>
            <div className="flex gap-2">
              <select
                value={formData.targetValue}
                onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              >
                {[...Array(100)].map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select
                value={formData.targetUnit}
                onChange={(e) => setFormData({...formData, targetUnit: e.target.value as 'min' | 'hs'})}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="min">minutos</option>
                <option value="hs">horas</option>
              </select>
              <select
                value={formData.targetPeriod}
                onChange={(e) => setFormData({...formData, targetPeriod: e.target.value})}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="por día">por día</option>
                <option value="por semana">por semana</option>
                <option value="por mes">por mes</option>
              </select>
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Frecuencia
            </label>
            <div className="flex gap-2">
              {[
                { value: 'daily', label: 'Diario' },
                { value: 'weekly', label: 'Semanal' },
                { value: '3x-week', label: '3x semana' },
                { value: 'flexible', label: 'Flexible' },
              ].map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setFormData({...formData, frequency: freq.value as any})}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.frequency === freq.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
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
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
