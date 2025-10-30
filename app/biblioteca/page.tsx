'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, X, Check, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUCIDE_ICONS, ICON_LIST } from '../utils/icons';

const HABIT_LIBRARY = {
  formar: {
    fisica: {
      name: 'Física',
      icon: 'Dumbbell',
      habits: [
        { id: 'run', name: 'Correr por la mañana', description: 'Energiza tu día', icon: 'Dumbbell' },
        { id: 'water', name: 'Beber 2L de agua', description: 'Mantén hidratado', icon: 'Droplet' },
        { id: 'exercise', name: 'Hacer ejercicio', description: 'Mantén activo', icon: 'Activity' },
        { id: 'yoga', name: 'Práctica de yoga', description: 'Flexibilidad y paz', icon: 'Sprout' },
        { id: 'walk', name: 'Caminar 30 min', description: 'Movimiento diario', icon: 'Footprints' },
        { id: 'stretch', name: 'Estiramientos', description: 'Reduce tensión muscular', icon: 'Wind' },
      ]
    },
    mental: {
      name: 'Mental',
      icon: 'Brain',
      habits: [
        { id: 'meditate', name: 'Meditar', description: 'Calma tu mente', icon: 'Brain' },
        { id: 'read', name: 'Leer un capítulo', description: 'Expande conocimiento', icon: 'BookOpen' },
        { id: 'journal', name: 'Escribir en diario', description: 'Reflexión personal', icon: 'Pen' },
        { id: 'mindfulness', name: 'Mindfulness', description: 'Presencia en el momento', icon: 'Zap' },
        { id: 'learn', name: 'Aprender algo nuevo', description: 'Desarrollo continuo', icon: 'Lightbulb' },
      ]
    },
    creatividad: {
      name: 'Creatividad',
      icon: 'Palette',
      habits: [
        { id: 'draw', name: 'Dibujar', description: 'Expresión artística', icon: 'Palette' },
        { id: 'write', name: 'Escribir historias', description: 'Narrativa creativa', icon: 'PenTool' },
        { id: 'music', name: 'Tocar instrumento', description: 'Música y expresión', icon: 'Music' },
        { id: 'photo', name: 'Fotografía', description: 'Captura momentos', icon: 'Camera' },
        { id: 'craft', name: 'Manualidades', description: 'Crear con tus manos', icon: 'Hammer' },
        { id: 'poetry', name: 'Escribir poesía', description: 'Verso y ritmo', icon: 'Bookmark' },
      ]
    },
    bienestar: {
      name: 'Bienestar',
      icon: 'Heart',
      habits: [
        { id: 'sleep', name: '8 horas de sueño', description: 'Descanso reparador', icon: 'Moon' },
        { id: 'skincare', name: 'Rutina de cuidado', description: 'Cuida tu piel', icon: 'Sparkles' },
        { id: 'bath', name: 'Baño relajante', description: 'Momento de relax', icon: 'Droplets' },
        { id: 'massage', name: 'Auto-masaje', description: 'Relieve de tensión', icon: 'Hand' },
        { id: 'nature', name: 'Tiempo en naturaleza', description: 'Conexión verde', icon: 'Trees' },
        { id: 'gratitude', name: 'Lista de gratitud', description: 'Aprecia la vida', icon: 'Smile' },
      ]
    },
    social: {
      name: 'Social',
      icon: 'Users',
      habits: [
        { id: 'call', name: 'Llamar a un amigo', description: 'Mantén conexiones', icon: 'Phone' },
        { id: 'volunteer', name: 'Voluntariado', description: 'Ayuda a otros', icon: 'Heart' },
        { id: 'hobby_group', name: 'Club de hobbs', description: 'Comunidad y diversión', icon: 'Users' },
        { id: 'family_time', name: 'Tiempo familiar', description: 'Conexión cercana', icon: 'Users2' },
        { id: 'mentor', name: 'Mentoría', description: 'Comparte conocimiento', icon: 'Briefcase' },
        { id: 'dinner', name: 'Cena con amigos', description: 'Socializa', icon: 'UtensilsCrossed' },
      ]
    },
    productividad: {
      name: 'Productividad',
      icon: 'Zap',
      habits: [
        { id: 'goal_plan', name: 'Planificar metas', description: 'Establece objetivos', icon: 'Target' },
        { id: 'focus_work', name: 'Trabajo sin distracciones', description: 'Deep work', icon: 'Zap' },
        { id: 'organize', name: 'Organizar espacio', description: 'Limpieza y orden', icon: 'Inbox' },
        { id: 'admin', name: 'Tareas administrativas', description: 'Papelería al día', icon: 'FileText' },
        { id: 'budget', name: 'Revisar presupuesto', description: 'Control financiero', icon: 'DollarSign' },
        { id: 'plan_week', name: 'Planificar semana', description: 'Organización semanal', icon: 'Calendar' },
      ]
    },
  },
  dejar: {
    digital: {
      name: 'Digital',
      icon: 'Phone',
      habits: [
        { id: 'social_media', name: 'Reducir redes sociales', description: 'Usa tu tiempo mejor', icon: 'Phone' },
        { id: 'notifications', name: 'Desactivar notificaciones', description: 'Menos distracciones', icon: 'Phone' },
        { id: 'screen_time', name: 'Limitar tiempo de pantalla', description: 'Protege tus ojos', icon: 'Phone' },
      ]
    },
    alimentacion: {
      name: 'Alimentación',
      icon: 'Apple',
      habits: [
        { id: 'sugar', name: 'Reducir azúcar', description: 'Mejora tu salud', icon: 'Apple' },
        { id: 'junk_food', name: 'Evitar comida chatarra', description: 'Come más sano', icon: 'Pizza' },
        { id: 'soda', name: 'Dejar refrescos', description: 'Bebe más agua', icon: 'Wine' },
      ]
    },
    vicios: {
      name: 'Vicios',
      icon: 'Ban',
      habits: [
        { id: 'smoking', name: 'Dejar de fumar', description: 'Cuida tus pulmones', icon: 'Ban' },
        { id: 'alcohol', name: 'Reducir alcohol', description: 'Vive más sano', icon: 'Wine' },
        { id: 'caffeine', name: 'Menos cafeína', description: 'Duerme mejor', icon: 'Coffee' },
      ]
    },
    habitos_negativos: {
      name: 'Hábitos Negativos',
      icon: 'Circle',
      habits: [
        { id: 'procrastinate', name: 'Dejar de procrastinar', description: 'Actúa ahora', icon: 'Zap' },
        { id: 'complain', name: 'No quejarse', description: 'Sé más positivo', icon: 'Smile' },
        { id: 'compare', name: 'No compararse', description: 'Sé tú mismo', icon: 'Heart' },
      ]
    },
    consumo: {
      name: 'Consumo',
      icon: 'ShoppingBag',
      habits: [
        { id: 'impulse_buy', name: 'Compras impulsivas', description: 'Ahorra dinero', icon: 'ShoppingBag' },
        { id: 'fast_fashion', name: 'Moda rápida', description: 'Compra consciente', icon: 'ShoppingBag' },
        { id: 'plastic', name: 'Uso de plástico', description: 'Cuida el planeta', icon: 'ShoppingBag' },
      ]
    }
  }
};

