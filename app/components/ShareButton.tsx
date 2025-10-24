/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá app/components/ShareButton.tsx
2. Pegá este código
*/

'use client'

import { useState } from 'react';
import { generateProgressImage, shareProgress } from '../lib/shareImage';

type Props = {
  name: string;
  progress: number;
  activeDays: number;
  minutes: number;
  streak: number;
};

export default function ShareButton({ name, progress, activeDays, minutes, streak }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const imageUrl = await generateProgressImage(name, progress, activeDays, minutes, streak);
      await shareProgress(imageUrl);
    } catch (error) {
      alert('Error al generar imagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="w-full h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <span>📸</span>
          Compartir mi progreso
        </>
      )}
    </button>
  );
}
