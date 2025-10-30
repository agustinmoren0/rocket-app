'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUCIDE_ICONS } from '../utils/icons';

const HABIT_LIBRARY_FORMAR = {
  fisica: {
    name: 'Física',
    icon: 'Dumbbell',
    habits: [
      { id: 'run', name: 'Correr', icon: 'Activity' },
      { id: 'gym', name: 'Gym', icon: 'Dumbbell' },
      { id: 'yoga', name: 'Yoga', icon: 'Heart' },
      { id: 'swim', name: 'Nadar', icon: 'Droplet' },
      { id: 'walk', name: 'Caminar', icon: 'Footprints' },
    ]
  },
  mental: {
    name: 'Mental',
    icon: 'Brain',
    habits: [
      { id: 'meditate', name: 'Meditación', icon: 'Brain' },
      { id: 'read', name: 'Lectura', icon: 'BookOpen' },
      { id: 'journal', name: 'Journaling', icon: 'Pen' },
      { id: 'learn', name: 'Aprender algo nuevo', icon: 'Lightbulb' },
    ]
  },
  social: {
    name: 'Social',
    icon: 'Users',
    habits: [
      { id: 'call', name: 'Llamar a un amigo', icon: 'Phone' },
      { id: 'family', name: 'Pasar tiempo en familia', icon: 'Heart' },
      { id: 'volunteer', name: 'Hacer voluntariado', icon: 'HandHeart' },
      { id: 'network', name: 'Networking', icon: 'Users' },
    ]
  },
  creatividad: {
    name: 'Creatividad',
    icon: 'Palette',
    habits: [
      { id: 'draw', name: 'Dibujar', icon: 'Palette' },
      { id: 'write', name: 'Escribir', icon: 'Pen' },
      { id: 'music', name: 'Tocar instrumento', icon: 'Music' },
      { id: 'photo', name: 'Fotografía', icon: 'Camera' },
    ]
  }
};

const HABIT_LIBRARY_DEJAR = {
  digital: {
    name: 'Digital',
    icon: 'Smartphone',
    habits: [
      { id: 'social', name: 'Redes sociales', icon: 'Smartphone' },
      { id: 'games', name: 'Videojuegos', icon: 'Gamepad2' },
      { id: 'youtube', name: 'YouTube excesivo', icon: 'Tv' },
    ]
  },
  alimentacion: {
    name: 'Alimentación',
    icon: 'Apple',
    habits: [
      { id: 'sugar', name: 'Azúcar', icon: 'Candy' },
      { id: 'junk', name: 'Comida chatarra', icon: 'Pizza' },
      { id: 'soda', name: 'Refrescos', icon: 'Wine' },
    ]
  },
  vicios: {
    name: 'Vicios',
    icon: 'Ban',
    habits: [
      { id: 'smoking', name: 'Fumar', icon: 'Cigarette' },
      { id: 'alcohol', name: 'Alcohol', icon: 'Wine' },
      { id: 'caffeine', name: 'Cafeína', icon: 'Coffee' },
    ]
  }
};

