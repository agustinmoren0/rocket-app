'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CrearHabitoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'formar' as 'formar' | 'dejar',
    frequency: 'diario' as 'diario' | 'semanal',
    daysOfWeek: [] as number[],
    duration: 30,
    reminderTime: '',
  });

  const [selectedIcon, setSelectedIcon] = useState('star');

  const icons = [
    'star', 'favorite', 'local_fire_department', 'bolt', 'psychology',
    'self_improvement', 'fitness_center', 'restaurant', 'menu_book',
    'brush', 'music_note', 'photo_camera', 'chat', 'call'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const toggleDay = (day: number) => {
    if (formData.daysOfWeek.includes(day)) {
      setFormData({
        ...formData,
        daysOfWeek: formData.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        daysOfWeek: [...formData.daysOfWeek, day].sort()
      });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Por favor ingresa un nombre para el hábito');
      return;
    }

    if (formData.frequency === 'semanal' && formData.daysOfWeek.length === 0) {
      alert('Por favor selecciona al menos un día');
      return;
    }

    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');

    const newHabit = {
      id: `habit_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      icon: selectedIcon,
      duration: formData.duration,
      frequency: formData.frequency,
      daysOfWeek: formData.frequency === 'semanal' ? formData.daysOfWeek : undefined,
      reminderTime: formData.reminderTime || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    };

    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));

    router.push('/habitos');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#FFF5F0]">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 pt-8 glass-stitch">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full glass-stitch flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[#3D2C28]">close</span>
        </button>
        <h1 className="text-xl font-bold text-[#3D2C28]">Nuevo hábito</h1>
        <button
          onClick={handleSave}
          className="w-12 h-12 rounded-full bg-[#FF8C66] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white">check</span>
        </button>
      </header>

      <main className="flex-grow p-4 space-y-4 pb-8">
        {/* Icono */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-stitch rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FFC0A9]/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-[#FF8C66]">{selectedIcon}</span>
            </div>
            <input
              type="text"
              placeholder="Nombre del hábito"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-grow bg-transparent text-[#3D2C28] font-semibold text-lg outline-none placeholder:text-[#A67B6B]"
            />
          </div>

          {/* Selector de iconos */}
          <div className="mt-4 grid grid-cols-7 gap-2">
            {icons.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  selectedIcon === icon
                    ? 'bg-[#FF8C66] scale-110'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${
                  selectedIcon === icon ? 'text-white' : 'text-[#A67B6B]'
                }`}>
                  {icon}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-stitch rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#FF8C66]">category</span>
            <span className="text-[#A67B6B] text-sm font-medium">TIPO</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFormData({ ...formData, type: 'formar' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                formData.type === 'formar'
                  ? 'bg-[#FF8C66] text-white'
                  : 'bg-white/50 text-[#A67B6B]'
              }`}
            >
              ✨ A Formar
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'dejar' })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                formData.type === 'dejar'
                  ? 'bg-[#FF8C66] text-white'
                  : 'bg-white/50 text-[#A67B6B]'
              }`}
            >
              🚫 A Dejar
            </button>
          </div>
        </motion.div>

        {/* Frecuencia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-stitch rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#FF8C66]">repeat</span>
            <span className="text-[#A67B6B] text-sm font-medium">REPETIR</span>
          </div>
          <button
            onClick={() => setFormData({ ...formData, frequency: formData.frequency === 'diario' ? 'semanal' : 'diario' })}
            className="w-full flex items-center justify-between p-3 bg-white/50 rounded-xl"
          >
            <span className="text-[#3D2C28] font-medium">
              {formData.frequency === 'diario' ? 'Todos los días' : 'Días específicos'}
            </span>
            <span className="material-symbols-outlined text-[#A67B6B]">chevron_right</span>
          </button>

          {formData.frequency === 'semanal' && (
            <div className="mt-3 grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.daysOfWeek.includes(index)
                      ? 'bg-[#FF8C66] text-white'
                      : 'bg-white/50 text-[#A67B6B]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Duración */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-stitch rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#FF8C66]">schedule</span>
            <span className="text-[#A67B6B] text-sm font-medium">OBJETIVO</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
            <span className="text-[#3D2C28] font-medium">{formData.duration} min por día</span>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-32"
            />
          </div>
        </motion.div>

        {/* Recordatorio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-stitch rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#FF8C66]">notifications</span>
            <span className="text-[#A67B6B] text-sm font-medium">RECORDATORIO</span>
          </div>
          <div className="p-3 bg-white/50 rounded-xl text-center">
            <span className="text-[#A67B6B] text-sm">Próximamente</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
