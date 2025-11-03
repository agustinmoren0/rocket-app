'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUCIDE_ICONS } from '@/app/utils/icons';
import { syncHabitToCalendar, removeHabitFromCalendar } from '@/app/lib/store';

const HABIT_LIBRARY_FORMAR = {
  fisica: {
    name: 'Física',
    icon: 'Dumbbell',
    habits: [
      { id: 'run', name: 'Correr por la mañana', description: 'Energiza tu día desde el inicio.', icon: 'Dumbbell' },
      { id: 'water', name: 'Beber 2L de agua', description: 'Mantén tu cuerpo hidratado.', icon: 'Droplet' },
      { id: 'gym', name: 'Gym', description: 'Fortalece tu cuerpo.', icon: 'Dumbbell' },
      { id: 'yoga', name: 'Yoga', description: 'Equilibrio físico y mental.', icon: 'Heart' },
      { id: 'swim', name: 'Nadar', description: 'Ejercicio de bajo impacto.', icon: 'Droplet' },
    ]
  },
  mental: {
    name: 'Mental',
    icon: 'Brain',
    habits: [
      { id: 'meditate', name: 'Meditación', description: 'Calma tu mente.', icon: 'Brain' },
      { id: 'read', name: 'Lectura', description: 'Expande tu conocimiento.', icon: 'BookOpen' },
      { id: 'journal', name: 'Journaling', description: 'Reflexiona sobre tu día.', icon: 'BookOpen' },
      { id: 'learn', name: 'Aprender algo nuevo', description: 'Crece constantemente.', icon: 'Lightbulb' },
    ]
  },
  creatividad: {
    name: 'Creatividad',
    icon: 'Palette',
    habits: [
      { id: 'draw', name: 'Dibujar', description: 'Expresa tu creatividad.', icon: 'Palette' },
      { id: 'write', name: 'Escribir', description: 'Plasma tus ideas.', icon: 'Pen' },
      { id: 'music', name: 'Tocar instrumento', description: 'Desarrolla talento musical.', icon: 'Music' },
      { id: 'photo', name: 'Fotografía', description: 'Captura momentos.', icon: 'Camera' },
    ]
  },
  bienestar: {
    name: 'Bienestar',
    icon: 'Heart',
    habits: [
      { id: 'sleep', name: 'Dormir 8 horas', description: 'Descansa bien.', icon: 'Moon' },
      { id: 'gratitude', name: 'Lista de gratitud', description: 'Aprecia lo que tienes.', icon: 'Heart' },
      { id: 'breathe', name: 'Respiración profunda', description: 'Reduce estrés.', icon: 'Heart' },
    ]
  },
  social: {
    name: 'Social',
    icon: 'Users',
    habits: [
      { id: 'call', name: 'Llamar a un amigo', description: 'Mantén tus conexiones.', icon: 'Phone' },
      { id: 'family', name: 'Pasar tiempo en familia', description: 'Fortalece vínculos.', icon: 'Heart' },
      { id: 'volunteer', name: 'Hacer voluntariado', description: 'Contribuye a tu comunidad.', icon: 'HandHeart' },
      { id: 'network', name: 'Networking', description: 'Expande tu red.', icon: 'Users' },
    ]
  }
};

const HABIT_LIBRARY_DEJAR = {
  digital: {
    name: 'Digital',
    icon: 'Smartphone',
    habits: [
      { id: 'social', name: 'Redes sociales', description: 'Menos tiempo en pantallas.', icon: 'Smartphone' },
      { id: 'games', name: 'Videojuegos', description: 'Controla tu tiempo.', icon: 'Gamepad2' },
      { id: 'youtube', name: 'YouTube excesivo', description: 'Usa tu tiempo mejor.', icon: 'Tv' },
    ]
  },
  alimentacion: {
    name: 'Alimentación',
    icon: 'Apple',
    habits: [
      { id: 'sugar', name: 'Azúcar', description: 'Mejora tu salud.', icon: 'Candy' },
      { id: 'junk', name: 'Comida chatarra', description: 'Come más sano.', icon: 'Pizza' },
      { id: 'soda', name: 'Refrescos', description: 'Bebe más agua.', icon: 'Wine' },
    ]
  },
  vicios: {
    name: 'Vicios',
    icon: 'Ban',
    habits: [
      { id: 'smoking', name: 'Fumar', description: 'Cuida tus pulmones.', icon: 'Cigarette' },
      { id: 'alcohol', name: 'Alcohol', description: 'Vive más sano.', icon: 'Wine' },
      { id: 'caffeine', name: 'Cafeína', description: 'Duerme mejor.', icon: 'Coffee' },
    ]
  }
};