export default function BibliotecaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'formar' | 'dejar'>('formar');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  const currentLibrary = activeTab === 'formar' ? HABIT_LIBRARY_FORMAR : HABIT_LIBRARY_DEJAR;

  const handleSelectHabit = (habit: any) => {
    setSelectedHabit(habit);
  };

  const handleAddCustom = () => {
    setSelectedHabit(null);
    setShowCustomModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Biblioteca de Hábitos</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-3">
        <button
          onClick={() => {
            setActiveTab('formar');
            setExpandedCategory(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'formar'
              ? 'bg-[#FF8C66] text-white'
              : 'bg-white text-[#A67B6B] border border-gray-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          A Formar
        </button>
        <button
          onClick={() => {
            setActiveTab('dejar');
            setExpandedCategory(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'dejar'
              ? 'bg-[#FF8C66] text-white'
              : 'bg-white text-[#A67B6B] border border-gray-200'
          }`}
        >
          <X className="w-4 h-4" />
          A Dejar
        </button>
      </div>

      {/* Categories */}
      <div className="px-6 space-y-3 pb-6">
        {Object.entries(currentLibrary).map(([categoryId, category]) => {
          const Icon = LUCIDE_ICONS[category.icon] || LUCIDE_ICONS['Star'];
          const isExpanded = expandedCategory === categoryId;

          return (
            <div key={categoryId} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center">
                    {Icon && <Icon className="w-5 h-5 text-[#FF8C66]" />}
                  </div>
                  <h3 className="text-lg font-semibold text-[#3D2C28]">{category.name}</h3>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#FF8C66]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#A67B6B]" />
                  )}
                </motion.div>
              </button>

              {/* Category Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {category.habits.map((habit) => {
                        const HabitIcon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS['Star'];
                        return (
                          <motion.button
                            key={habit.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelectHabit(habit)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#FFF5F0] hover:bg-[#FFE5D9] transition-colors active:scale-95"
                          >
                            {HabitIcon && <HabitIcon className="w-5 h-5 text-[#FF8C66]" />}
                            <span className="text-xs text-[#3D2C28] font-medium text-center">{habit.name}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Custom Habit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddCustom}
          className="w-full p-4 border-2 border-dashed border-[#FF8C66] rounded-2xl text-[#FF8C66] font-semibold flex items-center justify-center gap-2 hover:bg-[#FFF5F0] transition-colors mt-4"
        >
          <Plus className="w-5 h-5" />
          Crear hábito personalizado
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedHabit && (
          <PersonalizarHabitModal
            habit={selectedHabit}
            type={activeTab}
            onClose={() => setSelectedHabit(null)}
            onSuccess={() => {
              setSelectedHabit(null);
              router.push('/habitos');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomModal && (
          <CrearHabitoModal
            type={activeTab}
            onClose={() => setShowCustomModal(false)}
            onSuccess={() => {
              setShowCustomModal(false);
              router.push('/habitos');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ========== PERSONALIZAR HÁBITO MODAL ==========
function PersonalizarHabitModal({ habit, type, onClose, onSuccess }: any) {
  const [goalValue, setGoalValue] = useState('1');
  const [goalUnit, setGoalUnit] = useState('veces');
  const [frequency, setFrequency] = useState('diario');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [specificDate, setSpecificDate] = useState('');

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const dayIndexMap: { [key: string]: number } = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6, Dom: 0 };

  const handleSave = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const newHabit = {
      id: `habit_${Date.now()}`,
      name: habit.name,
      icon: habit.icon,
      type,
      goalValue: parseInt(goalValue) || 1,
      goalUnit,
      frequency,
      daysOfWeek: frequency === 'semanal' ? daysOfWeek : undefined,
      specificDate: frequency === 'mensual' ? specificDate : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    onSuccess();
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    setDaysOfWeek(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#3D2C28]">{habit.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#3D2C28]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 pb-32">
          {/* Meta */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Meta</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              />
              <select
                value={goalUnit}
                onChange={(e) => setGoalUnit(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              >
                <option value="veces">Veces</option>
                <option value="minutos">Minutos</option>
                <option value="horas">Horas</option>
                <option value="km">Km</option>
                <option value="páginas">Páginas</option>
              </select>
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Frecuencia</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setFrequency('diario');
                  setDaysOfWeek([]);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'diario'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setFrequency('semanal')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'semanal'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setFrequency('mensual')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'mensual'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          {frequency === 'semanal' && (
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Días</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => toggleDayOfWeek(idx)}
                    className={`py-2 rounded-lg font-medium text-xs transition-colors ${
                      daysOfWeek.includes(idx)
                        ? 'bg-[#FF8C66] text-white'
                        : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha específica */}
          {frequency === 'mensual' && (
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Día del mes</label>
              <input
                type="number"
                min="1"
                max="31"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                placeholder="Ej: 15"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-[#FF8C66] text-[#FF8C66] rounded-lg font-medium hover:bg-[#FFF5F0] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#FF8C66] text-white rounded-lg font-medium hover:scale-105 transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== CREAR HÁBITO PERSONALIZADO MODAL ==========
function CrearHabitoModal({ type, onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const [goalValue, setGoalValue] = useState('1');
  const [goalUnit, setGoalUnit] = useState('veces');
  const [frequency, setFrequency] = useState('diario');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [specificDate, setSpecificDate] = useState('');

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const COLORS = ['#FF8C66', '#FFC0A9', '#FF99AC', '#9C6B98', '#6B9B9E', '#FFD166'];
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }

    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const newHabit = {
      id: `habit_${Date.now()}`,
      name,
      icon: 'Star',
      color: selectedColor,
      type,
      goalValue: parseInt(goalValue) || 1,
      goalUnit,
      frequency,
      daysOfWeek: frequency === 'semanal' ? daysOfWeek : undefined,
      specificDate: frequency === 'mensual' ? specificDate : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    onSuccess();
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    setDaysOfWeek(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#3D2C28]">Nuevo hábito</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#3D2C28]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 pb-32">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Nombre del hábito</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Meditar 10 minutos"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Color</label>
            <div className="flex justify-between gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Meta */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Meta</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              />
              <select
                value={goalUnit}
                onChange={(e) => setGoalUnit(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              >
                <option value="veces">Veces</option>
                <option value="minutos">Minutos</option>
                <option value="horas">Horas</option>
                <option value="km">Km</option>
                <option value="páginas">Páginas</option>
              </select>
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Frecuencia</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setFrequency('diario');
                  setDaysOfWeek([]);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'diario'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setFrequency('semanal')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'semanal'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setFrequency('mensual')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  frequency === 'mensual'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          {frequency === 'semanal' && (
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Días</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => toggleDayOfWeek(idx)}
                    className={`py-2 rounded-lg font-medium text-xs transition-colors ${
                      daysOfWeek.includes(idx)
                        ? 'bg-[#FF8C66] text-white'
                        : 'bg-gray-100 text-[#3D2C28] hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha específica */}
          {frequency === 'mensual' && (
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Día del mes</label>
              <input
                type="number"
                min="1"
                max="31"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                placeholder="Ej: 15"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-[#FF8C66] text-[#FF8C66] rounded-lg font-medium hover:bg-[#FFF5F0] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#FF8C66] text-white rounded-lg font-medium hover:scale-105 transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
