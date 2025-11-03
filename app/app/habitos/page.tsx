'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Plus, Play, Pause, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { LUCIDE_ICONS } from '@/app/utils/icons';
import { removeHabitFromCalendar, syncHabitToCalendar } from '@/app/lib/store';

export default function HabitosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'formar' | 'dejar' | 'pausados'>('formar');
  const [habits, setHabits] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

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

    // Sincronizar cambio de estado en el calendario
    const updatedHabit = updatedHabits.find(h => h.id === confirmAction.habitId);
    if (updatedHabit?.status === 'active') {
      // Si se reactivó, re-sincronizar al calendario
      removeHabitFromCalendar(confirmAction.habitId);
      syncHabitToCalendar(updatedHabit);
    } else {
      // Si se pausó, remover del calendario
      removeHabitFromCalendar(confirmAction.habitId);
    }

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
    const habitToDelete = habits.find(h => h.id === confirmAction.habitId);
    const updatedHabits = habits.filter(h => h.id !== confirmAction.habitId);
    setHabits(updatedHabits);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
    // Remover hábito del calendario
    removeHabitFromCalendar(confirmAction.habitId);
    setConfirmAction(null);
  };

  const editHabit = (habit: any) => {
    setEditingHabit(habit);
  };

  const saveEditedHabit = (updatedHabit: any) => {
    const updatedHabits = habits.map(h =>
      h.id === updatedHabit.id ? updatedHabit : h
    );
    setHabits(updatedHabits);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updatedHabits));
    // Re-sincronizar hábito actualizado al calendario
    removeHabitFromCalendar(updatedHabit.id);
    syncHabitToCalendar(updatedHabit);
    setEditingHabit(null);
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
    <div className="min-h-screen bg-[#FFF5F0] pb-24">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 lg:z-10">
        <div className="px-6 py-3 pt-safe">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Mis Hábitos</h1>
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

      <div className="px-6 space-y-3 pb-4">
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

      <div className="fixed bottom-24 left-0 right-0 px-6 z-10">
        <button
          onClick={() => router.push('/app/biblioteca')}
          className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Hábito
        </button>
      </div>

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

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onSave={saveEditedHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  );
}

function HabitCard({ habit, onToggleComplete, onPause, onEdit, onDelete, streak, consistency }: any) {
  const x = useMotionValue(0);
  const [swipeState, setSwipeState] = useState<'closed' | 'edit' | 'actions'>('closed');

  const handleDragEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Detección por velocidad (swipe fuerte)
    if (Math.abs(velocity) > 500) {
      if (velocity > 0 && swipeState === 'closed') {
        setSwipeState('edit');
        x.set(100);
      } else if (velocity < 0 && swipeState === 'closed') {
        setSwipeState('actions');
        x.set(-160);
      } else {
        setSwipeState('closed');
        x.set(0);
      }
      return;
    }

    // Detección por offset (swipe lento pero definitivo)
    if (offset > 50 && swipeState === 'closed') {
      setSwipeState('edit');
      x.set(100);
    } else if (offset < -50 && swipeState === 'closed') {
      setSwipeState('actions');
      x.set(-160);
    } else {
      // Volver al centro si no hay suficiente swipe
      setSwipeState('closed');
      x.set(0);
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
      {swipeState === 'edit' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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

      {swipeState === 'actions' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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

      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 100 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        className={`relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm ${
          isPaused ? 'opacity-60' : ''
        }`}
      >
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
              isCompleted
                ? 'shadow-md'
                : 'bg-[#FFF5F0] hover:bg-[#FFE5D9]'
            }`}
            style={{
              backgroundColor: isCompleted ? habit.color : undefined
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

function AlertModal({ message, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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

function ConfirmModal({ message, confirmText, onConfirm, onCancel }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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

function EditHabitModal({ habit, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: habit.name || '',
    type: habit.type || 'formar',
    frequency: habit.frequency || 'diario',
    color: habit.color || '#6B9B9E',
    icon: habit.icon || 'Heart',
    description: habit.description || '',
    goal: habit.goal || '',
    startTime: habit.startTime || '09:00',
    endTime: habit.endTime || '17:00'
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Ingresa el nombre del hábito');
      return;
    }
    onSave({
      ...habit,
      ...formData
    });
  };

  const COLORES = [
    '#FFD166', '#FF99AC', '#FFC0A9', '#9C6B98',
    '#6B9B9E', '#6B8BB6', '#E8A598', '#C9A0A0',
    '#A8D8EA', '#FFB4A8', '#B8E6B8', '#D4A5A5'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-[#A67B6B] font-medium">
            Cancelar
          </button>
          <h2 className="text-lg font-bold text-[#3D2C28]">Editar hábito</h2>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#FF99AC] text-white rounded-full text-sm font-semibold"
          >
            Guardar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] focus:outline-none focus:ring-2 focus:ring-[#FF99AC]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Tipo</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: 'formar' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  formData.type === 'formar' ? 'bg-[#FF99AC] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                }`}
              >
                A Formar
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'dejar' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  formData.type === 'dejar' ? 'bg-[#FF99AC] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                }`}
              >
                A Dejar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Frecuencia</label>
            <div className="grid grid-cols-3 gap-2">
              {['diario', 'semanal', 'mensual'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFormData({ ...formData, frequency: freq })}
                  className={`py-3 rounded-xl font-medium text-sm transition-colors ${
                    formData.frequency === freq ? 'bg-[#FF99AC] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  {freq === 'diario' ? 'Diario' : freq === 'semanal' ? 'Semanal' : 'Mensual'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Horario</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-[#A67B6B] mb-1 block">Inicio</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] text-[#3D2C28] focus:outline-none focus:ring-2 focus:ring-[#FF99AC]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#A67B6B] mb-1 block">Fin</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] text-[#3D2C28] focus:outline-none focus:ring-2 focus:ring-[#FF99AC]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Color</label>
            <div className="grid grid-cols-6 gap-3">
              {COLORES.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className="w-full aspect-square rounded-full transition-transform"
                  style={{
                    backgroundColor: color,
                    transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: formData.color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Descripción (Opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] focus:outline-none focus:ring-2 focus:ring-[#FF99AC] resize-none"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
