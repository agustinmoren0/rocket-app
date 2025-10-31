// ═══════════════════════════════════════════════════════════════════
// app/actividades/page.tsx - REDISEÑO COMPLETO
// ═══════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import { LUCIDE_ICONS } from '../utils/icons';

const CATEGORIAS = [
  { id: 'bienestar', name: 'Bienestar', icon: 'Heart', color: '#6B9B9E' },
  { id: 'trabajo', name: 'Trabajo', icon: 'Briefcase', color: '#FFD166' },
  { id: 'creatividad', name: 'Creatividad', icon: 'Palette', color: '#FF99AC' },
  { id: 'social', name: 'Social', icon: 'Users', color: '#9C6B98' },
  { id: 'aprendizaje', name: 'Aprendizaje', icon: 'Book', color: '#6B8BB6' },
  { id: 'otro', name: 'Otro', icon: 'Circle', color: '#C9A0A0' },
];

export default function ActividadesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  useEffect(() => {
    loadTodayActivities();
    checkMidnight();
  }, []);

  const loadTodayActivities = () => {
    const today = new Date().toISOString().split('T')[0];
    const allActivities = JSON.parse(localStorage.getItem('habika_activities') || '{}');
    setActivities(allActivities[today] || []);
  };

  const checkMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      archiveTodayActivities();
      loadTodayActivities();
      checkMidnight();
    }, timeUntilMidnight);
  };

  const archiveTodayActivities = () => {
    const today = new Date().toISOString().split('T')[0];
    const allActivities = JSON.parse(localStorage.getItem('habika_activities') || '{}');

    if (allActivities[today] && allActivities[today].length > 0) {
      const archived = JSON.parse(localStorage.getItem('habika_activities_archive') || '{}');
      archived[today] = allActivities[today];
      localStorage.setItem('habika_activities_archive', JSON.stringify(archived));

      delete allActivities[today];
      localStorage.setItem('habika_activities', JSON.stringify(allActivities));
    }
  };

  const saveActivity = (activity: any) => {
    const today = new Date().toISOString().split('T')[0];
    const allActivities = JSON.parse(localStorage.getItem('habika_activities') || '{}');
    const todayActivities = allActivities[today] || [];

    if (editingActivity) {
      const index = todayActivities.findIndex((a: any) => a.id === editingActivity.id);
      if (index !== -1) {
        todayActivities[index] = activity;
      }
    } else {
      todayActivities.push({
        ...activity,
        id: `activity_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }

    allActivities[today] = todayActivities;
    localStorage.setItem('habika_activities', JSON.stringify(allActivities));
    loadTodayActivities();
    setShowModal(false);
    setEditingActivity(null);
  };

  const deleteActivity = (activityId: string) => {
    if (confirm('¿Eliminar esta actividad?')) {
      const today = new Date().toISOString().split('T')[0];
      const allActivities = JSON.parse(localStorage.getItem('habika_activities') || '{}');
      const todayActivities = (allActivities[today] || []).filter((a: any) => a.id !== activityId);

      allActivities[today] = todayActivities;
      localStorage.setItem('habika_activities', JSON.stringify(allActivities));
      loadTodayActivities();
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
    <div className="min-h-screen bg-[#FFF5F0] pb-32 pt-0">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Actividades</h1>
          <p className="text-sm text-[#A67B6B] mt-1">
            {activities.length === 0
              ? 'Comienza registrando tus momentos de hoy.'
              : `${formatTime(getTotalMinutes())} en actividades`}
          </p>
        </div>
      </header>

      {/* Lista de actividades */}
      <div className="px-6 py-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#FFC0A9]/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#FF99AC]" />
            </div>
            <p className="text-[#A67B6B] mb-2">Tu día está vacío</p>
            <p className="text-sm text-[#A67B6B]">Registra tu primera actividad</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={() => {
                setEditingActivity(activity);
                setShowModal(true);
              }}
              onDelete={() => deleteActivity(activity.id)}
            />
          ))
        )}
      </div>

      {/* Botón registrar */}
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

      {/* Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY CARD
// ═══════════════════════════════════════════════════════════════════

function ActivityCard({ activity, onEdit, onDelete }: any) {
  const categoria = CATEGORIAS.find(c => c.id === activity.categoria);
  const Icon = categoria ? LUCIDE_ICONS[categoria.icon] : LUCIDE_ICONS['Circle'];
  const time = new Date(activity.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: categoria?.color || '#C9A0A0' }}
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
              backgroundColor: `${categoria?.color}20`,
              color: categoria?.color,
            }}
          >
            {categoria?.name}
          </span>
          {activity.notes && (
            <p className="text-xs text-[#A67B6B] mt-2 italic">"{activity.notes}"</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-[#FFF5F0] flex items-center justify-center hover:bg-[#FFE5D9] transition-colors"
          >
            <Edit2 className="w-4 h-4 text-[#A67B6B]" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-[#FFF5F0] flex items-center justify-center hover:bg-[#FFE5D9] transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#A67B6B]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL REGISTRAR ACTIVIDAD
// ═══════════════════════════════════════════════════════════════════

function ActivityModal({ activity, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    duration: activity?.duration || 30,
    unit: activity?.unit || 'min',
    categoria: activity?.categoria || 'bienestar',
    notes: activity?.notes || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Ingresa el nombre de la actividad');
      return;
    }
    onSave(activity ? { ...activity, ...formData } : formData);
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
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto pb-28 p-6 space-y-6">
          {/* Actividad */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">
              Actividad
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Caminar en el parque"
              className="w-full px-4 py-3 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] placeholder:text-[#A67B6B] focus:outline-none focus:ring-2 focus:ring-[#FF99AC]"
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">
              Duración
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
                }
                className="w-24 px-4 py-3 rounded-xl bg-[#FFF5F0] text-center font-semibold text-[#3D2C28] border-2 border-[#FF99AC] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, unit: 'min' })}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    formData.unit === 'min'
                      ? 'bg-[#FF99AC] text-white'
                      : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Minutos
                </button>
                <button
                  onClick={() => setFormData({ ...formData, unit: 'hora(s)' })}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    formData.unit === 'hora(s)'
                      ? 'bg-[#FF99AC] text-white'
                      : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Horas
                </button>
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-3">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((cat) => {
                const Icon = LUCIDE_ICONS[cat.icon];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, categoria: cat.id })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.categoria === cat.id ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      backgroundColor:
                        formData.categoria === cat.id ? cat.color : '#FFF5F0',
                      ringColor: cat.color,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color:
                          formData.categoria === cat.id ? 'white' : cat.color,
                      }}
                    />
                    <span
                      className={`text-xs font-medium ${
                        formData.categoria === cat.id
                          ? 'text-white'
                          : 'text-[#3D2C28]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-[#3D2C28] mb-2">
              Notas (Opcional)
            </label>
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
