'use client'

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { loadData, saveData, CATEGORIES, type Category } from '../lib/store';
import { showToast } from '../components/Toast';

function EditarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const date = searchParams.get('date');
  const index = searchParams.get('index');

  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date || !index) {
      router.push('/');
      return;
    }

    const data = loadData();
    const actIndex = parseInt(index);
    const activity = data.currentWeek.activities[actIndex];

    if (!activity || activity.date !== date) {
      showToast('Actividad no encontrada', 'error');
      router.push('/');
      return;
    }

    setMinutes(activity.minutes.toString());
    setNote(activity.note);
    setCategory(activity.category || '');
    setLoading(false);
  }, [date, index, router]);

  function handleSave() {
    const mins = parseInt(minutes);
    if (isNaN(mins) || mins <= 0) {
      showToast('Por favor, ingresá un tiempo válido', 'error');
      return;
    }

    // Categoría es OBLIGATORIA
    if (!category) {
      showToast('Por favor, elegí una categoría', 'error');
      return;
    }

    // Nota es opcional (no validar)

    const data = loadData();
    const actIndex = parseInt(index!);

    const oldMinutes = data.currentWeek.activities[actIndex].minutes;
    data.currentWeek.totalMinutes = data.currentWeek.totalMinutes - oldMinutes + mins;

    data.currentWeek.activities[actIndex] = {
      ...data.currentWeek.activities[actIndex],
      minutes: mins,
      note: note.trim(),
      category: category || undefined,
    };

    saveData(data);
    showToast('Actividad actualizada', 'success');

    setTimeout(() => {
      router.push('/');
    }, 500);
  }

  function handleDelete() {
    if (!confirm('¿Eliminar esta actividad?')) return;

    const data = loadData();
    const actIndex = parseInt(index!);
    const activity = data.currentWeek.activities[actIndex];

    data.currentWeek.totalMinutes -= activity.minutes;
    data.currentWeek.activities.splice(actIndex, 1);

    const weekStart = new Date(data.currentWeek.startDate);
    const activityDate = new Date(date!);
    const dayIndex = Math.floor((activityDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    const hasOtherActivities = data.currentWeek.activities.some(
      a => a.date === date
    );

    if (!hasOtherActivities && dayIndex >= 0 && dayIndex < 7) {
      data.currentWeek.activeDays[dayIndex] = false;
    }

    saveData(data);
    showToast('Actividad eliminada', 'success');

    setTimeout(() => {
      router.push('/');
    }, 500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-slate-50"
        >
          ←
        </motion.button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Editar actividad
        </h1>
        <p className="text-slate-600">
          {new Date(date!).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Minutos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tiempo dedicado (minutos)
          </label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg"
            autoFocus
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ¿Qué hiciste?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Categoría (opcional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`
                  h-16 rounded-2xl flex items-center justify-center text-sm font-medium
                  transition-all
                  ${category === cat
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                  }
                `}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleDelete}
            className="flex-1 h-14 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
          >
            Eliminar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            className="flex-1 h-14 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Guardar cambios
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

export default function EditarPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </main>
    }>
      <EditarContent />
    </Suspense>
  );
}
