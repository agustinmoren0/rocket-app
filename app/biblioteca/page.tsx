'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { saveCustomHabit } from '../lib/store';
import habitsData from '../../data/habits.json';

// Iconos disponibles (usar emoji o librería de iconos después)
const HABIT_ICONS = [
  '🏃', '🚴', '🧘', '💪', '🏋️', '⚽', '🏀', '🎾', '🏊', '🧗',
  '📚', '✍️', '🎨', '🎵', '🎮', '📖', '🧠', '💡', '🔬', '🎓',
  '💼', '💻', '📱', '🖥️', '⌨️', '🖱️', '📊', '📈', '📉', '🗂️',
  '🍎', '🥗', '🥑', '🍊', '🥕', '🥦', '🍇', '🥤', '☕', '🍵',
  '😴', '🛌', '⏰', '🌙', '☀️', '🌅', '🌄', '🌃', '🌆', '🌇',
  '🧹', '🧽', '🧺', '🧼', '🪥', '🚿', '🛁', '🧴', '💊', '🏥',
  '💰', '💵', '💳', '🏦', '📱', '🎯', '🎪', '🎭', '🎬', '📷',
];

const HABIT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#6366f1', '#a855f7', '#d946ef',
];

export default function BibliotecaPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('energia-fisica');
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    icon: '🧘',
    color: '#3b82f6',
    targetValue: 20,
    targetUnit: 'min' as 'min' | 'hs',
    targetPeriod: 'por día',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'interval',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    reminderTime: '6:30',
    startDate: new Date().toISOString().split('T')[0],
    endType: 'never' as 'never' | 'date' | 'streak' | 'times' | 'total',
    endValue: null as string | number | null,
  });

  const categories = habitsData.categories;
  const currentCategory = categories.find(c => c.id === selectedCategory);

  const handleSelectHabit = (habit: any) => {
    setSelectedHabit(habit);
    setFormData({
      ...formData,
      name: habit.name,
      targetValue: habit.suggestedMinutes || 20,
    });
  };

  const handleSaveHabit = () => {
    // Convertir horas a minutos si es necesario
    const minutes = formData.targetUnit === 'hs'
      ? formData.targetValue * 60
      : formData.targetValue;

    // Guardar el hábito personalizado
    saveCustomHabit({
      name: formData.name,
      description: selectedHabit?.description || '',
      minutes,
      frequency: formData.frequency,
      category: selectedCategory
    });

    setSelectedHabit(null);
    router.push('/mis-habitos');
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Biblioteca de Hábitos 🌱
            </h1>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-white shadow-md text-slate-900'
                    : 'bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name.replace(/^.+ /, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCategory?.habits.map((habit: any) => (
            <button
              key={habit.id}
              onClick={() => handleSelectHabit(habit)}
              className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            >
              <h3 className="font-semibold text-slate-900 mb-2">{habit.name}</h3>
              <p className="text-sm text-slate-600">{habit.description}</p>
            </button>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedHabit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center"
              onClick={() => setSelectedHabit(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                  <button onClick={() => setSelectedHabit(null)} className="text-2xl">✕</button>
                  <h2 className="text-lg font-semibold">Nuevo hábito</h2>
                  <button onClick={handleSaveHabit} className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">✓</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Icono y nombre */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: formData.color + '20' }}
                    >
                      {formData.icon}
                    </button>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="flex-1 text-xl font-semibold border-0 outline-none"
                      placeholder="Nombre del hábito"
                    />
                  </div>

                  {/* Icon Picker */}
                  {showIconPicker && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="grid grid-cols-8 gap-2 mb-4">
                        {HABIT_ICONS.map((icon, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setFormData({...formData, icon});
                              setShowIconPicker(false);
                            }}
                            className="w-10 h-10 text-2xl hover:bg-white rounded-lg"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {HABIT_COLORS.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => setFormData({...formData, color})}
                            className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Repetir */}
                  <button
                    onClick={() => setShowRepeatPicker(!showRepeatPicker)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">🔄</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">REPETIR</p>
                      <p className="font-medium">{formData.frequency === 'daily' ? 'Todos los días' : 'Personalizado'}</p>
                    </div>
                    <span>→</span>
                  </button>

                  {/* Objetivo */}
                  <button
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">🎯</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">OBJETIVO</p>
                      <p className="font-medium">{formData.targetValue} {formData.targetUnit} {formData.targetPeriod}</p>
                    </div>
                    <span>→</span>
                  </button>

                  {/* Time Picker */}
                  {showTimePicker && (
                    <div className="flex gap-2 p-4 bg-slate-50 rounded-xl">
                      <select value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})} className="flex-1 text-center text-lg bg-transparent">
                        {[...Array(100)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
                      </select>
                      <select value={formData.targetUnit} onChange={(e) => setFormData({...formData, targetUnit: e.target.value as 'min' | 'hs'})} className="flex-1 text-center text-lg bg-transparent">
                        <option value="min">min</option>
                        <option value="hs">hs</option>
                      </select>
                      <select value={formData.targetPeriod} onChange={(e) => setFormData({...formData, targetPeriod: e.target.value})} className="flex-1 text-center text-lg bg-transparent">
                        <option value="por día">por día</option>
                        <option value="por semana">por semana</option>
                        <option value="por mes">por mes</option>
                      </select>
                    </div>
                  )}

                  {/* Recordatorio */}
                  <button
                    onClick={() => setShowReminderPicker(!showReminderPicker)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">🔔</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">RECORDATORIO</p>
                      <p className="font-medium">{formData.reminderEnabled ? formData.reminderTime : 'En cualquier momento'}</p>
                    </div>
                    <span>→</span>
                  </button>

                  {/* Fecha inicio */}
                  <button className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">📅</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">FECHA DE INICIO</p>
                      <p className="font-medium">Hoy</p>
                    </div>
                  </button>

                  {/* Fecha fin */}
                  <button
                    onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">📅</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">FIN</p>
                      <p className="font-medium">{formData.endType === 'never' ? 'Nunca' : 'Personalizado'}</p>
                    </div>
                    <span>→</span>
                  </button>

                  {/* End Date Picker */}
                  {showEndDatePicker && (
                    <div className="space-y-2">
                      {['never', 'date', 'streak', 'times', 'total'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({...formData, endType: type as any})}
                          className={`w-full p-3 rounded-lg text-left ${formData.endType === type ? 'bg-indigo-50 text-indigo-600 font-medium' : 'bg-white'}`}
                        >
                          {type === 'never' ? 'Nunca' :
                           type === 'date' ? 'En una fecha' :
                           type === 'streak' ? 'Por rachas consecutivas' :
                           type === 'times' ? 'Por número de veces' :
                           'Por cantidad total'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
