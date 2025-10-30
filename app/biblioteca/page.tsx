'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Sparkles, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUCIDE_ICONS } from '../utils/icons';

const HABIT_LIBRARY_FORMAR = {
  fisica: {
    name: 'Física',
    icon: 'Dumbbell',
    habits: [
      { name: 'Correr', icon: 'Activity' },
      { name: 'Gym', icon: 'Dumbbell' },
      { name: 'Yoga', icon: 'Feather' },
      { name: 'Caminar', icon: 'Footprints' },
      { name: 'Nadar', icon: 'Droplet' },
    ]
  },
  mental: {
    name: 'Mental',
    icon: 'Brain',
    habits: [
      { name: 'Meditación', icon: 'Brain' },
      { name: 'Lectura', icon: 'BookOpen' },
      { name: 'Journaling', icon: 'Pen' },
      { name: 'Aprender algo nuevo', icon: 'Lightbulb' },
    ]
  },
  social: {
    name: 'Social',
    icon: 'Users',
    habits: [
      { name: 'Llamar a un amigo', icon: 'Phone' },
      { name: 'Pasar tiempo en familia', icon: 'Heart' },
      { name: 'Hacer voluntariado', icon: 'Hand' },
      { name: 'Networking', icon: 'Users' },
    ]
  },
  creatividad: {
    name: 'Creatividad',
    icon: 'Palette',
    habits: [
      { name: 'Dibujar', icon: 'Palette' },
      { name: 'Escribir', icon: 'PenTool' },
      { name: 'Música', icon: 'Music' },
      { name: 'Fotografía', icon: 'Camera' },
    ]
  },
  productividad: {
    name: 'Productividad',
    icon: 'Target',
    habits: [
      { name: 'Trabajar en proyecto', icon: 'Code' },
      { name: 'Planificación diaria', icon: 'Calendar' },
      { name: 'Review semanal', icon: 'TrendingUp' },
      { name: 'Organizar tareas', icon: 'CheckSquare' },
    ]
  }
};

const HABIT_LIBRARY_DEJAR = {
  digital: {
    name: 'Digital',
    icon: 'Phone',
    habits: [
      { name: 'Redes sociales', icon: 'Phone' },
      { name: 'YouTube', icon: 'Laptop' },
      { name: 'Videojuegos', icon: 'Gamepad2' },
      { name: 'Netflix/Streaming', icon: 'Watch' },
    ]
  },
  alimentacion: {
    name: 'Alimentación',
    icon: 'Apple',
    habits: [
      { name: 'Comida chatarra', icon: 'Pizza' },
      { name: 'Azúcares', icon: 'Sparkles' },
      { name: 'Café excesivo', icon: 'Coffee' },
      { name: 'Alcohol', icon: 'Wine' },
    ]
  },
  vicios: {
    name: 'Vicios',
    icon: 'Ban',
    habits: [
      { name: 'Fumar', icon: 'Wind' },
      { name: 'Procrastinación', icon: 'Clock' },
      { name: 'Exceso de pantalla', icon: 'Phone' },
    ]
  },
  negativos: {
    name: 'Hábitos Negativos',
    icon: 'AlertCircle',
    habits: [
      { name: 'Morder uñas', icon: 'Hand' },
      { name: 'Hablar mal de otros', icon: 'AlertCircle' },
      { name: 'Quejarse', icon: 'Wind' },
      { name: 'Pereza', icon: 'Battery' },
    ]
  },
  consumo: {
    name: 'Consumo',
    icon: 'ShoppingBag',
    habits: [
      { name: 'Compras innecesarias', icon: 'ShoppingBag' },
      { name: 'Gastar en impulsivas', icon: 'DollarSign' },
      { name: 'Consumo de plástico', icon: 'Package' },
    ]
  }
};