export default function BibliotecaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'formar' | 'dejar'>('formar');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const currentLibrary = activeTab === 'formar' ? HABIT_LIBRARY_FORMAR : HABIT_LIBRARY_DEJAR;

  const handleSelectHabit = (habit: any) => {
    setEditingHabit({
      name: habit.name,
      icon: habit.icon,
      type: activeTab,
      isPreset: true,
    });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-24">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-3 pt-safe">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Elige tu próximo hábito</h1>
          <p className="text-sm text-[#A67B6B] mt-1">Explora por categoría o crea uno propio.</p>
        </div>
      </header>

      <div className="px-6 py-3 flex gap-3">
        <button
          onClick={() => setActiveTab('formar')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'formar'
              ? 'bg-white text-[#3D2C28] shadow-sm'
              : 'bg-transparent text-[#A67B6B]'
          }`}
        >
          Formar Hábito
        </button>
        <button
          onClick={() => setActiveTab('dejar')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'dejar'
              ? 'bg-white text-[#3D2C28] shadow-sm'
              : 'bg-transparent text-[#A67B6B]'
          }`}
        >
          Dejar
        </button>
      </div>

      <div className="px-6 space-y-3 pb-4">
        {Object.entries(currentLibrary).map(([categoryId, category]) => {
          const Icon = LUCIDE_ICONS[category.icon] || LUCIDE_ICONS['Star'];
          const isExpanded = expandedCategory === categoryId;

          return (
            <div key={categoryId} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFC0A9]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#E8A598]" />
                  </div>
                  <span className="font-semibold text-[#3D2C28]">{category.name}</span>
                </div>
                {isExpanded ?
                  <ChevronDown className="w-5 h-5 text-[#E8A598]" /> :
                  <ChevronRight className="w-5 h-5 text-[#E8A598]" />
                }
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {category.habits.map((habit) => {
                        const HabitIcon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS['Star'];
                        return (
                          <button
                            key={habit.id}
                            onClick={() => handleSelectHabit(habit)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#FFF5F0] hover:bg-[#FFE5D9] transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-[#FFC0A9]/30 flex items-center justify-center shrink-0">
                              <HabitIcon className="w-5 h-5 text-[#E8A598]" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-[#3D2C28] text-sm">{habit.name}</p>
                              <p className="text-xs text-[#A67B6B]">{habit.description}</p>
                            </div>
                            <Plus className="w-5 h-5 text-[#FFC0A9] shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-6 z-10">
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowCreateModal(true);
          }}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg"
        >
          Crear hábito personalizado
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showCreateModal && (
          <CreateHabitModal
            editingHabit={editingHabit}
            onClose={() => {
              setShowCreateModal(false);
              setEditingHabit(null);
            }}
            onSuccess={() => {
              console.log('🎯 onSuccess called - closing modal and navigating...');
              setShowCreateModal(false);
              setEditingHabit(null);

              // Asegurar navegación inmediata
              console.log('→ Pushing to /app/habitos...');
              router.push('/app/habitos');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL CREAR/EDITAR HÁBITO
// ═══════════════════════════════════════════════════════════════════

function CreateHabitModal({ editingHabit, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: editingHabit?.name || '',
    icon: editingHabit?.icon || 'Star',
    color: editingHabit?.color || '#FFD166',
    type: editingHabit?.type || 'formar',
    goalValue: editingHabit?.goalValue || 1,
    goalUnit: editingHabit?.goalUnit || 'veces',
    frequency: editingHabit?.frequency || 'diario',
    frequencyInterval: editingHabit?.frequencyInterval || 1,
    selectedDays: editingHabit?.daysOfWeek || [],
    selectedDates: editingHabit?.datesOfMonth || [],
    startTime: editingHabit?.startTime || '09:00',
    endTime: editingHabit?.endTime || '17:00',
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  // PALETA DE COLORES PARA LOS GLOBOS DE HÁBITOS
  const COLORS = [
    '#FFD166', // Amarillo
    '#FF99AC', // Rosa
    '#FFC0A9', // Salmón
    '#9C6B98', // Morado
    '#6B9B9E', // Verde azulado
    '#6B8BB6', // Azul
    '#E8A598', // Rosa oscuro
    '#C9A0A0', // Rosa taupe
    '#A8D8EA', // Celeste
    '#FFB4A8', // Melocotón
    '#B8E6B8', // Verde claro
    '#D4A5A5', // Rosa gris
  ];

  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MONTH_DATES = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Ingresa un nombre para el hábito');
      return;
    }

    try {
      const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');

      if (editingHabit && !editingHabit.isPreset) {
        // Editar hábito existente
        const index = habits.findIndex((h: any) => h.id === editingHabit.id);
        if (index !== -1) {
          habits[index] = {
            ...habits[index],
            ...formData,
          };
          // Re-sync hábito actualizado al calendario
          try {
            removeHabitFromCalendar(editingHabit.id);
            syncHabitToCalendar(habits[index]);
          } catch (syncError) {
            console.warn('⚠️ Sync warning (habit will still be saved):', syncError);
          }
        }
      } else {
        // Crear nuevo hábito
        const newHabit = {
          id: `habit_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          completedDates: [],
        };
        habits.push(newHabit);
        console.log('✅ Habit created:', newHabit);
        // Sincronizar nuevo hábito al calendario
        try {
          syncHabitToCalendar(newHabit);
        } catch (syncError) {
          console.warn('⚠️ Sync warning (habit will still be saved):', syncError);
        }
      }

      localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
      console.log('💾 Saved to localStorage, calling onSuccess()...');
      onSuccess();
    } catch (error) {
      console.error('❌ Error saving habit:', error);
      alert('Error al guardar el hábito. Por favor intenta de nuevo.');
    }
  };

  const SelectedIcon = LUCIDE_ICONS[formData.icon] || LUCIDE_ICONS['Star'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-[#A67B6B] font-medium text-sm">
            Cancelar
          </button>
          <h2 className="text-lg font-bold text-[#3D2C28]">
            {editingHabit && !editingHabit.isPreset ? 'Editar hábito' : 'Nuevo hábito'}
          </h2>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: '#FF99AC' }}
          >
            Guardar
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-6 space-y-6">

            {/* Icono + Nombre */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Nombre del hábito</label>
              <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: '#FFF5F0' }}>
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                >
                  <SelectedIcon className="w-6 h-6 text-white" />
                </button>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Meditar 10 minutos"
                  className="flex-1 bg-transparent border-none text-[#3D2C28] placeholder:text-[#A67B6B] focus:outline-none"
                />
              </div>

              {/* Selector de iconos */}
              {showIconPicker && (
                <div className="mt-3 grid grid-cols-6 gap-2 rounded-xl p-3" style={{ backgroundColor: '#FFF5F0' }}>
                  {Object.keys(LUCIDE_ICONS).slice(0, 36).map((iconName) => {
                    const Icon = LUCIDE_ICONS[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          setFormData({ ...formData, icon: iconName });
                          setShowIconPicker(false);
                        }}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center shadow-sm ${
                          formData.icon === iconName ? 'ring-2 ring-offset-1' : ''
                        }`}
                        style={{
                          backgroundColor: formData.icon === iconName ? formData.color : 'white',
                          outlineColor: formData.color
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: formData.icon === iconName ? 'white' : formData.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Color - PALETA VARIADA PARA LOS GLOBOS */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Color del hábito</label>
              <div className="grid grid-cols-6 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-12 h-12 rounded-full transition-transform shadow-sm ${
                      formData.color === color ? 'ring-4 ring-offset-2 scale-110' : ''
                    }`}
                    style={{
                      backgroundColor: color,
                    }}
                  >
                    {formData.color === color && (
                      <svg className="w-6 h-6 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Tipo de hábito</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormData({ ...formData, type: 'formar' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.type === 'formar'
                      ? 'text-white'
                      : 'text-[#A67B6B]'
                  }`}
                  style={{
                    backgroundColor: formData.type === 'formar' ? '#FF99AC' : '#FFF5F0'
                  }}
                >
                  A Formar
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'dejar' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.type === 'dejar'
                      ? 'text-white'
                      : 'text-[#A67B6B]'
                  }`}
                  style={{
                    backgroundColor: formData.type === 'dejar' ? '#FF99AC' : '#FFF5F0'
                  }}
                >
                  A Dejar
                </button>
              </div>
            </div>

            {/* Meta */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Meta</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={formData.goalValue}
                  onChange={(e) => setFormData({ ...formData, goalValue: parseInt(e.target.value) || 1 })}
                  className="w-20 px-4 py-3 rounded-xl text-center font-semibold text-[#3D2C28] border-2 focus:outline-none"
                  style={{
                    backgroundColor: '#FFF5F0',
                    borderColor: formData.color
                  }}
                />
                <select
                  value={formData.goalUnit}
                  onChange={(e) => setFormData({ ...formData, goalUnit: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl text-[#3D2C28] font-medium border-none focus:outline-none"
                  style={{ backgroundColor: '#FFF5F0' }}
                >
                  <option value="veces">Veces</option>
                  <option value="min">Minutos</option>
                  <option value="hora(s)">Hora(s)</option>
                  <option value="km">Kilómetros</option>
                  <option value="milla(s)">Milla(s)</option>
                  <option value="litro(s)">Litro(s)</option>
                  <option value="ml">Mililitros</option>
                  <option value="vaso(s)">Vaso(s)</option>
                  <option value="kg">Kilogramos</option>
                  <option value="gramo(s)">Gramo(s)</option>
                  <option value="libra(s)">Libra(s)</option>
                  <option value="onza(s)">Onza(s)</option>
                  <option value="páginas">Páginas</option>
                  <option value="pedazo(s)">Pedazo(s)</option>
                </select>
              </div>
            </div>

            {/* Frecuencia */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Frecuencia</label>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'diario' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequency === 'diario'
                      ? 'text-white'
                      : 'text-[#A67B6B]'
                  }`}
                  style={{
                    backgroundColor: formData.frequency === 'diario' ? '#FF99AC' : '#FFF5F0'
                  }}
                >
                  Diario
                </button>
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'semanal', selectedDays: [] })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequency === 'semanal'
                      ? 'text-white'
                      : 'text-[#A67B6B]'
                  }`}
                  style={{
                    backgroundColor: formData.frequency === 'semanal' ? '#FF99AC' : '#FFF5F0'
                  }}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'mensual', selectedDates: [] })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequency === 'mensual'
                      ? 'text-white'
                      : 'text-[#A67B6B]'
                  }`}
                  style={{
                    backgroundColor: formData.frequency === 'mensual' ? '#FF99AC' : '#FFF5F0'
                  }}
                >
                  Mensual
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 rounded-xl p-4 mb-4" style={{ backgroundColor: '#FFF5F0' }}>
                <span className="text-[#A67B6B] text-sm">Cada</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.frequencyInterval}
                  onChange={(e) => setFormData({ ...formData, frequencyInterval: parseInt(e.target.value) || 1 })}
                  className="w-16 px-3 py-2 rounded-lg bg-white text-center font-bold text-[#3D2C28] border-2"
                  style={{ borderColor: formData.color }}
                />
                <span className="text-[#A67B6B] text-sm">
                  {formData.frequency === 'diario' && (formData.frequencyInterval === 1 ? 'día' : 'días')}
                  {formData.frequency === 'semanal' && (formData.frequencyInterval === 1 ? 'semana' : 'semanas')}
                  {formData.frequency === 'mensual' && (formData.frequencyInterval === 1 ? 'mes' : 'meses')}
                </span>
              </div>

              {formData.frequency === 'semanal' && (
                <div>
                  <p className="text-xs text-[#A67B6B] mb-2 font-medium">Días</p>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const days = formData.selectedDays.includes(index)
                            ? formData.selectedDays.filter((d: number) => d !== index)
                            : [...formData.selectedDays, index];
                          setFormData({ ...formData, selectedDays: days });
                        }}
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                          formData.selectedDays.includes(index)
                            ? 'text-white'
                            : 'text-[#A67B6B]'
                        }`}
                        style={{
                          backgroundColor: formData.selectedDays.includes(index) ? formData.color : '#FFF5F0'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.frequency === 'mensual' && (
                <div>
                  <p className="text-xs text-[#A67B6B] mb-2 font-medium">Días del mes</p>
                  <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto rounded-xl p-3" style={{ backgroundColor: '#FFF5F0' }}>
                    {MONTH_DATES.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          const dates = formData.selectedDates.includes(date)
                            ? formData.selectedDates.filter((d: number) => d !== date)
                            : [...formData.selectedDates, date];
                          setFormData({ ...formData, selectedDates: dates });
                        }}
                        className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                          formData.selectedDates.includes(date)
                            ? 'text-white'
                            : 'text-[#A67B6B]'
                        }`}
                        style={{
                          backgroundColor: formData.selectedDates.includes(date) ? formData.color : 'white'
                        }}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Horario */}
            <div>
              <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Horario</label>
              <p className="text-xs text-[#A67B6B] mb-3">Define en qué horario quieres realizar este hábito</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#A67B6B] font-medium mb-2 block">Inicio</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-[#3D2C28] font-medium border-2 focus:outline-none"
                    style={{
                      backgroundColor: '#FFF5F0',
                      borderColor: formData.color
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#A67B6B] font-medium mb-2 block">Fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-[#3D2C28] font-medium border-2 focus:outline-none"
                    style={{
                      backgroundColor: '#FFF5F0',
                      borderColor: formData.color
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-[#A67B6B] mt-2">
                {formData.startTime} - {formData.endTime}
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
