/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá app/components/ChangeNameModal.tsx
2. Pegá este código
*/

'use client'

import { useState } from 'react';
import { loadData, saveData } from '../lib/store';
import { showToast } from './Toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
};

export default function ChangeNameModal({ isOpen, onClose, currentName }: Props) {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Por favor, ingresá un nombre válido', 'error');
      return;
    }

    const data = loadData();
    data.name = trimmed;
    saveData(data);

    showToast('Nombre actualizado correctamente', 'success');
    window.location.reload(); // Recargar para actualizar nombre en toda la app
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Cambiar nombre
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-lg mb-4"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-12 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
