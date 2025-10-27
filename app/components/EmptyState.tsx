'use client'

import { motion } from 'framer-motion';
import { Plus, Heart, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'habits' | 'activities' | 'progress';
  onAction?: () => void;
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const content = {
    habits: {
      icon: <Sparkles size={48} className="text-purple-500" />,
      title: 'Tu viaje comienza aquí',
      message: 'Los hábitos son semillas. Planta uno hoy y ve cómo crece tu vida.',
      suggestions: [
        '💧 Tomar 2L de agua',
        '📖 Leer 15 minutos',
        '🧘 Meditar 5 minutos',
        '🏃 Salir a caminar',
      ],
      actionText: 'Crear mi primer hábito',
    },
    activities: {
      icon: <Heart size={48} className="text-red-500" />,
      title: '¿Qué hiciste hoy?',
      message: 'Cada actividad cuenta. Registra lo que te hace sentir bien.',
      suggestions: [
        '🎨 Pinté un cuadro',
        '🎵 Escuché mi playlist favorita',
        '☕ Tomé café con un amigo',
        '🌳 Caminé en el parque',
      ],
      actionText: 'Registrar actividad',
    },
    progress: {
      icon: <Plus size={48} className="text-blue-500" />,
      title: 'Empieza tu racha',
      message: 'Un paso a la vez. No hay presión, solo progreso.',
      suggestions: [],
      actionText: 'Comenzar ahora',
    },
  };

  const { icon, title, message, suggestions, actionText } = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-6"
      >
        {icon}
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-600 mb-6 max-w-md">{message}</p>

      {suggestions.length > 0 && (
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium text-slate-500 mb-3">
            Algunas ideas para empezar:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-slate-700 border border-slate-200"
              >
                {suggestion}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          {actionText}
        </motion.button>
      )}

      <p className="text-xs text-slate-400 mt-8 italic">
        "El viaje de mil millas comienza con un solo paso" - Lao Tzu
      </p>
    </motion.div>
  );
}
