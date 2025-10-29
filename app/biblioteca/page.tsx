'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, X, Check, Droplet, Dumbbell, BookOpen, Brain, Users, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HABIT_LIBRARY = {
  fisica: {
    name: 'Física',
    icon: Dumbbell,
    color: '#FF8C66',
    habits: [
      { id: 'run', name: 'Correr por la mañana', description: 'Energiza tu día desde el inicio', icon: Dumbbell },
      { id: 'water', name: 'Beber 2L de agua', description: 'Mantén tu cuerpo hidratado', icon: Droplet },
      { id: 'exercise', name: 'Hacer ejercicio 30 min', description: 'Mantén tu cuerpo activo', icon: Dumbbell },
      { id: 'stretch', name: 'Estirar 10 minutos', description: 'Mejora tu flexibilidad', icon: Sparkles },
      { id: 'walk', name: 'Caminar 10,000 pasos', description: 'Muévete durante el día', icon: Dumbbell },
    ]
  },
  mental: {
    name: 'Mental',
    icon: Brain,
    color: '#9B87F5',
    habits: [
      { id: 'meditate', name: 'Meditar 10 min', description: 'Calma tu mente', icon: Brain },
      { id: 'read', name: 'Leer un capítulo', description: 'Expande tu conocimiento', icon: BookOpen },
      { id: 'journal', name: 'Escribir diario', description: 'Reflexiona sobre tu día', icon: BookOpen },
    ]
  },
  creatividad: {
    name: 'Creatividad',
    icon: Sparkles,
    color: '#F97316',
    habits: [
      { id: 'draw', name: 'Dibujar 15 min', description: 'Expresa tu creatividad', icon: Sparkles },
      { id: 'write', name: 'Escribir 500 palabras', description: 'Desarrolla tu escritura', icon: BookOpen },
    ]
  },
  bienestar: {
    name: 'Bienestar',
    icon: Heart,
    color: '#FF99AC',
    habits: [
      { id: 'sleep', name: 'Dormir 8 horas', description: 'Descansa bien', icon: Heart },
      { id: 'gratitude', name: 'Lista de gratitud', description: 'Aprecia lo que tienes', icon: Heart },
    ]
  },
  social: {
    name: 'Social',
    icon: Users,
    color: '#8B5CF6',
    habits: [
      { id: 'call', name: 'Llamar a un amigo', description: 'Mantén tus conexiones', icon: Users },
      { id: 'family', name: 'Tiempo en familia', description: 'Fortalece vínculos', icon: Users },
    ]
  }
};

export default function BibliotecaPage() {
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<string>('fisica');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  const handleSelectHabit = (categoryId: string, habit: any) => {
    const category = HABIT_LIBRARY[categoryId as keyof typeof HABIT_LIBRARY];
    setSelectedHabit({
      ...habit,
      category: categoryId,
      categoryName: category.name,
      categoryColor: category.color
    });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Elige tu próximo hábito</h1>
          <p className="text-sm text-[#A67B6B] mt-1">Explora por categoría o crea uno propio.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button className="px-4 py-2 rounded-full bg-[#FF8C66] text-white font-medium text-sm">
          Formar Hábito
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-[#A67B6B] font-medium text-sm">
          Dejar
        </button>
      </div>

      {/* Categories */}
      <div className="max-w-md mx-auto px-6 space-y-3 pb-6">
        {Object.entries(HABIT_LIBRARY).map(([categoryId, category]) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === categoryId;

          return (
            <div key={categoryId} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedCategory(isExpanded ? '' : categoryId)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <span className="font-semibold text-[#3D2C28]">{category.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
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
                      const HabitIcon = habit.icon;
                      return (
                        <button
                          key={habit.id}
                          onClick={() => handleSelectHabit(categoryId, habit)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
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

      {/* Custom Habit Button */}
      <div className="max-w-md mx-auto px-6 pb-6">
        <button
          onClick={() => {
            setSelectedHabit(null);
            setShowCreateModal(true);
          }}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          Crear hábito personalizado
        </button>
      </div>

      {/* Create Modal */}
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
              setSelectedHabit(null);
              router.push('/mis-habitos');
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
    category: habit?.category || 'fisica',
    type: 'formar',
    frequency: 'diario',
    goal: 30,
    reminder: false
  });

  const handleSave = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const newHabit = {
      id: `habit_${Date.now()}`,
      ...formData,
      status: 'active',
      createdAt: new Date().toISOString(),
      icon: habit?.icon || 'star'
    };
    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    onSuccess();
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-[#A67B6B]">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-[#3D2C28]">Nuevo hábito</h2>
          <button onClick={handleSave} className="text-[#FF8C66] font-semibold">
            <Check className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
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
                className={`flex-1 py-3 rounded-xl font-medium ${
                  formData.type === 'formar'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                ✨ A Formar
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'dejar' })}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  formData.type === 'dejar'
                    ? 'bg-[#FF8C66] text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                🚫 A Dejar
              </button>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Repetir</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none focus:ring-2 focus:ring-[#FF8C66] text-[#3D2C28]"
            >
              <option value="diario">Todos los días</option>
              <option value="semanal">Días específicos</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Objetivo</label>
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-center text-sm text-[#3D2C28] mt-2">{formData.goal} min por día</p>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-[#A67B6B] mb-2">Recordatorio</label>
            <button
              onClick={() => setFormData({ ...formData, reminder: !formData.reminder })}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] text-[#A67B6B] text-left"
            >
              {formData.reminder ? 'Activado' : 'Próximamente'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
