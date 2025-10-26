'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../hooks/useTheme';
import { saveCustomHabit } from '../lib/store';
import habitsData from '../../data/habits.json';

interface Habit {
  id: string;
  name: string;
  description: string;
  suggestedMinutes: number;
  suggestedFrequency: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  habits: Habit[];
}

export default function BibliotecaPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(habitsData.categories[0].id);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    minutes: number;
    frequency: 'daily' | 'weekly' | '3x-week' | 'flexible';
    days?: number[];
    targetValue: number;
    targetUnit: 'min' | 'hs';
    targetPeriod: string;
    reminderTime?: string;
  }>({
    name: '',
    minutes: 0,
    frequency: 'daily',
    days: [],
    targetValue: 20,
    targetUnit: 'min',
    targetPeriod: 'por día',
    reminderTime: undefined
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDaysSelector, setShowDaysSelector] = useState(false);

  const categories = habitsData.categories as Category[];
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const habits = currentCategory?.habits || [];

  const handleSelectHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setFormData({
      name: habit.name,
      minutes: habit.suggestedMinutes,
      frequency: (habit.suggestedFrequency as 'daily' | 'weekly' | '3x-week' | 'flexible') || 'daily',
      days: [],
      targetValue: 20,
      targetUnit: 'min',
      targetPeriod: 'por día',
      reminderTime: undefined
    });
    setShowModal(true);
  };

  const handleSaveHabit = () => {
    if (!selectedHabit) return;

    const habitData = {
      name: formData.name || selectedHabit.name,
      description: selectedHabit.description,
      minutes: formData.targetUnit === 'hs' ? formData.targetValue * 60 : formData.targetValue,
      frequency: formData.frequency,
      category: currentCategory?.id || 'general',
      days: formData.days,
      targetValue: formData.targetValue,
      targetUnit: formData.targetUnit,
      targetPeriod: formData.targetPeriod
    };

    console.log('Hábito guardado:', habitData);

    setShowToast(true);
    setToastMessage('¡Hábito agregado! 🌱');

    setTimeout(() => {
      setShowToast(false);
      setSelectedHabit(null);
      setShowModal(false);
    }, 1500);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center mb-6`}
            >
              ←
            </motion.button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            🌱 Biblioteca de Hábitos
          </h1>
          <p className="text-slate-600 mt-2">
            Elige hábitos inspiradores o crea los tuyos propios
          </p>
        </motion.div>

        {/* Tabs de categorías */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 overflow-x-auto pb-2"
        >
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-2xl font-medium transition-all text-sm whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `${currentTheme.button} text-white shadow-md`
                    : `${currentTheme.bgCard} text-slate-900 hover:${currentTheme.bgHover}`
                }`}
              >
                {cat.emoji} {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Descripción de categoría */}
        {currentCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`${currentTheme.bgCard} rounded-2xl p-4 mb-6 border border-slate-200`}
          >
            <p className="text-slate-700">{currentCategory.description}</p>
          </motion.div>
        )}

        {/* Grid de hábitos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {habits.map((habit, i) => (
            <motion.button
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.03 }}
              onClick={() => handleSelectHabit(habit)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`${currentTheme.bgCard} rounded-2xl p-4 border border-slate-200 text-left transition-all hover:shadow-md`}
            >
              <h3 className="font-semibold text-slate-900 mb-1">{habit.name}</h3>
              <p className="text-sm text-slate-600">{habit.description}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {habit.suggestedMinutes > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}>
                    {habit.suggestedMinutes} min
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                  {habit.suggestedFrequency}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Modal mejorado */}
      <AnimatePresence>
        {selectedHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setSelectedHabit(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md md:w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setSelectedHabit(null)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-lg font-semibold text-slate-900">Nuevo hábito</h2>
                <button
                  onClick={handleSaveHabit}
                  className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-xl">✓</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Nombre del hábito */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                    🧘
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full text-lg font-semibold text-slate-900 border-0 outline-none p-0"
                      placeholder="Nombre del hábito"
                    />
                  </div>
                </div>

                {/* Repetir */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      🔄
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">REPETIR</p>
                      <p className="text-base font-medium text-slate-900">{
                        formData.frequency === 'daily' ? 'Todos los días' :
                        formData.frequency === 'weekly' ? 'Semanal' :
                        formData.frequency === '3x-week' ? '3x por semana' : 'Flexible'
                      }</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({...formData, frequency: 'daily'})}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.frequency === 'daily'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Diario
                    </button>
                    <button
                      onClick={() => setFormData({...formData, frequency: 'weekly'})}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.frequency === 'weekly'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      onClick={() => setShowDaysSelector(!showDaysSelector)}
                      className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      →
                    </button>
                  </div>

                  {/* Selector de días */}
                  {showDaysSelector && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-600 mb-3">¿En qué días?</p>
                      <div className="grid grid-cols-7 gap-2">
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const newDays = [...(formData.days || [])];
                              if (newDays.includes(i)) {
                                newDays.splice(newDays.indexOf(i), 1);
                              } else {
                                newDays.push(i);
                              }
                              setFormData({...formData, days: newDays});
                            }}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                              formData.days?.includes(i)
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tiempo objetivo - Picker estilo iOS */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      🎯
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">OBJETIVO</p>
                      <p className="text-base font-medium text-slate-900">
                        {formData.targetValue} {formData.targetUnit} {formData.targetPeriod}
                      </p>
                    </div>
                  </div>

                  {/* Picker wheels iOS style */}
                  <div className="flex gap-2 p-4 bg-slate-50 rounded-xl">
                    {/* Value picker */}
                    <select
                      value={formData.targetValue}
                      onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
                      className="flex-1 text-center text-lg font-medium bg-transparent border-0 outline-none"
                    >
                      {[...Array(100)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>

                    {/* Unit picker */}
                    <select
                      value={formData.targetUnit}
                      onChange={(e) => setFormData({...formData, targetUnit: e.target.value as any})}
                      className="flex-1 text-center text-lg font-medium bg-transparent border-0 outline-none"
                    >
                      <option value="min">min</option>
                      <option value="hs">hs</option>
                    </select>

                    {/* Period picker */}
                    <select
                      value={formData.targetPeriod}
                      onChange={(e) => setFormData({...formData, targetPeriod: e.target.value})}
                      className="flex-1 text-center text-lg font-medium bg-transparent border-0 outline-none"
                    >
                      <option value="por día">por día</option>
                      <option value="por semana">por semana</option>
                      <option value="por mes">por mes</option>
                      <option value="por año">por año</option>
                    </select>
                  </div>
                </div>

                {/* Recordatorio */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      🔔
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">RECORDATORIO</p>
                      <p className="text-base font-medium text-slate-900">
                        {formData.reminderTime || 'En cualquier momento'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fecha inicio */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      📅
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">FECHA DE INICIO</p>
                      <p className="text-base font-medium text-slate-900">Hoy</p>
                    </div>
                  </div>
                </div>

                {/* Fecha fin */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      📅
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">FIN</p>
                      <p className="text-base font-medium text-slate-900">Nunca</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