const GOAL_UNITS = [
  { value: 'min', label: 'min' },
  { value: 'hora', label: 'hora(s)' },
  { value: 'litros', label: 'litros' },
  { value: 'ml', label: 'ml' },
  { value: 'km', label: 'km' },
  { value: 'millas', label: 'millas' },
  { value: 'pedazos', label: 'pedazo(s)' },
  { value: 'kg', label: 'kg' },
  { value: 'gramos', label: 'gramos' },
  { value: 'libras', label: 'libras' },
  { value: 'onzas', label: 'onzas' },
  { value: 'veces', label: 'veces' },
];

export default function BibliotecaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'formar' | 'dejar'>('formar');
  const [expandedCategory, setExpandedCategory] = useState<string>('fisica');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  const handleSelectHabit = (habit: any, type: 'formar' | 'dejar') => {
    setSelectedHabit({ ...habit, type });
    setShowCreateModal(true);
  };

  const currentLibrary = HABIT_LIBRARY[activeTab];

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-32">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-[#3D2C28]">Elige tu próximo hábito</h1>
          <p className="text-sm text-[#A67B6B] mt-1">Explora por categoría o crea uno propio.</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-4 flex gap-3">
        <button
          onClick={() => setActiveTab('formar')}
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            activeTab === 'formar' ? 'bg-[#FF8C66] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          Formar Hábito
        </button>
        <button
          onClick={() => setActiveTab('dejar')}
          className={`px-4 py-2 rounded-full font-medium text-sm ${
            activeTab === 'dejar' ? 'bg-[#FF8C66] text-white' : 'bg-white text-[#A67B6B]'
          }`}
        >
          Dejar
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-3 pb-6">
        {Object.entries(currentLibrary).map(([categoryId, category]) => {
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
                          onClick={() => handleSelectHabit(habit, activeTab)}
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
            setSelectedHabit({ type: activeTab });
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    icon: habit?.icon || 'Star',
    type: habit?.type || 'formar',
    goalValue: 30,
    goalUnit: 'min',
    frequency: 'diario',
    frequencyInterval: 1,
    selectedDays: [] as number[],
    selectedDates: [] as number[],
    timeStart: '09:00',
    timeEnd: '10:00',
    timeType: 'start',
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [unitScroll, setUnitScroll] = useState(0);

  const WEEKDAYS = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa un nombre para el hábito');
      return;
    }
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
        className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <button onClick={step > 1 ? () => setStep(step - 1) : onClose}>
            {step > 1 ? <ChevronLeft className="w-6 h-6 text-[#A67B6B]" /> : <X className="w-6 h-6 text-[#A67B6B]" />}
          </button>
          <h2 className="text-lg font-bold text-[#3D2C28]">
            {step === 1 ? 'Hábito personalizado' :
             step === 2 ? 'Meta' :
             step === 3 ? 'Repetición' : 'Hora'}
          </h2>
          <button onClick={step === 4 ? handleSave : () => {}}>
            {step === 4 && <Check className="w-6 h-6 text-[#FF8C66]" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-20 h-20 rounded-full bg-[#FFF5F0] flex items-center justify-center"
                >
                  <SelectedIcon className="w-10 h-10 text-[#FF8C66]" />
                </button>
              </div>

              {showIconPicker && (
                <div className="grid grid-cols-7 gap-2 p-3 bg-[#FFF5F0] rounded-xl max-h-48 overflow-y-auto">
                  {ICON_LIST.map((iconName) => {
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

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-4 rounded-xl bg-[#FFF5F0] border-none text-[#3D2C28] placeholder-[#A67B6B]"
                placeholder="Ponle un nombre a tu hábito"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setFormData({ ...formData, type: 'formar' })}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    formData.type === 'formar' ? 'bg-[#FF8C66] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  ✨ A Formar
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'dejar' })}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    formData.type === 'dejar' ? 'bg-[#FF8C66] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  🚫 A Dejar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex items-baseline justify-center gap-3">
                <input
                  type="number"
                  value={formData.goalValue}
                  onChange={(e) => setFormData({ ...formData, goalValue: parseInt(e.target.value) || 0 })}
                  className="w-24 text-5xl font-bold text-[#3D2C28] bg-[#FFF5F0] rounded-xl py-3 px-2 text-center outline-none border-2 border-transparent focus:border-[#FF8C66]"
                />
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => setShowUnitPicker(!showUnitPicker)}
                    className="text-[#FF8C66] font-bold text-lg px-4 py-2 rounded-lg bg-[#FFF5F0] hover:bg-[#FFE0D5] transition-colors"
                  >
                    {GOAL_UNITS.find(u => u.value === formData.goalUnit)?.label}
                  </button>
                  <p className="text-xs text-[#A67B6B] mt-1 px-4">por día</p>
                </div>
              </div>

              {showUnitPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-[#FFF5F0] rounded-2xl space-y-2"
                >
                  <p className="text-xs font-semibold text-[#A67B6B] uppercase mb-3">Selecciona unidad</p>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {GOAL_UNITS.map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => {
                          setFormData({ ...formData, goalUnit: unit.value });
                          setShowUnitPicker(false);
                        }}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                          formData.goalUnit === unit.value
                            ? 'bg-[#FF8C66] text-white scale-105'
                            : 'bg-white text-[#3D2C28] hover:bg-gray-50'
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="240"
                  value={formData.goalValue}
                  onChange={(e) => setFormData({ ...formData, goalValue: parseInt(e.target.value) })}
                  className="w-full h-3 bg-[#FFF5F0] rounded-lg appearance-none cursor-pointer accent-[#FF8C66]"
                />
                <div className="flex justify-between text-xs text-[#A67B6B]">
                  <span>1</span>
                  <span>240</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Repetition */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'diario', selectedDays: [], selectedDates: [] })}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm ${
                    formData.frequency === 'diario' ? 'bg-[#FF8C66] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  A diario
                </button>
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'semanal', selectedDays: [], selectedDates: [] })}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm ${
                    formData.frequency === 'semanal' ? 'bg-[#FF8C66] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setFormData({ ...formData, frequency: 'mensual', selectedDays: [], selectedDates: [] })}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm ${
                    formData.frequency === 'mensual' ? 'bg-[#FF8C66] text-white' : 'bg-[#FFF5F0] text-[#A67B6B]'
                  }`}
                >
                  Mensual
                </button>
              </div>

              {formData.frequency === 'diario' && (
                <div className="text-center py-8">
                  <p className="text-[#3D2C28] text-lg mb-4">Cada</p>
                  <input
                    type="number"
                    min="1"
                    value={formData.frequencyInterval}
                    onChange={(e) => setFormData({ ...formData, frequencyInterval: parseInt(e.target.value) })}
                    className="w-24 text-center text-4xl font-bold text-[#3D2C28] bg-[#FFF5F0] rounded-xl py-2"
                  />
                  <p className="text-[#A67B6B] text-lg mt-4">día{formData.frequencyInterval > 1 ? 's' : ''}</p>
                </div>
              )}

              {formData.frequency === 'semanal' && (
                <div>
                  <div className="text-center mb-4">
                    <p className="text-[#A67B6B] mb-2">Cada {formData.frequencyInterval} semana{formData.frequencyInterval > 1 ? 's' : ''}</p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedDays: prev.selectedDays.includes(index)
                              ? prev.selectedDays.filter(d => d !== index)
                              : [...prev.selectedDays, index]
                          }));
                        }}
                        className={`aspect-square rounded-full text-sm font-medium ${
                          formData.selectedDays.includes(index)
                            ? 'bg-[#FF8C66] text-white'
                            : 'bg-[#FFF5F0] text-[#A67B6B]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.frequency === 'mensual' && (
                <div>
                  <div className="text-center mb-4">
                    <p className="text-[#A67B6B]">Cada {formData.frequencyInterval} mes{formData.frequencyInterval > 1 ? 'es' : ''}</p>
                  </div>
                  <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedDates: prev.selectedDates.includes(date)
                              ? prev.selectedDates.filter(d => d !== date)
                              : [...prev.selectedDates, date]
                          }));
                        }}
                        className={`aspect-square rounded-full text-sm font-medium ${
                          formData.selectedDates.includes(date)
                            ? 'bg-[#FF8C66] text-white'
                            : 'bg-[#FFF5F0] text-[#A67B6B]'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#A67B6B] mt-3 text-center">
                    Si el día no existe en un mes, se omite
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Time */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-[#A67B6B] mb-4">Próximamente</p>
                <p className="text-sm text-[#3D2C28]">Recordatorios estarán disponibles en la próxima actualización</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 ? (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !formData.name}
              className="w-full bg-[#FF8C66] text-white py-4 rounded-full font-semibold disabled:opacity-50"
            >
              {step === 3 ? 'Continuar' : 'Aceptar'}
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleSave}
              className="w-full bg-[#FF8C66] text-white py-4 rounded-full font-semibold"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
