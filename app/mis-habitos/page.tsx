'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { getCustomHabits, deleteCustomHabit } from '../lib/store';
import { getStreakDisplay } from '../lib/streakLogic';
import {
  Activity, Pencil, Trash2, Check, X, BarChart3, Flame,
  Filter, Search
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import HabitCheckbox from '../components/HabitCheckbox';

export default function MisHabitosPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<any>(null);

  useEffect(() => {
    const loadedHabits = getCustomHabits();
    setHabits(loadedHabits);
  }, []);

  const categories = Array.from(new Set(habits.map(h => h.category)));
  const filteredHabits = habits.filter(h => {
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (filter === 'active') return true; // TODO: lógica de activos
    if (filter === 'completed') return false; // TODO: lógica completados
    return true;
  });

  const handleDelete = (id: string) => {
    deleteCustomHabit(id);
    setHabits(habits.filter(h => h.id !== id));
    setHabitToDelete(null);
  };

  const handleBulkDelete = () => {
    selectedHabits.forEach(id => deleteCustomHabit(id));
    setHabits(habits.filter(h => !selectedHabits.includes(h.id)));
    setSelectedHabits([]);
    setIsSelectionMode(false);
  };

  const toggleSelection = (id: string) => {
    setSelectedHabits(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40 p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2 transition-colors"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Mis Hábitos 📊
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {filteredHabits.length} hábitos {filter !== 'all' ? `(${filter})` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {isSelectionMode ? (
              <>
                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedHabits([]);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedHabits.length === 0}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Eliminar ({selectedHabits.length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Seleccionar
                </button>
                <button
                  onClick={() => router.push('/biblioteca')}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                >
                  + Nuevo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-white shadow-md text-slate-900'
                    : 'bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Completados'}
              </button>
            ))}
          </div>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Habits List */}
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🌱</p>
            <p className="text-slate-600 mb-4">
              {habits.length === 0 ? 'Aún no tenés hábitos' : 'No hay hábitos en esta categoría'}
            </p>
            {habits.length === 0 && (
              <button
                onClick={() => router.push('/biblioteca')}
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
              >
                Explorar biblioteca
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit, i) => {
              const streak = getStreakDisplay(habit.id);
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 ${currentTheme.bgCard} rounded-2xl shadow-sm flex items-center gap-4 transition-all border ${currentTheme.border} ${
                    isSelectionMode ? `hover:${currentTheme.bgHover}` : ''
                  } ${selectedHabits.includes(habit.id) ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  {/* Checkbox en modo selección */}
                  {isSelectionMode && (
                    <button
                      onClick={() => toggleSelection(habit.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedHabits.includes(habit.id)
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedHabits.includes(habit.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </button>
                  )}

                  {/* Habit checkbox */}
                  {!isSelectionMode && (
                    <HabitCheckbox
                      habitId={habit.id}
                      habitName={habit.name}
                      onComplete={() => setHabits([...habits])}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: (habit.color || '#3b82f6') + '20' }}
                  >
                    <Activity size={24} style={{ color: habit.color || '#3b82f6' }} />
                  </div>

                  {/* Info */}
                  <button
                    onClick={() => !isSelectionMode && router.push(`/habito/${habit.id}`)}
                    className="flex-1 text-left"
                  >
                    <h3 className={`font-semibold ${currentTheme.text}`}>{habit.name}</h3>
                    <div className="flex items-center gap-3 text-sm mt-1">
                      <span className={currentTheme.textSecondary}>
                        {habit.minutes} min · {habit.frequency === 'daily' ? 'Diario' : 'Personalizado'}
                      </span>
                      {streak.current > 0 && (
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                          <Flame size={14} />
                          {streak.current}
                        </span>
                      )}
                    </div>
                    {habit.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {habit.category}
                      </span>
                    )}
                  </button>

                  {/* Actions */}
                  {!isSelectionMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/editar-habito/${habit.id}`)}
                        className={`w-10 h-10 rounded-full hover:${currentTheme.bgHover} flex items-center justify-center transition-colors`}
                      >
                        <Pencil size={18} className={currentTheme.textSecondary} />
                      </button>
                      <button
                        onClick={() => setHabitToDelete(habit.id)}
                        className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {habitToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setHabitToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-sm w-full"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  ¿Eliminar hábito?
                </h3>
                <p className="text-slate-600 text-center mb-6">
                  Esta acción no se puede deshacer
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHabitToDelete(null)}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(habitToDelete)}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habit Details Modal */}
        <AnimatePresence>
          {selectedHabitDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
              onClick={() => setSelectedHabitDetails(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: (selectedHabitDetails.color || '#3b82f6') + '20' }}
                    >
                      <Activity size={32} style={{ color: selectedHabitDetails.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedHabitDetails.name}
                      </h2>
                      {selectedHabitDetails.category && (
                        <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                          {selectedHabitDetails.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHabitDetails(null)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-600 mt-1">Racha actual</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-600 mt-1">Mejor racha</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900">0%</p>
                    <p className="text-xs text-slate-600 mt-1">Completado</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Objetivo</span>
                    <span className="font-medium">
                      {selectedHabitDetails.minutes} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Frecuencia</span>
                    <span className="font-medium">
                      {selectedHabitDetails.frequency === 'daily' ? 'Diario' : 'Personalizado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Inicio</span>
                    <span className="font-medium">
                      {new Date(selectedHabitDetails.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedHabitDetails(null);
                      router.push(`/editar-habito/${selectedHabitDetails.id}`);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHabitDetails(null);
                      setHabitToDelete(selectedHabitDetails.id);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
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
