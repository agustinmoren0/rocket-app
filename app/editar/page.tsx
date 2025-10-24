// app/editar/page.tsx - Editar o borrar actividad
'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadData, saveData } from '../lib/store';

function EditarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date');
  const indexParam = searchParams.get('index');

  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date || indexParam === null) {
      router.push('/');
      return;
    }

    const data = loadData();
    const activityIndex = parseInt(indexParam);
    const activity = data.currentWeek.activities[activityIndex];

    if (activity && activity.date === date) {
      setMinutes(activity.minutes.toString());
      setNote(activity.note);
      setLoading(false);
    } else {
      router.push('/');
    }
  }, [date, indexParam, router]);

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const mins = parseInt(minutes);
    if (isNaN(mins) || mins <= 0 || !note.trim()) {
      alert('Por favor, completá todos los campos correctamente');
      return;
    }

    const data = loadData();
    const activityIndex = parseInt(indexParam!);

    // Actualizar actividad
    const oldMinutes = data.currentWeek.activities[activityIndex].minutes;
    data.currentWeek.activities[activityIndex] = {
      date: date!,
      minutes: mins,
      note: note.trim()
    };

    // Ajustar total de minutos
    data.currentWeek.totalMinutes = data.currentWeek.totalMinutes - oldMinutes + mins;

    saveData(data);
    window.location.href = '/';
  }

  function handleDelete() {
    if (!confirm('¿Estás seguro de borrar esta actividad?')) return;

    const data = loadData();
    const activityIndex = parseInt(indexParam!);
    const deletedActivity = data.currentWeek.activities[activityIndex];

    // Quitar minutos del total
    data.currentWeek.totalMinutes -= deletedActivity.minutes;

    // Eliminar actividad
    data.currentWeek.activities.splice(activityIndex, 1);

    // Si era el último del día, marcar día como inactivo
    const activitiesOnDate = data.currentWeek.activities.filter(a => a.date === date);
    if (activitiesOnDate.length === 0) {
      const weekStart = new Date(data.currentWeek.startDate);
      const activityDate = new Date(date!);
      const dayIndex = Math.floor((activityDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        data.currentWeek.activeDays[dayIndex] = false;
      }
    }

    saveData(data);
    window.location.href = '/';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <header className="mb-8 animate-fadeIn">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-slate-50"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Editar actividad
        </h1>
        <p className="text-slate-600">
          Modificá o eliminá tu registro.
        </p>
      </header>

      <form onSubmit={handleUpdate} className="space-y-6 animate-slideUp">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Minutos dedicados
          </label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>

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

        <div className="space-y-3">
          <button
            type="submit"
            className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700"
          >
            Guardar cambios
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full h-14 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100"
          >
            Eliminar actividad
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full h-14 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}

export default function EditarPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </main>
    }>
      <EditarContent />
    </Suspense>
  );
}
