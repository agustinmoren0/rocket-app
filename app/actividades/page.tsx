'use client'

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { Plus, Clock, Edit2, Trash2, Sparkles } from 'lucide-react';
import { LUCIDE_ICONS } from '../utils/icons';

const CATEGORIAS = [
  { id: 'bienestar', name: 'Bienestar', icon: 'Heart' },
  { id: 'trabajo', name: 'Trabajo', icon: 'Briefcase' },
  { id: 'creatividad', name: 'Creatividad', icon: 'Palette' },
  { id: 'social', name: 'Social', icon: 'Users' },
  { id: 'aprendizaje', name: 'Aprendizaje', icon: 'Book' },
  { id: 'deporte', name: 'Deporte', icon: 'Dumbbell' },
  { id: 'hogar', name: 'Hogar', icon: 'Home' },
  { id: 'otro', name: 'Otro', icon: 'Circle' },
];

const COLORES = [
  '#FFD166', '#FF99AC', '#FFC0A9', '#9C6B98',
  '#6B9B9E', '#6B8BB6', '#E8A598', '#C9A0A0',
  '#A8D8EA', '#FFB4A8', '#B8E6B8', '#D4A5A5'
];

// Componente que usa useSearchParams (dentro de Suspense)
function ModalOpener({ setShowModal }: any) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('open') === 'true') {
      setShowModal(true);
      window.history.replaceState({}, '', '/actividades');
    }
  }, [searchParams, setShowModal]);

  return null;
}

