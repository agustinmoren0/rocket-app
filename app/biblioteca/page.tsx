'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { saveCustomHabit } from '../lib/store';
import habitsData from '../../data/habits.json';
import {
  // Ejercicio & Fitness
  Activity, Dumbbell, Bike, Heart, HeartPulse, Footprints,
  // Comida & Nutrición
  Apple, Coffee, UtensilsCrossed, Wine, CupSoda,
  // Aprendizaje & Trabajo
  Book, BookOpen, GraduationCap, Brain, Lightbulb, Laptop, Briefcase, Target,
  // Creatividad & Arte
  Paintbrush, Music, Camera, Pen, Palette, Mic, Film, Image,
  // Naturaleza & Bienestar
  Sun, Moon, Cloud, Flower2, Leaf, TreePine, Mountain, Waves,
  // Casa & Rutina
  Home, BedDouble, Clock, AlarmClock, Trash2,
  // Social & Comunicación
  Users, MessageCircle, Phone, Mail, ThumbsUp, Smile, PartyPopper,
  // Salud & Medicina
  Pill, Stethoscope, HeartHandshake,
  // Dinero & Finanzas
  DollarSign, PiggyBank, TrendingUp, Wallet, CreditCard,
  // Hobbies & Entretenimiento
  Gamepad2, Trophy, Medal, Award,
  // Símbolos & Marcas
  Star, Flame, Sparkles, Gem, CheckCircle, XCircle, Zap,
  // Tiempo & Calendario
  Calendar, CalendarDays, Timer, Hourglass, Watch, Sunrise, Sunset,
  // Varios
  Droplet, Wind, Umbrella, Glasses, Circle
} from 'lucide-react';

