'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Plus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LUCIDE_ICONS } from '../utils/icons';

export default function HabitosPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'formar' | 'dejar' | 'todos'>('formar');
  const [habits, setHabits] = useState<any[]>([]);
  const [swipedHabit, setSwipedHabit] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored.filter((h: any) => h.status === 'active'));
  };

  const getFilteredHabits = () => {
    if (filter === 'todos') return habits;
    return habits.filter(h => h.type === filter);
  };

  const getHabitStats = (habitId: string) => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitComps = completions[habitId] || [];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    const completed = habitComps.filter((c: any) =>
      last30Days.includes(c.date) && c.status === 'completed'
    ).length;
    const consistency = Math.round((completed / 30) * 100);
    return { streak: completed, consistency };
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    if (!completions[habitId]) completions[habitId] = [];

    const existing = completions[habitId].findIndex((c: any) => c.date === today);
    if (existing >= 0) {
      completions[habitId].splice(existing, 1);
    } else {
      completions[habitId].push({ date: today, status: 'completed', timestamp: new Date().toISOString() });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    localStorage.setItem('habika_completions', JSON.stringify(completions));
    loadHabits();
  };

  const handleTouchStart = (e: React.TouchEvent, habitId: string) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, habitId: string) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) setSwipedHabit(habitId);
      else setSwipedHabit(null);
    }
    setTouchStart(null);
  };

  const handlePause = (habitId: string) => {
    const reason = prompt('¿Por qué pausas este hábito?');
    if (!reason) return;

    const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const updated = allHabits.map((h: any) =>
      h.id === habitId
        ? { ...h, status: 'paused', pausedAt: new Date().toISOString(), pausedReason: reason }
        : h
    );

    localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
    loadHabits();
    setSwipedHabit(null);
  };

  const handleDelete = (habitId: string) => {
    if (confirm('¿Eliminar este hábito?\nSe perderá todo el historial.')) {
      const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
      const updated = allHabits.filter((h: any) => h.id !== habitId);
      localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
      loadHabits();
      setSwipedHabit(null);
    }
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    return (completions[habitId] || []).some((c: any) => c.date === today);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Mis Hábitos</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button
          onClick={() => setFilter('formar')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'formar' ? 'bg-[#FF99AC] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          A Formar
        </button>
        <button
          onClick={() => setFilter('dejar')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'dejar' ? 'bg-[#FF99AC] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          A Dejar
        </button>
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            filter === 'todos' ? 'bg-[#FF99AC] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          Todos
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-3 pb-6">
        {getFilteredHabits().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A67B6B] text-sm">No tienes hábitos en esta categoría</p>
          </div>
        ) : (
          getFilteredHabits().map((habit) => {
            const Icon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS.Star;
            const stats = getHabitStats(habit.id);
            const completed = isCompletedToday(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onTouchStart={(e) => handleTouchStart(e as any, habit.id)}
                onTouchEnd={(e) => handleTouchEnd(e as any, habit.id)}
                className="relative bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Swipe Actions */}
                <AnimatePresence>
                  {swipedHabit === habit.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-end gap-2 px-4 bg-red-50 z-10"
                    >
                      <button
                        onClick={() => handlePause(habit.id)}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium"
                      >
                        Pausar
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: habit.color || '#FFD166' }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#3D2C28]">{habit.name}</p>
                        <p className="text-xs text-[#A67B6B]">
                          {habit.goalValue} {habit.goalUnit} • {habit.frequency === 'diario' ? 'Diario' : habit.frequency === 'semanal' ? 'Semanal' : 'Mensual'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="w-4 h-4" style={{ color: habit.color || '#FFD166' }} />
                          <span className="text-xs text-[#3D2C28]">{stats.streak}</span>
                          <span className="text-xs text-[#A67B6B]">| {stats.consistency}% constancia</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingHabit(habit);
                          setShowEditModal(true);
                          setSwipedHabit(null);
                        }}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: '#FFF5F0' }}
                      >
                        <Edit2 className="w-4 h-4" style={{ color: habit.color || '#FFD166' }} />
                      </button>
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-12 h-12 rounded-full transition-all ${
                          completed
                            ? 'scale-100'
                            : 'border-2 scale-90'
                        }`}
                        style={{
                          backgroundColor: completed ? (habit.color || '#FFD166') : 'white',
                          borderColor: completed ? 'transparent' : (habit.color || '#FFD166') + '4d'
                        }}
                      >
                        {completed && (
                          <svg className="w-6 h-6 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="max-w-md mx-auto px-6 pb-6">
        <button
          onClick={() => router.push('/biblioteca')}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Hábito
        </button>
      </div>

      <AnimatePresence>
        {showEditModal && editingHabit && (
          <CreateHabitModal
            editingHabit={editingHabit}
            onClose={() => {
              setShowEditModal(false);
              setEditingHabit(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setEditingHabit(null);
              loadHabits();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL EDITAR HÁBITO
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Ingresa un nombre para el hábito');
      return;
    }

    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const index = habits.findIndex((h: any) => h.id === editingHabit.id);

    if (index !== -1) {
      habits[index] = {
        ...habits[index],
        ...formData,
      };
    }

    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    onSuccess();
  };

  const SelectedIcon = LUCIDE_ICONS[formData.icon] || LUCIDE_ICONS['Star'];

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
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-[#A67B6B] font-medium">
            Cancelar
          </button>
          <h2 className="text-lg font-bold text-[#3D2C28]">Editar hábito</h2>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: '#FF99AC' }}
          >
            Guardar
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto pb-28">
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

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
