/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/reflexion/page.tsx con este (incluye toast al guardar)
*/

'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addActivity } from '../lib/store';
import { showToast } from '../components/Toast';

const emotions = [
  { emoji: '🔥', label: 'En fuego', color: 'from-orange-400 to-red-500' },
  { emoji: '😊', label: 'Feliz', color: 'from-yellow-400 to-orange-400' },
  { emoji: '😌', label: 'Tranquilo', color: 'from-green-400 to-emerald-500' },
  { emoji: '😐', label: 'Normal', color: 'from-slate-400 to-slate-500' },
  { emoji: '😔', label: 'Cansado', color: 'from-blue-400 to-indigo-500' },
  { emoji: '😤', label: 'Frustrado', color: 'from-purple-400 to-pink-500' },
];

export default function ReflexionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'emotion' | 'details'>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  function handleEmotionSelect(emoji: string) {
    setSelectedEmotion(emoji);
    setStep('details');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mins = parseInt(minutes);
    if (isNaN(mins) || mins <= 0) {
      showToast('Por favor, ingresá un tiempo válido', 'error');
      return;
    }

    if (!note.trim()) {
      showToast('Por favor, contanos qué lograste', 'error');
      return;
    }

    addActivity(mins, note, selectedEmotion);
    showToast('¡Progreso guardado! 🚀', 'success');

    setTimeout(() => {
      window.location.href = '/';
    }, 800);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <header className="mb-8 animate-fadeIn">
        <button
          onClick={() => step === 'details' ? setStep('emotion') : router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-slate-50"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {step === 'emotion' ? '¿Cómo te sentiste hoy?' : '¿Qué lograste?'}
        </h1>
        <p className="text-slate-600">
          {step === 'emotion'
            ? 'Elegí la emoción que mejor te representa'
            : 'Registrá tu progreso del día'}
        </p>
      </header>

      {step === 'emotion' && (
        <div className="grid grid-cols-2 gap-4 animate-slideUp">
          {emotions.map((emotion) => (
            <button
              key={emotion.emoji}
              onClick={() => handleEmotionSelect(emotion.emoji)}
              className={`h-32 rounded-3xl bg-gradient-to-br ${emotion.color} text-white flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
            >
              <span className="text-5xl">{emotion.emoji}</span>
              <span className="font-medium">{emotion.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
          <div className="bg-white rounded-3xl shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Tu emoción</p>
              <p className="text-lg font-semibold text-slate-800">
                {emotions.find(e => e.emoji === selectedEmotion)?.label}
              </p>
            </div>
            <span className="text-5xl">{selectedEmotion}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Cuánto tiempo dedicaste?
            </label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="60"
              className="w-full h-14 px-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Qué hiciste?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Escribí 500 palabras de mi novela..."
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-sm text-amber-900 mb-2 font-medium">💡 Ideas:</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Trabajaste en un proyecto personal</li>
              <li>• Aprendiste algo nuevo</li>
              <li>• Hiciste ejercicio o meditaste</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700"
          >
            Guardar progreso
          </button>
        </form>
      )}
    </main>
  );
}