const HABIT_ICONS = [
  // Ejercicio & Fitness
  { icon: Activity, name: 'Activity', category: 'Ejercicio' },
  { icon: Dumbbell, name: 'Dumbbell', category: 'Ejercicio' },
  { icon: Bike, name: 'Bike', category: 'Ejercicio' },
  { icon: Footprints, name: 'Footprints', category: 'Ejercicio' },
  { icon: Heart, name: 'Heart', category: 'Ejercicio' },
  { icon: HeartPulse, name: 'HeartPulse', category: 'Ejercicio' },

  // Comida & Nutrición
  { icon: Apple, name: 'Apple', category: 'Nutrición' },
  { icon: Coffee, name: 'Coffee', category: 'Nutrición' },
  { icon: UtensilsCrossed, name: 'UtensilsCrossed', category: 'Nutrición' },
  { icon: Wine, name: 'Wine', category: 'Nutrición' },
  { icon: CupSoda, name: 'CupSoda', category: 'Nutrición' },

  // Aprendizaje
  { icon: Book, name: 'Book', category: 'Aprendizaje' },
  { icon: BookOpen, name: 'BookOpen', category: 'Aprendizaje' },
  { icon: GraduationCap, name: 'GraduationCap', category: 'Aprendizaje' },
  { icon: Brain, name: 'Brain', category: 'Aprendizaje' },
  { icon: Lightbulb, name: 'Lightbulb', category: 'Aprendizaje' },
  { icon: Laptop, name: 'Laptop', category: 'Aprendizaje' },
  { icon: Target, name: 'Target', category: 'Aprendizaje' },

  // Creatividad
  { icon: Paintbrush, name: 'Paintbrush', category: 'Creatividad' },
  { icon: Music, name: 'Music', category: 'Creatividad' },
  { icon: Camera, name: 'Camera', category: 'Creatividad' },
  { icon: Pen, name: 'Pen', category: 'Creatividad' },
  { icon: Palette, name: 'Palette', category: 'Creatividad' },
  { icon: Mic, name: 'Mic', category: 'Creatividad' },
  { icon: Film, name: 'Film', category: 'Creatividad' },
  { icon: Image, name: 'Image', category: 'Creatividad' },

  // Naturaleza
  { icon: Sun, name: 'Sun', category: 'Naturaleza' },
  { icon: Moon, name: 'Moon', category: 'Naturaleza' },
  { icon: Cloud, name: 'Cloud', category: 'Naturaleza' },
  { icon: Flower2, name: 'Flower2', category: 'Naturaleza' },
  { icon: Leaf, name: 'Leaf', category: 'Naturaleza' },
  { icon: TreePine, name: 'TreePine', category: 'Naturaleza' },
  { icon: Mountain, name: 'Mountain', category: 'Naturaleza' },
  { icon: Waves, name: 'Waves', category: 'Naturaleza' },

  // Rutina
  { icon: Home, name: 'Home', category: 'Rutina' },
  { icon: BedDouble, name: 'BedDouble', category: 'Rutina' },
  { icon: Clock, name: 'Clock', category: 'Rutina' },
  { icon: AlarmClock, name: 'AlarmClock', category: 'Rutina' },

  // Social
  { icon: Users, name: 'Users', category: 'Social' },
  { icon: MessageCircle, name: 'MessageCircle', category: 'Social' },
  { icon: Phone, name: 'Phone', category: 'Social' },
  { icon: ThumbsUp, name: 'ThumbsUp', category: 'Social' },
  { icon: Smile, name: 'Smile', category: 'Social' },
  { icon: PartyPopper, name: 'PartyPopper', category: 'Social' },

  // Salud
  { icon: Pill, name: 'Pill', category: 'Salud' },
  { icon: Stethoscope, name: 'Stethoscope', category: 'Salud' },
  { icon: HeartHandshake, name: 'HeartHandshake', category: 'Salud' },

  // Hobbies
  { icon: Gamepad2, name: 'Gamepad2', category: 'Hobbies' },
  { icon: Trophy, name: 'Trophy', category: 'Hobbies' },
  { icon: Medal, name: 'Medal', category: 'Hobbies' },
  { icon: Award, name: 'Award', category: 'Hobbies' },

  // Finanzas
  { icon: DollarSign, name: 'DollarSign', category: 'Finanzas' },
  { icon: PiggyBank, name: 'PiggyBank', category: 'Finanzas' },
  { icon: TrendingUp, name: 'TrendingUp', category: 'Finanzas' },
  { icon: Wallet, name: 'Wallet', category: 'Finanzas' },

  // Símbolos
  { icon: Star, name: 'Star', category: 'General' },
  { icon: Flame, name: 'Flame', category: 'General' },
  { icon: Sparkles, name: 'Sparkles', category: 'General' },
  { icon: Gem, name: 'Gem', category: 'General' },
  { icon: CheckCircle, name: 'CheckCircle', category: 'General' },
  { icon: Zap, name: 'Zap', category: 'General' },
  { icon: Droplet, name: 'Droplet', category: 'General' },
  { icon: Wind, name: 'Wind', category: 'General' },
  { icon: Circle, name: 'Circle', category: 'General' },
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
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [iconCategory, setIconCategory] = useState('Todos');

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Activity',
    color: '#3b82f6',
    targetValue: 20,
    targetUnit: 'min' as 'min' | 'hs',
    targetPeriod: 'por día',
    frequency: 'daily' as 'daily' | 'weekly' | '3x-week' | 'flexible',
    days: [0, 1, 2, 3, 4, 5, 6],
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
    const minutes = formData.targetUnit === 'hs'
      ? formData.targetValue * 60
      : formData.targetValue;

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

  const SelectedIcon = HABIT_ICONS.find(i => i.name === formData.icon)?.icon || Activity;

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
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: formData.color + '20' }}
                    >
                      <SelectedIcon size={32} style={{ color: formData.color }} />
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
                    <div className="p-4 bg-slate-50 rounded-xl max-h-80 overflow-y-auto">
                      {/* Category tabs */}
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {['Todos', 'Ejercicio', 'Nutrición', 'Aprendizaje', 'Creatividad', 'Naturaleza', 'Rutina', 'Social', 'Salud', 'Hobbies', 'Finanzas', 'General'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setIconCategory(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                              iconCategory === cat ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Icons grid */}
                      <div className="grid grid-cols-8 gap-2 mb-4">
                        {HABIT_ICONS
                          .filter(item => iconCategory === 'Todos' || item.category === iconCategory)
                          .map((item, i) => {
                            const IconComponent = item.icon;
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setFormData({...formData, icon: item.name});
                                  setShowIconPicker(false);
                                }}
                                className="w-10 h-10 hover:bg-white rounded-lg flex items-center justify-center transition-colors"
                              >
                                <IconComponent size={20} className="text-slate-700" />
                              </button>
                            );
                          })}
                      </div>

                      {/* Color picker */}
                      <div className="flex gap-2 flex-wrap">
                        {HABIT_COLORS.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => setFormData({...formData, color})}
                            className={`w-8 h-8 rounded-full transition-all ${
                              formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                            }`}
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

                  {showRepeatPicker && (
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormData({...formData, frequency: 'daily', days: [0,1,2,3,4,5,6]})}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.frequency === 'daily' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                        >
                          Diario
                        </button>
                        <button
                          onClick={() => setFormData({...formData, frequency: 'weekly'})}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.frequency === 'weekly' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                        >
                          Semanal
                        </button>
                      </div>

                      {formData.frequency !== 'daily' && (
                        <>
                          <p className="text-xs text-slate-600">¿En qué días?</p>
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
                                className={`w-10 h-10 rounded-full text-sm font-medium ${
                                  formData.days?.includes(i) ? 'bg-indigo-500 text-white' : 'bg-white'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

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
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-center gap-2">
                        {/* Value wheel */}
                        <div className="relative h-32 w-20 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-10 w-full bg-indigo-50 rounded-lg border-2 border-indigo-200" />
                          </div>
                          <select
                            value={formData.targetValue}
                            onChange={(e) => setFormData({...formData, targetValue: parseInt(e.target.value)})}
                            className="absolute inset-0 opacity-100 text-center text-xl font-medium bg-transparent border-0 appearance-none cursor-pointer"
                            style={{
                              WebkitAppearance: 'none',
                              height: '128px',
                              padding: '40px 0'
                            }}
                          >
                            {[...Array(100)].map((_, i) => (
                              <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>

                        {/* Unit wheel */}
                        <div className="relative h-32 w-20 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-10 w-full bg-indigo-50 rounded-lg border-2 border-indigo-200" />
                          </div>
                          <select
                            value={formData.targetUnit}
                            onChange={(e) => setFormData({...formData, targetUnit: e.target.value as 'min' | 'hs'})}
                            className="absolute inset-0 opacity-100 text-center text-xl font-medium bg-transparent border-0 appearance-none cursor-pointer"
                            style={{
                              WebkitAppearance: 'none',
                              height: '128px',
                              padding: '40px 0'
                            }}
                          >
                            <option value="min">min</option>
                            <option value="hs">hs</option>
                          </select>
                        </div>

                        {/* Period wheel */}
                        <div className="relative h-32 w-28 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-10 w-full bg-indigo-50 rounded-lg border-2 border-indigo-200" />
                          </div>
                          <select
                            value={formData.targetPeriod}
                            onChange={(e) => setFormData({...formData, targetPeriod: e.target.value})}
                            className="absolute inset-0 opacity-100 text-center text-lg font-medium bg-transparent border-0 appearance-none cursor-pointer"
                            style={{
                              WebkitAppearance: 'none',
                              height: '128px',
                              padding: '40px 0'
                            }}
                          >
                            <option value="por día">por día</option>
                            <option value="por semana">por semana</option>
                            <option value="por mes">por mes</option>
                            <option value="por año">por año</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recordatorio */}
                  <button className="w-full flex items-center gap-3 p-4 bg-slate-100 rounded-xl opacity-50 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">🔔</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">RECORDATORIO</p>
                      <p className="font-medium text-slate-400">Próximamente</p>
                    </div>
                  </button>

                  {/* Fecha inicio */}
                  <button
                    onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                    className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">📅</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-slate-500 uppercase">FECHA DE INICIO</p>
                      <p className="font-medium">{new Date(formData.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span>→</span>
                  </button>

                  {showStartDatePicker && (
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-3 bg-white rounded-lg border border-slate-200"
                    />
                  )}

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
                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                      <button
                        onClick={() => setFormData({...formData, endType: 'never', endValue: null})}
                        className={`w-full p-3 rounded-lg text-left ${formData.endType === 'never' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                      >
                        Nunca
                      </button>

                      <button
                        onClick={() => setFormData({...formData, endType: 'date'})}
                        className={`w-full p-3 rounded-lg text-left ${formData.endType === 'date' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                      >
                        En una fecha
                      </button>
                      {formData.endType === 'date' && (
                        <input
                          type="date"
                          value={formData.endValue as string || ''}
                          onChange={(e) => setFormData({...formData, endValue: e.target.value})}
                          className="w-full p-3 rounded-lg border"
                        />
                      )}

                      <button
                        onClick={() => setFormData({...formData, endType: 'streak'})}
                        className={`w-full p-3 rounded-lg text-left ${formData.endType === 'streak' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                      >
                        Por rachas consecutivas
                      </button>
                      {formData.endType === 'streak' && (
                        <input
                          type="number"
                          value={formData.endValue as number || ''}
                          onChange={(e) => setFormData({...formData, endValue: parseInt(e.target.value)})}
                          placeholder="Ej: 30 días"
                          className="w-full p-3 rounded-lg border"
                        />
                      )}

                      <button
                        onClick={() => setFormData({...formData, endType: 'times'})}
                        className={`w-full p-3 rounded-lg text-left ${formData.endType === 'times' ? 'bg-indigo-500 text-white' : 'bg-white'}`}
                      >
                        Por número de veces
                      </button>
                      {formData.endType === 'times' && (
                        <input
                          type="number"
                          value={formData.endValue as number || ''}
                          onChange={(e) => setFormData({...formData, endValue: parseInt(e.target.value)})}
                          placeholder="Ej: 100 veces"
                          className="w-full p-3 rounded-lg border"
                        />
                      )}
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