export default function ActividadesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  // Cargar actividades y hábitos, y configurar listeners
  useEffect(() => {
    loadTodayActivities();
    loadTodayHabits();
    setupMidnightArchive();

    // Listener para cambios en storage (otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'habika_activities_today') {
        loadTodayActivities();
      }
      if (e.key === 'habika_custom_habits') {
        loadTodayHabits();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadTodayActivities = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = JSON.parse(
        localStorage.getItem(`habika_activities_today_${today}`) || '[]'
      );

      console.log('📅 Actividades de hoy:', todayActivities.length);

      const sorted = todayActivities.sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(sorted);
    } catch (error) {
      console.error('❌ Error al cargar:', error);
      setActivities([]);
    }
  };

  const loadTodayHabits = () => {
    try {
      const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
      const today = new Date().toISOString().split('T')[0];

      // Filtrar hábitos activos que tengan horario dentro del rango actual
      const todayHabits = allHabits.filter((habit: any) => {
        if (habit.status !== 'active') return false;

        // Si no tiene horario definido, mostrarlo
        if (!habit.startTime || !habit.endTime) return true;

        // Si tiene horario, verificar que sea hoy
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        const startTime = habit.startTime;
        const endTime = habit.endTime;

        return currentTime >= startTime && currentTime <= endTime;
      });

      console.log('🔥 Hábitos de hoy:', todayHabits.length);
      setHabits(todayHabits);
    } catch (error) {
      console.error('❌ Error al cargar hábitos:', error);
      setHabits([]);
    }
  };

  const toggleHabitComplete = (habitId: string) => {
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

    // Actualizar en todas las fuentes
    const allHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const updated = allHabits.map((h: any) =>
      updatedHabits.find((uh: any) => uh.id === h.id) || h
    );

    localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
    setHabits(updatedHabits);

    // Disparar evento para otras pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'habika_custom_habits',
      newValue: JSON.stringify(updated)
    }));
  };

  const setupMidnightArchive = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    console.log(
      `⏰ Próximo archivo a medianoche en ${Math.round(timeUntilMidnight / 1000 / 60)} minutos`
    );

    setTimeout(() => {
      archiveToCalendar();
      setupMidnightArchive();
    }, timeUntilMidnight);
  };

  const archiveToCalendar = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = JSON.parse(
        localStorage.getItem(`habika_activities_today_${today}`) || '[]'
      );

      if (todayActivities.length > 0) {
        // Guardar en calendario con estructura correcta
        const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

        if (!calendar[today]) {
          calendar[today] = { activities: [], habits: [], notes: '' };
        }

        calendar[today].activities = todayActivities.map((act: any) => ({
          id: act.id,
          name: act.name,
          duration: act.duration,
          unit: act.unit,
          categoria: act.categoria,
          color: act.color,
          notes: act.notes || '',
          timestamp: act.timestamp,
          type: 'activity'
        }));

        localStorage.setItem('habika_calendar', JSON.stringify(calendar));

        // Limpiar actividades del día
        localStorage.removeItem(`habika_activities_today_${today}`);

        console.log('📚 Actividades archivadas en calendario');
      }

      loadTodayActivities();
    } catch (error) {
      console.error('❌ Error al archivar:', error);
    }
  };

  const saveActivity = (activityData: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = JSON.parse(
        localStorage.getItem(`habika_activities_today_${today}`) || '[]'
      );

      if (editingActivity) {
        // EDITAR actividad existente
        const index = todayActivities.findIndex((a: any) => a.id === editingActivity.id);
        if (index !== -1) {
          todayActivities[index] = {
            ...activityData,
            id: editingActivity.id,
            timestamp: editingActivity.timestamp
          };
          console.log('✏️ Actividad editada');
        }
      } else {
        // CREAR nueva actividad
        const newActivity = {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          ...activityData
        };
        todayActivities.push(newActivity);
        console.log('✅ Nueva actividad creada');
      }

      // GUARDAR en localStorage (actividaddes del día)
      localStorage.setItem(`habika_activities_today_${today}`, JSON.stringify(todayActivities));

      // GUARDAR en calendario también (para visualización)
      const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

      if (!calendar[today]) {
        calendar[today] = { activities: [], habits: [], notes: '' };
      }

      calendar[today].activities = todayActivities.map((act: any) => ({
        id: act.id,
        name: act.name,
        duration: act.duration,
        unit: act.unit,
        categoria: act.categoria,
        color: act.color,
        notes: act.notes || '',
        timestamp: act.timestamp,
        type: 'activity'
      }));

      localStorage.setItem('habika_calendar', JSON.stringify(calendar));

      console.log('💾 Guardado en actividades y calendario');

      // Actualizar estado
      const sorted = todayActivities.sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setActivities([...sorted]);

      setShowModal(false);
      setEditingActivity(null);

      // Disparar evento para otras pestañas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'habika_activities_today',
        newValue: JSON.stringify(todayActivities)
      }));
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar. Intenta de nuevo.');
    }
  };

  const deleteActivity = (activityId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = JSON.parse(
        localStorage.getItem(`habika_activities_today_${today}`) || '[]'
      );

      const filtered = todayActivities.filter((a: any) => a.id !== activityId);

      localStorage.setItem(`habika_activities_today_${today}`, JSON.stringify(filtered));

      // Actualizar calendario con estructura correcta
      const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

      if (!calendar[today]) {
        calendar[today] = { activities: [], habits: [], notes: '' };
      }

      calendar[today].activities = filtered.map((act: any) => ({
        id: act.id,
        name: act.name,
        duration: act.duration,
        unit: act.unit,
        categoria: act.categoria,
        color: act.color,
        notes: act.notes || '',
        timestamp: act.timestamp,
        type: 'activity'
      }));

      localStorage.setItem('habika_calendar', JSON.stringify(calendar));

      setActivities([...filtered]);
      console.log('🗑️ Actividad eliminada');

      // Disparar evento
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'habika_activities_today',
        newValue: JSON.stringify(filtered)
      }));
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
    }
  };

  const getTotalMinutes = () => {
    return activities.reduce((total, activity) => {
      const minutes = activity.unit === 'hora(s)' ? activity.duration * 60 : activity.duration;
      return total + minutes;
    }, 0);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  return (
    <>
      {/* Modal opener con Suspense para useSearchParams */}
      <Suspense fallback={null}>
        <ModalOpener setShowModal={setShowModal} />
      </Suspense>

      <div className="min-h-screen bg-[#FFF5F0] pb-32 pt-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-[#3D2C28]">Actividades</h1>
            <p className="text-sm text-[#A67B6B] mt-1">
              {activities.length === 0
                ? 'Tu bitácora diaria te espera'
                : `${formatTime(getTotalMinutes())} registrados hoy`}
            </p>
          </div>
        </header>

        <div className="px-6 py-4 space-y-3">
          {/* Sección de Hábitos */}
          {habits.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#3D2C28] mb-3 px-2">Hábitos de hoy</h2>
              <div className="space-y-2">
                {habits.map((habit) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCompleted = habit.completedDates?.includes(today);
                  const Icon = LUCIDE_ICONS[habit.icon] || LUCIDE_ICONS['Star'];

                  return (
                    <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: habit.color }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#3D2C28] mb-1">{habit.name}</h3>
                        <p className="text-xs text-[#A67B6B]">
                          {habit.startTime && habit.endTime ? `${habit.startTime} - ${habit.endTime}` : 'Flexible'}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleHabitComplete(habit.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCompleted ? 'shadow-md' : 'bg-[#FFF5F0] hover:bg-[#FFE5D9]'
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección de Actividades */}
          {activities.length === 0 && habits.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#3D2C28] mb-2">
                Comienza tu día
              </h3>
              <p className="text-[#A67B6B] mb-1 max-w-xs mx-auto">
                Registra cada momento importante: trabajo, deporte, creatividad, descanso...
              </p>
              <p className="text-sm text-[#A67B6B] mb-6">
                Al final del día, todo se guarda automáticamente en tu calendario. Mañana empiezas con una página en blanco.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white rounded-full font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                Registrar primera actividad
              </button>
            </div>
          ) : activities.length > 0 ? (
            <div>
              {habits.length > 0 && (
                <h2 className="text-sm font-bold text-[#3D2C28] mb-3 px-2">Actividades</h2>
              )}
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={() => {
                      setEditingActivity(activity);
                      setShowModal(true);
                    }}
                    onDelete={() => deleteActivity(activity.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {activities.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 px-6 z-10">
            <button
              onClick={() => {
                setEditingActivity(null);
                setShowModal(true);
              }}
              className="w-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white py-4 rounded-full font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Registrar Actividad
            </button>
          </div>
        )}

        {showModal && (
          <ActivityModal
            activity={editingActivity}
            onSave={saveActivity}
            onClose={() => {
              setShowModal(false);
              setEditingActivity(null);
            }}
          />
        )}
      </div>
    </>
  );
}

function ActivityCard({ activity, onEdit, onDelete }: any) {
  const x = useMotionValue(0);
  const [swipeState, setSwipeState] = useState<'closed' | 'edit' | 'delete'>('closed');

  const handleDragEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Detección por velocidad (swipe fuerte)
    if (Math.abs(velocity) > 500) {
      if (velocity > 0 && swipeState === 'closed') {
        setSwipeState('edit');
        x.set(100, { duration: 0.2 });
      } else if (velocity < 0 && swipeState === 'closed') {
        setSwipeState('delete');
        x.set(-100, { duration: 0.2 });
      } else {
        setSwipeState('closed');
        x.set(0, { duration: 0.2 });
      }
      return;
    }

    // Detección por offset (swipe lento pero definitivo)
    if (offset > 50 && swipeState === 'closed') {
      setSwipeState('edit');
      x.set(100, { duration: 0.2 });
    } else if (offset < -50 && swipeState === 'closed') {
      setSwipeState('delete');
      x.set(-100, { duration: 0.2 });
    } else {
      // Volver al centro si no hay suficiente swipe
      setSwipeState('closed');
      x.set(0, { duration: 0.2 });
    }
  };

  const closeSwipe = () => {
    setSwipeState('closed');
    // Usar animate en lugar de set para una transición suave
    x.set(0, { duration: 0.2 });
  };

  const categoria = CATEGORIAS.find(c => c.id === activity.categoria);
  const Icon = categoria ? LUCIDE_ICONS[categoria.icon] : LUCIDE_ICONS['Circle'];
  const time = new Date(activity.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Botón EDITAR (izquierda) */}
      {swipeState === 'edit' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-0"
        >
          <button
            onClick={() => {
              onEdit();
              closeSwipe();
            }}
            className="w-20 h-16 rounded-2xl bg-[#6B9B9E] flex flex-col items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Edit2 className="w-5 h-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">Editar</span>
          </button>
        </motion.div>
      )}

      {/* Botón ELIMINAR (derecha) */}
      {swipeState === 'delete' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-0 top-0 bottom-0 flex items-center pr-4 z-0"
        >
          <button
            onClick={() => {
              if (confirm('¿Eliminar esta actividad?')) {
                onDelete();
              }
              closeSwipe();
            }}
            className="w-20 h-16 rounded-2xl bg-[#FF6B6B] flex flex-col items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Trash2 className="w-5 h-5 text-white mb-1" />
            <span className="text-xs text-white font-medium">Eliminar</span>
          </button>
        </motion.div>
      )}

      {/* Card principal */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-white rounded-2xl p-4 shadow-sm cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: activity.color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#3D2C28] mb-1">{activity.name}</h3>
            <div className="flex items-center gap-3 text-xs text-[#A67B6B] mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.duration} {activity.unit}
              </span>
              <span>• {time}</span>
            </div>
            <span
              className="inline-block px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: `${activity.color}20`,
                color: activity.color
              }}
            >
              {categoria?.name}
            </span>
            {activity.notes && (
              <p className="text-xs text-[#A67B6B] mt-2 italic">"{activity.notes}"</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ActivityModal({ activity, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    duration: activity?.duration || 30,
    unit: activity?.unit || 'min',
    categoria: activity?.categoria || 'bienestar',
    color: activity?.color || '#6B9B9E',
    notes: activity?.notes || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Ingresa el nombre de la actividad');
      return;
    }
    onSave(formData);
  };

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
          <h2 className="text-lg font-bold text-[#3D2C28]">
            {activity ? 'Editar actividad' : 'Nueva actividad'}
          </h2>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#FF99AC] text-white rounded-full text-sm font-semibold"
          >
            Guardar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Actividad</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Caminar en el parque"
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] placeholder:text-[#A67B6B] focus:outline-none focus:ring-2 focus:ring-[#FF99AC]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Duración</label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                className="w-24 px-4 py-3 rounded-xl bg-[#FFF5F0] text-center font-semibold text-[#3D2C28] border-2 border-[#FF99AC] focus:outline-none"
              />
              <div className="flex gap-2 flex-1">
                <button
                  onClick={() => setFormData({ ...formData, unit: 'min' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.unit === 'min' ? 'bg-[#FF99AC] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Min
                </button>
                <button
                  onClick={() => setFormData({ ...formData, unit: 'hora(s)' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.unit === 'hora(s)' ? 'bg-[#FF99AC] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Horas
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Categoría</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIAS.map((cat) => {
                const Icon = LUCIDE_ICONS[cat.icon];
                const isSelected = formData.categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, categoria: cat.id })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      isSelected ? 'bg-[#FF99AC] text-white shadow-md' : 'bg-[#FFF5F0] text-[#A67B6B]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">Color</label>
            <div className="grid grid-cols-6 gap-3">
              {COLORES.map((color) => {
                const isSelected = formData.color === color;
                return (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className="w-full aspect-square rounded-full transition-transform"
                    style={{
                      backgroundColor: color,
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none'
                    }}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">Notas (Opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agrega detalles sobre esta actividad..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] placeholder:text-[#A67B6B] focus:outline-none focus:ring-2 focus:ring-[#FF99AC] resize-none"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