export default function BibliotecaPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'formar' | 'dejar'>('formar');
  const [showModal, setShowModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Star');
  const [habitType, setHabitType] = useState<'formar' | 'dejar'>('formar');
  const [goalValue, setGoalValue] = useState('1');
  const [goalUnit, setGoalUnit] = useState('veces');
  const [frequency, setFrequency] = useState('diario');

  const ICON_GRID = [
    'Dumbbell', 'Brain', 'BookOpen', 'Heart', 'Flame', 'Star',
    'Sparkles', 'Zap', 'Target', 'TrendingUp', 'Activity', 'Award',
    'Music', 'Palette', 'Camera', 'Code', 'Gamepad2', 'Smile',
    'Coffee', 'Apple', 'Utensils', 'Droplet', 'Moon', 'Sun',
    'Wind', 'Cloud', 'Mountain', 'Feather', 'Leaf', 'Sprout'
  ];

  const openModal = (habit?: any) => {
    if (habit) {
      setSelectedHabit(habit);
      setCustomName('');
    } else {
      setSelectedHabit(null);
      setCustomName('');
      setSelectedIcon('Star');
      setHabitType('formar');
      setGoalValue('1');
      setGoalUnit('veces');
      setFrequency('diario');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHabit(null);
    setCustomName('');
  };

  const saveHabit = () => {
    const name = customName.trim() || selectedHabit?.name || 'Nuevo Hábito';
    if (!name) return;

    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const newHabit = {
      id: `habit_${Date.now()}`,
      name,
      icon: selectedIcon,
      type: habitType,
      goalValue: parseInt(goalValue) || 1,
      goalUnit,
      frequency,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    closeModal();
    router.push('/habitos');
  };

  const library = selectedType === 'formar' ? HABIT_LIBRARY_FORMAR : HABIT_LIBRARY_DEJAR;

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Biblioteca de Hábitos</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button
          onClick={() => setSelectedType('formar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            selectedType === 'formar'
              ? 'bg-[#FF8C66] text-white'
              : 'bg-white text-[#A67B6B]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          A Formar
        </button>
        <button
          onClick={() => setSelectedType('dejar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            selectedType === 'dejar'
              ? 'bg-[#FF8C66] text-white'
              : 'bg-white text-[#A67B6B]'
          }`}
        >
          <Ban className="w-4 h-4" />
          A Dejar
        </button>
      </div>

      {/* Categories */}
      <div className="max-w-md mx-auto px-6 space-y-6 pb-6">
        {Object.entries(library).map(([key, category]) => {
          const Icon = LUCIDE_ICONS[category.icon] || LUCIDE_ICONS['Star'];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF5F0] flex items-center justify-center">
                  {Icon && <Icon className="w-5 h-5 text-[#FF8C66]" />}
                </div>
                <h2 className="text-lg font-bold text-[#3D2C28]">{category.name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {category.habits.map((habit, idx) => {
                  const HabitIcon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS['Star'];
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal(habit)}
                      className="p-3 bg-white rounded-lg border-2 border-[#FF8C66]/20 hover:border-[#FF8C66]/50 transition-colors flex items-center gap-2 active:scale-95"
                    >
                      {HabitIcon && <HabitIcon className="w-5 h-5 text-[#FF8C66]" />}
                      <span className="text-sm font-medium text-[#3D2C28]">{habit.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Custom Habit Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => openModal()}
          className="w-full p-4 border-2 border-dashed border-[#FF8C66] rounded-lg text-[#FF8C66] font-medium hover:bg-[#FFF5F0] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear hábito personalizado
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 500 }}
              animate={{ y: 0 }}
              exit={{ y: 500 }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl shadow-2xl overflow-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200/50 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-[#3D2C28]">Hábito personalizado</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#3D2C28]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-6 pb-32">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Elige un icono</label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_GRID.map((iconName) => {
                      const IconComponent = LUCIDE_ICONS[iconName] || LUCIDE_ICONS['Star'];
                      return (
                        <motion.button
                          key={iconName}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => setSelectedIcon(iconName)}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${
                            selectedIcon === iconName
                              ? 'border-[#FF8C66] bg-[#FFF5F0]'
                              : 'border-gray-200 hover:border-[#FF8C66]/50'
                          }`}
                        >
                          {IconComponent && <IconComponent className="w-6 h-6 text-[#FF8C66]" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Habit Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Nombre del hábito</label>
                  <input
                    type="text"
                    placeholder="ej. Meditar 10 minutos"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none text-[#3D2C28] placeholder-[#A67B6B]"
                  />
                </div>

                {/* Habit Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Tipo de hábito</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHabitType('formar')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        habitType === 'formar'
                          ? 'bg-[#FF8C66] text-white'
                          : 'bg-white border-2 border-[#FF8C66]/30 text-[#FF8C66]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      A Formar
                    </button>
                    <button
                      onClick={() => setHabitType('dejar')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        habitType === 'dejar'
                          ? 'bg-[#FF8C66] text-white'
                          : 'bg-white border-2 border-[#FF8C66]/30 text-[#FF8C66]'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      A Dejar
                    </button>
                  </div>
                </div>

                {/* Goal */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Meta</label>
                    <input
                      type="number"
                      min="1"
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none text-[#3D2C28]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Unidad</label>
                    <select
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none text-[#3D2C28]"
                    >
                      <option value="veces">Veces</option>
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="km">Km</option>
                      <option value="páginas">Páginas</option>
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF8C66] focus:outline-none text-[#3D2C28]"
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>

                {/* Save Button - Fixed in header */}
              </div>

              {/* Fixed Footer with Save Button */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/50 px-6 py-4 flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border-2 border-[#FF8C66]/30 text-[#FF8C66] rounded-lg font-medium hover:bg-[#FFF5F0] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveHabit}
                  className="flex-1 px-4 py-3 bg-[#FF8C66] text-white rounded-lg font-medium hover:scale-105 transition-transform active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
