'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const habitTemplates = [
  // FÍSICA
  { id: '1', name: 'Correr por la mañana', desc: 'Energiza tu día desde el inicio', category: 'fisica', icon: 'directions_run', type: 'formar' },
  { id: '2', name: 'Beber 2L de agua', desc: 'Mantén tu cuerpo hidratado', category: 'fisica', icon: 'water_drop', type: 'formar' },
  { id: '3', name: 'Hacer ejercicio 30 min', desc: 'Mantén tu cuerpo activo', category: 'fisica', icon: 'fitness_center', type: 'formar' },
  { id: '4', name: 'Estirar 10 minutos', desc: 'Mejora tu flexibilidad', category: 'fisica', icon: 'self_improvement', type: 'formar' },
  { id: '5', name: 'Caminar 10,000 pasos', desc: 'Muévete durante el día', category: 'fisica', icon: 'directions_walk', type: 'formar' },

  // MENTAL
  { id: '6', name: 'Meditar 10 min', desc: 'Calma tu mente', category: 'mental', icon: 'spa', type: 'formar' },
  { id: '7', name: 'Leer un capítulo', desc: 'Expande tu conocimiento', category: 'mental', icon: 'menu_book', type: 'formar' },
  { id: '8', name: 'Practicar gratitud', desc: 'Aprecia lo que tienes', category: 'mental', icon: 'favorite', type: 'formar' },
  { id: '9', name: 'Aprender algo nuevo', desc: 'Nunca dejes de crecer', category: 'mental', icon: 'school', type: 'formar' },

  // CREATIVIDAD
  { id: '10', name: 'Escribir 500 palabras', desc: 'Desarrolla tu creatividad', category: 'creatividad', icon: 'edit_note', type: 'formar' },
  { id: '11', name: 'Dibujar 15 minutos', desc: 'Expresa tu arte', category: 'creatividad', icon: 'brush', type: 'formar' },
  { id: '12', name: 'Tocar un instrumento', desc: 'Practica música', category: 'creatividad', icon: 'music_note', type: 'formar' },
  { id: '13', name: 'Hacer fotografía', desc: 'Captura momentos', category: 'creatividad', icon: 'photo_camera', type: 'formar' },

  // BIENESTAR
  { id: '14', name: 'Dormir 8 horas', desc: 'Descansa bien', category: 'bienestar', icon: 'hotel', type: 'formar' },
  { id: '15', name: 'Desayunar saludable', desc: 'Comienza bien el día', category: 'bienestar', icon: 'restaurant', type: 'formar' },
  { id: '16', name: 'Desconectar 1 hora', desc: 'Tiempo sin pantallas', category: 'bienestar', icon: 'phonelink_off', type: 'formar' },
  { id: '17', name: 'Tomar el sol 15 min', desc: 'Vitamina D natural', category: 'bienestar', icon: 'wb_sunny', type: 'formar' },

  // SOCIAL
  { id: '18', name: 'Llamar a familia', desc: 'Mantén tus conexiones', category: 'social', icon: 'call', type: 'formar' },
  { id: '19', name: 'Mensaje a un amigo', desc: 'Cultiva amistades', category: 'social', icon: 'chat', type: 'formar' },
  { id: '20', name: 'Tiempo en pareja', desc: 'Fortalece tu relación', category: 'social', icon: 'favorite', type: 'formar' },

  // DEJAR
  { id: '21', name: 'No fumar', desc: 'Mejora tu salud', category: 'fisica', icon: 'smoke_free', type: 'dejar' },
  { id: '22', name: 'Sin redes antes de dormir', desc: 'Mejor descanso', category: 'bienestar', icon: 'bedtime', type: 'dejar' },
  { id: '23', name: 'Evitar comida chatarra', desc: 'Alimentación saludable', category: 'fisica', icon: 'no_meals', type: 'dejar' },
  { id: '24', name: 'No postergar tareas', desc: 'Más productividad', category: 'mental', icon: 'schedule', type: 'dejar' },
  { id: '25', name: 'Reducir cafeína', desc: 'Mejor sueño', category: 'bienestar', icon: 'no_drinks', type: 'dejar' },
];

