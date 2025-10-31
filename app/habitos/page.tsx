// ═══════════════════════════════════════════════════════════════════
// app/habitos/page.tsx - CON SWIPE ACTIONS Y LÓGICA DE PAUSAR
// ═══════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Plus, Play, Pause, Trash2, AlertCircle } from 'lucide-react';
import { LUCIDE_ICONS } from '../utils/icons';

export default function HabitosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'formar' | 'dejar' | 'pausados'>('formar');
  const [habits, setHabits] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const savedHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(savedHabits);
  };

  const filteredHabits = habits.filter(h => {
    if (activeTab === 'pausados') return h.status === 'paused';
    if (activeTab === 'formar') return h.type === 'formar' && h.status === 'active';
    if (activeTab === 'dejar') return h.type === 'dejar' && h.status === 'active';
    return false;
  });

  const toggleComplete = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit?.status === 'paused') {
      setAlertMessage('Este hábito está pausado. Reactívalo para registrar progreso.');
      setShowAlert(true);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const completedDates = h.completedDates || [];
        const isCompleted = completedDates.includes(today);

        return {
          ...h,
          completedDates: isCompleted
            ? completedDates.filter((d: string) => d !== today)
            : [...completedDates, today]
        };
      }
      return h;
    });

    setHabits(updatedHabits);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
  };

  const pauseHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    const action = habit?.status === 'paused' ? 'reactivar' : 'pausar';

    setConfirmAction({
      type: 'pause',
      habitId,
      message: `¿Seguro que quieres ${action} este hábito?`,
      confirmText: action === 'pausar' ? 'Pausar' : 'Reactivar'
    });
  };

  const confirmPause = () => {
    const updatedHabits = habits.map(h => {
      if (h.id === confirmAction.habitId) {
        return {
          ...h,
          status: h.status === 'paused' ? 'active' : 'paused',
          pausedAt: h.status === 'paused' ? null : new Date().toISOString()
        };
      }
      return h;
    });

    setHabits(updatedHabits);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
    setConfirmAction(null);
  };

  const deleteHabit = (habitId: string) => {
    setConfirmAction({
      type: 'delete',
      habitId,
      message: '¿Estás seguro de eliminar este hábito? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar'
    });
  };

  const confirmDelete = () => {
    const updatedHabits = habits.filter(h => h.id !== confirmAction.habitId);
    setHabits(updatedHabits);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
    setConfirmAction(null);
  };

  const editHabit = (habit: any) => {
    setEditingActivity(habit);
    setShowEditModal(true);
  };

  const calculateStreak = (habit: any) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    const sortedDates = [...habit.completedDates].sort().reverse();
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateConsistency = (habit: any) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    const daysSinceCreation = Math.ceil(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(100, Math.round((habit.completedDates.length / daysSinceCreation) * 100));
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32 pt-0">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Mis Hábitos</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-3">
        <button
          onClick={() => setActiveTab('formar')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'formar'
              ? 'bg-white text-[#3D2C28] shadow-sm'
              : 'bg-transparent text-[#A67B6B]'
          }`}
        >
          A Formar
        </button>
        <button
          onClick={() => setActiveTab('dejar')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'dejar'
              ? 'bg-white text-[#3D2C28] shadow-sm'
              : 'bg-transparent text-[#A67B6B]'
          }`}
        >
          A Dejar
        </button>
        <button
          onClick={() => setActiveTab('pausados')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'pausados'
              ? 'bg-white text-[#3D2C28] shadow-sm'
              : 'bg-transparent text-[#A67B6B]'
          }`}
        >
          Pausados
        </button>
      </div>

      {/* Lista de hábitos */}
      <div className="px-6 space-y-3 pb-6">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A67B6B]">
              {activeTab === 'pausados'
                ? 'No tienes hábitos pausados'
                : 'No tienes hábitos en esta categoría'}
            </p>
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleComplete={toggleComplete}
              onPause={pauseHabit}
              onEdit={editHabit}
              onDelete={deleteHabit}
              streak={calculateStreak(habit)}
              consistency={calculateConsistency(habit)}
            />
          ))
        )}
      </div>

      {/* Botón crear hábito */}
      <div className="fixed bottom-20 left-0 right-0 px-6 z-10">
        <button
          onClick={() => router.push('/biblioteca')}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Hábito
        </button>
      </div>

      <AnimatePresence>
        {showAlert && (
          <AlertModal message={alertMessage} onClose={() => setShowAlert(false)} />
        )}

        {confirmAction && (
          <ConfirmModal
            message={confirmAction.message}
            confirmText={confirmAction.confirmText}
            onConfirm={confirmAction.type === 'delete' ? confirmDelete : confirmPause}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HABIT CARD CON SWIPE ACTIONS
// ═══════════════════════════════════════════════════════════════════

function HabitCard({ habit, onToggleComplete, onPause, onEdit, onDelete, streak, consistency }: any) {
  const x = useMotionValue(0);
  const [swipeState, setSwipeState] = useState<'closed' | 'edit' | 'actions'>('closed');

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Swipe rápido (velocidad alta)
    if (Math.abs(velocity) > 500) {
      if (velocity > 0 && swipeState === 'closed') {
        // Swipe derecha rápido
        setSwipeState('edit');
        x.set(100);
      } else if (velocity < 0 && swipeState === 'closed') {
        // Swipe izquierda rápido
        setSwipeState('actions');
        x.set(-160);
      } else {
        // Cerrar
        setSwipeState('closed');
        x.set(0);
      }
      return;
    }

    // Swipe lento (por distancia)
    if (offset > 50 && swipeState === 'closed') {
      setSwipeState('edit');
      x.set(100);
    } else if (offset < -50 && swipeState === 'closed') {
      setSwipeState('actions');
      x.set(-160);
    } else if (Math.abs(offset) < 20 && swipeState !== 'closed') {
      // Cerrar si desliza de vuelta
      setSwipeState('closed');
      x.set(0);
    } else {
      // Volver al estado actual
      if (swipeState === 'edit') x.set(100);
      else if (swipeState === 'actions') x.set(-160);
      else x.set(0);
    }
  };

  const closeSwipe = () => {
    setSwipeState('closed');
    x.set(0);
  };

  const handleEdit = () => {
    onEdit(habit);
    closeSwipe();
  };

  const Icon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS['Star'];
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates?.includes(today);
  const isPaused = habit.status === 'paused';

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Botón EDITAR (derecha) */}
      <AnimatePresence>
        {swipeState === 'edit' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-0 top-0 bottom-0 flex items-center pl-4"
          >
            <button
              onClick={handleEdit}
              className="w-20 h-16 rounded-2xl bg-[#6B9B9E] flex flex-col items-center justify-center shadow-md"
            >
              <Edit2 className="w-5 h-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">Editar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones PAUSAR/ELIMINAR (izquierda) */}
      <AnimatePresence>
        {swipeState === 'actions' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 top-0 bottom-0 flex items-center pr-4 gap-2"
          >
            <button
              onClick={() => {
                onPause(habit.id);
                closeSwipe();
              }}
              className={`w-20 h-16 rounded-2xl flex flex-col items-center justify-center shadow-md ${
                isPaused ? 'bg-[#6B9B9E]' : 'bg-[#FFD166]'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Activar</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Pausar</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onDelete(habit.id);
                closeSwipe();
              }}
              className="w-20 h-16 rounded-2xl bg-[#FF6B6B] flex flex-col items-center justify-center shadow-md"
            >
              <Trash2 className="w-5 h-5 text-white mb-1" />
              <span className="text-xs text-white font-medium">Eliminar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card principal */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 100 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm ${
          isPaused ? 'opacity-60' : ''
        }`}
      >
        {/* Icono del hábito */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm relative"
          style={{ backgroundColor: habit.color }}
        >
          <Icon className="w-7 h-7 text-white" />
          {isPaused && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#A67B6B] rounded-full flex items-center justify-center">
              <Pause className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info del hábito */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#3D2C28] mb-1 truncate">
            {habit.name}
            {isPaused && (
              <span className="ml-2 text-xs text-[#A67B6B] font-normal">• Pausado</span>
            )}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[#A67B6B]">
            <span>• {habit.frequency === 'diario' ? 'Diario' : habit.frequency === 'semanal' ? 'Semanal' : 'Mensual'}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[#A67B6B]">
              🔥 {streak} | {consistency}% constancia
            </span>
          </div>
        </div>

        {/* Botón completar O reactivar (si pausado) */}
        {isPaused ? (
          <button
            onClick={() => onPause(habit.id)}
            className="px-4 py-2 rounded-xl bg-[#6B9B9E] text-white text-sm font-semibold flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Reactivar
          </button>
        ) : (
          <button
            onClick={() => onToggleComplete(habit.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isCompleted ? 'shadow-md' : 'bg-[#FFF5F0] hover:bg-[#FFE5D9]'
            }`}
            style={{
              backgroundColor: isCompleted ? habit.color : undefined,
            }}
          >
            {isCompleted ? (
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-[#A67B6B]" />
            )}
          </button>
        )}
      </motion.div>
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

// ═══════════════════════════════════════════════════════════════════
// ALERT MODAL
// ═══════════════════════════════════════════════════════════════════

function AlertModal({ message, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FFC0A9]/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-[#FF99AC]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#3D2C28] mb-1">Hábito pausado</h3>
            <p className="text-sm text-[#A67B6B]">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#FF99AC] text-white rounded-xl font-semibold"
        >
          Entendido
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════════

function ConfirmModal({ message, confirmText, onConfirm, onCancel }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center px-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-[#3D2C28] mb-2">Confirmar acción</h3>
        <p className="text-sm text-[#A67B6B] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-[#FFF5F0] text-[#A67B6B] rounded-xl font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#FF99AC] text-white rounded-xl font-semibold"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
