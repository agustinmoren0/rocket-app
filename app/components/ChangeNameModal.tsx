/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá app/components/ChangeNameModal.tsx
2. Pegá este código
*/

'use client'

import { useState, useRef, useEffect } from 'react';
import { loadData, saveData } from '../lib/store';
import { showToast } from './Toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
};

// Validation constants
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 50;
const INVALID_CHARS_PATTERN = /[<>{}]/;

function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Por favor, ingresá un nombre válido' };
  }

  if (trimmed.length < NAME_MIN_LENGTH) {
    return { valid: false, error: `El nombre debe tener al menos ${NAME_MIN_LENGTH} carácter` };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `El nombre no puede exceder ${NAME_MAX_LENGTH} caracteres` };
  }

  if (INVALID_CHARS_PATTERN.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos (<, >, {, })' };
  }

  return { valid: true };
}

export default function ChangeNameModal({ isOpen, onClose, currentName }: Props) {
  const [name, setName] = useState(currentName);
  const [validationError, setValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const focusTrapRef = useRef<HTMLDivElement>(null);

  // Handle keyboard interactions (Escape key)
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Focus the input when modal opens
      setTimeout(() => {
        const input = focusTrapRef.current?.querySelector('input');
        input?.focus();
      }, 0);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleNameChange(value: string) {
    setName(value);
    // Clear error on change
    if (validationError) {
      setValidationError('');
    }
  }

  async function handleSave() {
    // Validate input
    const validation = validateName(name);
    if (!validation.valid) {
      setValidationError(validation.error || 'Nombre inválido');
      showToast(validation.error || 'Nombre inválido', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const data = loadData();
      data.name = name.trim();
      saveData(data);

      showToast('Nombre actualizado correctamente', 'success');
      // Recargar para actualizar nombre en toda la app
      window.location.reload();
    } catch (error) {
      console.error('Error saving name:', error);
      showToast('Error al guardar el nombre', 'error');
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
      onClick={onClose}
      ref={focusTrapRef}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-2xl font-bold text-[#3D2C28] mb-2">
          Cambiar nombre
        </h2>
        <p id="modal-description" className="text-sm text-[#6B9B9E] mb-4">
          Actualiza tu nombre de usuario. Máximo 50 caracteres.
        </p>

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSaving) {
                handleSave();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Tu nombre"
            maxLength={NAME_MAX_LENGTH}
            aria-label="Nombre de usuario"
            aria-describedby={validationError ? 'error-message' : undefined}
            className={`w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 transition-colors focus:outline-none text-lg font-medium ${
              validationError
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                : 'border-[#FFB4A8]/30 focus:border-[#FF8C66] focus:ring-2 focus:ring-[#FF8C66]/10'
            }`}
            autoFocus
            disabled={isSaving}
          />
          <div className="flex justify-between items-start mt-2">
            <p
              id="error-message"
              className={`text-xs transition-colors ${
                validationError ? 'text-red-500 font-medium' : 'text-[#A67B6B]'
              }`}
            >
              {validationError || `${name.length}/${NAME_MAX_LENGTH} caracteres`}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cancelar cambio de nombre"
            className="flex-1 h-12 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Guardar nuevo nombre"
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