const categories = [
  { id: 'fisica', name: 'Física', icon: 'fitness_center' },
  { id: 'mental', name: 'Mental', icon: 'psychology' },
  { id: 'creatividad', name: 'Creatividad', icon: 'palette' },
  { id: 'bienestar', name: 'Bienestar', icon: 'favorite' },
  { id: 'social', name: 'Social', icon: 'people' },
];

export default function BibliotecaPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'formar' | 'dejar'>('formar');
  const [expandedCategory, setExpandedCategory] = useState<string>('fisica');

  const addHabitFromTemplate = (template: any) => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');

    const newHabit = {
      id: `habit_${Date.now()}`,
      name: template.name,
      category: template.category,
      icon: template.icon,
      duration: 30,
      frequency: 'diario',
      type: template.type,
      status: 'active',
      createdAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    };

    habits.push(newHabit);
    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));

    alert(`✓ Hábito "${template.name}" agregado!`);
    router.push('/mis-habitos');
  };

  const filteredTemplates = habitTemplates.filter(t => t.type === filter);
  const groupedByCategory = categories.map(cat => ({
    ...cat,
    habits: filteredTemplates.filter(h => h.category === cat.id)
  })).filter(cat => cat.habits.length > 0);

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-32 bg-[#FFF5F0]">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60" />
      </div>

      {/* Header sticky */}
      <header className="sticky top-0 z-20 p-4 pt-16 glass-stitch">
        <div className="text-center max-w-sm mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-[#3D2C28]">
            Elige tu próximo hábito
          </h1>
          <p className="mt-2 text-[#A67B6B]">Explora por categoría o crea uno propio.</p>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 pb-32">
        {/* Tabs */}
        <div className="p-1.5 glass-stitch rounded-full flex justify-center items-center w-full max-w-sm mx-auto mb-6">
          <button
            onClick={() => setFilter('formar')}
            className={`flex-1 text-center py-2.5 px-4 rounded-full font-semibold text-sm transition-all ${
              filter === 'formar' ? 'bg-white/70 text-[#3D2C28] shadow' : 'text-[#A67B6B]'
            }`}
          >
            Formar Hábito
          </button>
          <button
            onClick={() => setFilter('dejar')}
            className={`flex-1 text-center py-2.5 px-4 rounded-full font-medium text-sm transition-all ${
              filter === 'dejar' ? 'bg-white/70 text-[#3D2C28] shadow' : 'text-[#A67B6B]'
            }`}
          >
            Dejar
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4 w-full max-w-sm mx-auto">
          {groupedByCategory.map((category, index) => {
            const isExpanded = expandedCategory === category.id;

            return (
              <motion.details
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-stitch rounded-xl overflow-hidden"
                open={isExpanded}
              >
                <summary
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedCategory(isExpanded ? '' : category.id);
                  }}
                  className="flex items-center justify-between p-4 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-[#3D2C28]">{category.name}</h3>
                  <span className={`material-symbols-outlined transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </summary>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {category.habits.map((habit) => (
                      <div
                        key={habit.id}
                        className="glass-stitch rounded-lg p-3 flex items-center space-x-4"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#FFC0A9]/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#3D2C28]">{habit.icon}</span>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-[#3D2C28]">{habit.name}</h4>
                          <p className="text-xs text-[#A67B6B]">{habit.desc}</p>
                        </div>
                        <button
                          onClick={() => addHabitFromTemplate(habit)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF8C66]/20 text-[#FF8C66] transition-transform hover:scale-110 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-2xl">add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.details>
            );
          })}
        </div>

        {/* Crear hábito personalizado */}
        <div className="mt-8 w-full max-w-sm mx-auto">
          <button
            onClick={() => router.push('/crear-habito')}
            className="w-full text-center py-3.5 px-5 rounded-xl bg-gradient-to-br from-[#FF8C66] to-[#FF99AC] text-white font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Crear hábito personalizado
          </button>
        </div>
      </main>
    </div>
  );
}
