'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUCIDE_ICONS } from '../utils/icons';

const HABIT_LIBRARY = {
  fisica: {
    name: 'Física',
    icon: 'Dumbbell',
    habits: [
      { id: 'run', name: 'Correr por la mañana', description: 'Energiza tu día', icon: 'Dumbbell' },
      { id: 'water', name: 'Beber 2L de agua', description: 'Mantén tu cuerpo hidratado', icon: 'Droplet' },
      { id: 'exercise', name: 'Hacer ejercicio 30 min', description: 'Mantén tu cuerpo activo', icon: 'Activity' },
    ]
  },
  mental: {
    name: 'Mental',
    icon: 'Brain',
    habits: [
      { id: 'meditate', name: 'Meditar 10 min', description: 'Calma tu mente', icon: 'Brain' },
      { id: 'read', name: 'Leer un capítulo', description: 'Expande tu conocimiento', icon: 'BookOpen' },
    ]
  },
  creatividad: {
    name: 'Creatividad',
    icon: 'Sparkles',
    habits: [
      { id: 'draw', name: 'Dibujar 15 min', description: 'Expresa tu creatividad', icon: 'Palette' },
    ]
  },
  bienestar: {
    name: 'Bienestar',
    icon: 'Heart',
    habits: [
      { id: 'sleep', name: 'Dormir 8 horas', description: 'Descansa bien', icon: 'Moon' },
    ]
  },
  social: {
    name: 'Social',
    icon: 'Users',
    habits: [
      { id: 'call', name: 'Llamar a un amigo', description: 'Mantén tus conexiones', icon: 'Phone' },
    ]
  }
};

export default function BibliotecaPage() {
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<string>('fisica');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  const handleSelectHabit = (categoryId: string, habit: any) => {
    setSelectedHabit({ ...habit, category: categoryId });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Elige tu próximo hábito</h1>
          <p className="text-sm text-[#A67B6B] mt-1">Explora por categoría o crea uno propio.</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button className="px-4 py-2 rounded-full bg-[#FF8C66] text-white font-medium text-sm">
          Formar Hábito
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-[#A67B6B] font-medium text-sm">
          Dejar
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-3 pb-6">
        {Object.entries(HABIT_LIBRARY).map(([categoryId, category]) => {
          const Icon = LUCIDE_ICONS[category.icon];
          const isExpanded = expandedCategory === categoryId;

          return (
            <div key={categoryId} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedCategory(isExpanded ? '' : categoryId)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FF8C66]" />
                  </div>
                  <span className="font-semibold text-[#3D2C28]">{category.name}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    {category.habits.map((habit) => {
                      const HabitIcon = LUCIDE_ICONS[habit.icon];
                      return (
                        <button
                          key={habit.id}
                          onClick={() => handleSelectHabit(categoryId, habit)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center">
                              <HabitIcon className="w-5 h-5 text-[#FF8C66]" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-[#3D2C28]">{habit.name}</p>
                              <p className="text-xs text-[#A67B6B]">{habit.description}</p>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-[#FF8C66]" />
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="max-w-md mx-auto px-6 pb-6">
        <button
          onClick={() => {
            setSelectedHabit(null);
            setShowCreateModal(true);
          }}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg"
        >
          Crear hábito personalizado
        </button>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateHabitModal
            habit={selectedHabit}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedHabit(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              router.push('/habitos');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateHabitModal({ habit, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    icon: habit?.icon || 'Star',
    type: 'formar',
    frequency: 'diario',
    selectedDays: [] as number[],
    selectedDates: [] as number[],
    goal: 30,
  });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MONTH_DATES = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSave = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const newHabit = {
      id: `habit_${Date.now()}`,
      ...formData,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    onSuccess();
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const toggleDate = (date: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDates: prev.selectedDates.includes(date)
        ? prev.selectedDates.filter(d => d !== date)
        : [...prev.selectedDates, date]
    }));
  };

  const SelectedIcon = LUCIDE_ICONS[formData.icon];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose}><X className="w-6 h-6 text-[#A67B6B]" /></button>
          <h2 className="text-lg font-bold text-[#3D2C28]">Nuevo hábito</h2>
          <button onClick={handleSave}><Check className="w-6 h-6 text-[#FF8C66]" /></button>
        </div>

        <div className="space-y-6">
          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Icono</label>
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-16 h-16 rounded-full bg-[#FFF5F0] flex items-center justify-center"
            >
              <SelectedIcon className="w-8 h-8 text-[#FF8C66]" />
            </button>
            {showIconPicker && (
              <div className="grid grid-cols-6 gap-2 mt-3 p-3 bg-[#FFF5F0] rounded-xl max-h-48 overflow-y-auto">
                {Object.keys(LUCIDE_ICONS).map((iconName) => {
                  const Icon = LUCIDE_ICONS[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => {
                        setFormData({ ...formData, icon: iconName });
                        setShowIconPicker(false);
                      }}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#FF8C66]/10"
                    >
                      <Icon className="w-5 h-5 text-[#FF8C66]" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Nombre del hábito</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none focus:ring-2 focus:ring-[#FF8C66] text-[#3D2C28]"
              placeholder="Ej: Meditar 10 minutos"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Tipo</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: 'formar' })}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  formData.type === 'formar' ? 'bg-[#FF8C66] text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                A Formar
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'dejar' })}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  formData.type === 'dejar' ? 'bg-[#FF8C66] text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
                A Dejar
              </button>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Repetir</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value, selectedDays: [], selectedDates: [] })}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none focus:ring-2 focus:ring-[#FF8C66] text-[#3D2C28]"
            >
              <option value="diario">Todos los días</option>
              <option value="semanal">Días específicos (semana)</option>
              <option value="mensual">Días específicos (mes)</option>
            </select>
          </div>

          {/* Weekly Selection */}
          {formData.frequency === 'semanal' && (
            <div>
              <label className="block text-sm font-medium text-[#A67B6B] mb-2">Selecciona los días</label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={`py-2 rounded-lg text-sm font-medium ${
                      formData.selectedDays.includes(index)
                        ? 'bg-[#FF8C66] text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setFormData({ ...formData, selectedDays: [0, 1, 2, 3, 4, 5, 6] })}
                  className="text-xs text-[#FF8C66]"
                >
                  Seleccionar todos
                </button>
                <button
                  onClick={() => setFormData({ ...formData, selectedDays: [] })}
                  className="text-xs text-[#A67B6B]"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Monthly Selection */}
          {formData.frequency === 'mensual' && (
            <div>
              <label className="block text-sm font-medium text-[#A67B6B] mb-2">Selecciona los días del mes</label>
              <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
                {MONTH_DATES.map((date) => (
                  <button
                    key={date}
                    onClick={() => toggleDate(date)}
                    className={`py-2 rounded-lg text-sm font-medium ${
                      formData.selectedDates.includes(date)
                        ? 'bg-[#FF8C66] text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setFormData({ ...formData, selectedDates: MONTH_DATES })}
                  className="text-xs text-[#FF8C66]"
                >
                  Seleccionar todos
                </button>
                <button
                  onClick={() => setFormData({ ...formData, selectedDates: [] })}
                  className="text-xs text-[#A67B6B]"
                >
                  Limpiar
                </button>
              </div>
              <p className="text-xs text-[#A67B6B] mt-2">
                Nota: Si el día no existe en un mes, se omite ese mes.
              </p>
            </div>
          )}

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Objetivo (min por día)</label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-center text-sm text-[#3D2C28] mt-2">{formData.goal} min</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
