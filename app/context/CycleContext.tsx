'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notifyDataChange } from '../lib/storage-utils';
import { persistData, deleteRecord } from '../lib/persistence-layer';

type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

interface CycleData {
  isActive: boolean;
  lastPeriodStart: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentPhase: CyclePhase;
  currentDay: number;
  nextPeriodDate: string;
  fertilityWindow: { start: string; end: string };
  symptoms: { [date: string]: string[] };
}

interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  suggestions: string[];
  energy: string;
  mood: string;
}

interface CycleContextType {
  cycleData: CycleData;
  activateCycleMode: (lastPeriod: string, cycleLength: number, periodLength: number) => void;
  deactivateCycleMode: () => void;
  addSymptom: (date: string, symptom: string) => void;
  getCurrentPhase: () => CyclePhase;
  getPhaseInfo: (phase: CyclePhase) => PhaseInfo;
  updateCycleSettings: (cycleLength: number, periodLength: number) => void;
  registerNewPeriod: (date: string) => void;
  resetCycleData: () => void;
}

const CycleContext = createContext<CycleContextType | null>(null);

export const CycleProvider = ({ children }: { children: ReactNode }) => {
  const [cycleData, setCycleData] = useState<CycleData>({
    isActive: false,
    lastPeriodStart: '',
    cycleLengthDays: 28,
    periodLengthDays: 5,
    currentPhase: 'menstrual',
    currentDay: 1,
    nextPeriodDate: '',
    fertilityWindow: { start: '', end: '' },
    symptoms: {},
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Get userId from context (if available)
    const userIdFromStorage = localStorage.getItem('supabase.auth.token') ? 'authenticated' : null;
    setUserId(userIdFromStorage);

    // Get or create device ID
    let dId = localStorage.getItem('device_id');
    if (!dId) {
      dId = `device_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', dId);
    }
    setDeviceId(dId);

    // Load cycle data
    const stored = localStorage.getItem('habika_cycle_data');
    if (stored) {
      const data = JSON.parse(stored);
      setCycleData(data);
      if (data.isActive) {
        updateCycleCalculations(data);
      }
    }
  }, []);

  const calculatePhase = (dayOfCycle: number, cycleLength: number, periodLength: number): CyclePhase => {
    if (dayOfCycle <= periodLength) return 'menstrual';
    if (dayOfCycle <= Math.floor(cycleLength / 2) - 3) return 'follicular';
    if (dayOfCycle <= Math.floor(cycleLength / 2) + 3) return 'ovulatory';
    return 'luteal';
  };

  const updateCycleCalculations = async (data: CycleData) => {
    const lastPeriod = new Date(data.lastPeriodStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPeriod.setHours(0, 0, 0, 0);

    const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = (daysSince % data.cycleLengthDays) + 1;

    const currentPhase = calculatePhase(currentDay, data.cycleLengthDays, data.periodLengthDays);

    // Calcular próximo periodo
    const nextPeriod = new Date(lastPeriod);
    const cyclesCompleted = Math.floor(daysSince / data.cycleLengthDays);
    nextPeriod.setDate(lastPeriod.getDate() + (cyclesCompleted + 1) * data.cycleLengthDays);

    // Calcular ventana de fertilidad (día 10-17 aprox en ciclo de 28 días)
    const ovulationDay = Math.floor(data.cycleLengthDays / 2);
    const fertilityStart = new Date(lastPeriod);
    fertilityStart.setDate(lastPeriod.getDate() + daysSince + (ovulationDay - 5 - currentDay + 1));
    const fertilityEnd = new Date(lastPeriod);
    fertilityEnd.setDate(lastPeriod.getDate() + daysSince + (ovulationDay + 2 - currentDay + 1));

    const updated = {
      ...data,
      currentDay,
      currentPhase,
      nextPeriodDate: nextPeriod.toISOString(),
      fertilityWindow: {
        start: fertilityStart.toISOString(),
        end: fertilityEnd.toISOString(),
      },
    };

    setCycleData(updated);
    localStorage.setItem('habika_cycle_data', JSON.stringify(updated));

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      await persistData({
        table: 'cycle_data',
        data: {
          id: `cycle_${userId}`, // Single record per user
          ...updated,
        },
        userId,
        deviceId,
      });
    }

    notifyDataChange();
  };

  const activateCycleMode = async (lastPeriod: string, cycleLength: number, periodLength: number) => {
    const newData: CycleData = {
      isActive: true,
      lastPeriodStart: new Date(lastPeriod).toISOString(),
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
      currentPhase: 'menstrual',
      currentDay: 1,
      nextPeriodDate: '',
      fertilityWindow: { start: '', end: '' },
      symptoms: {},
    };

    await updateCycleCalculations(newData);
  };

  const deactivateCycleMode = async () => {
    const updated = { ...cycleData, isActive: false };
    setCycleData(updated);
    localStorage.setItem('habika_cycle_data', JSON.stringify(updated));

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      await persistData({
        table: 'cycle_data',
        data: {
          id: `cycle_${userId}`,
          ...updated,
        },
        userId,
        deviceId,
      });
    }

    notifyDataChange();
  };

  const addSymptom = async (date: string, symptom: string) => {
    const symptoms = { ...cycleData.symptoms };
    if (!symptoms[date]) symptoms[date] = [];
    if (!symptoms[date].includes(symptom)) {
      symptoms[date].push(symptom);
    }

    const updated = { ...cycleData, symptoms };
    setCycleData(updated);
    localStorage.setItem('habika_cycle_data', JSON.stringify(updated));

    // Persist to Supabase if authenticated
    if (userId && deviceId) {
      await persistData({
        table: 'cycle_data',
        data: {
          id: `cycle_${userId}`,
          ...updated,
        },
        userId,
        deviceId,
      });
    }

    notifyDataChange();
  };

  const getCurrentPhase = () => cycleData.currentPhase;

  const getPhaseInfo = (phase: CyclePhase): PhaseInfo => {
    const phases: { [key in CyclePhase]: PhaseInfo } = {
      menstrual: {
        name: 'Menstrual',
        emoji: '🌙',
        color: 'from-pink-400 to-rose-500',
        bgColor: 'bg-rose-50',
        description: 'Fase de descanso y renovación',
        suggestions: [
          'Descanso activo',
          'Yoga suave',
          'Meditación',
          'Lectura',
          'Baño relajante',
          'Dormir bien',
          'Cuidado personal',
        ],
        energy: 'Baja',
        mood: 'Introspectiva',
      },
      follicular: {
        name: 'Folicular',
        emoji: '🌱',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'bg-emerald-50',
        description: 'Energía creciente, tiempo de nuevos comienzos',
        suggestions: [
          'Iniciar nuevos hábitos',
          'Ejercicio moderado',
          'Planificación',
          'Aprendizaje',
          'Socializar',
          'Proyectos creativos',
          'Conocer gente nueva',
        ],
        energy: 'Media-Alta',
        mood: 'Optimista',
      },
      ovulatory: {
        name: 'Ovulatoria',
        emoji: '✨',
        color: 'from-purple-400 to-pink-500',
        bgColor: 'bg-purple-50',
        description: 'Pico de energía y creatividad',
        suggestions: [
          'Productividad máxima',
          'Networking',
          'Presentaciones',
          'Ejercicio intenso',
          'Proyectos importantes',
          'Reuniones difíciles',
          'Desafíos nuevos',
        ],
        energy: 'Alta',
        mood: 'Confiada',
      },
      luteal: {
        name: 'Lútea',
        emoji: '🍂',
        color: 'from-amber-400 to-orange-500',
        bgColor: 'bg-amber-50',
        description: 'Tiempo de cerrar ciclos y organizar',
        suggestions: [
          'Completar tareas',
          'Organización',
          'Rutinas reconfortantes',
          'Cuidado personal',
          'Reflexión',
          'Descanso moderado',
          'Tareas administrativas',
        ],
        energy: 'Media',
        mood: 'Reflexiva',
      },
    };

    return phases[phase];
  };

  const updateCycleSettings = async (cycleLength: number, periodLength: number) => {
    const updated = {
      ...cycleData,
      cycleLengthDays: cycleLength,
      periodLengthDays: periodLength,
    };

    await updateCycleCalculations(updated);
  };

  const registerNewPeriod = async (date: string) => {
    const updated = {
      ...cycleData,
      lastPeriodStart: new Date(date).toISOString(),
    };

    await updateCycleCalculations(updated);

    // Save period to history
    const history = JSON.parse(localStorage.getItem('habika_period_history') || '[]');
    history.push({
      date,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('habika_period_history', JSON.stringify(history));

    // Persist period history to Supabase if authenticated
    if (userId && deviceId) {
      await persistData({
        table: 'period_history',
        data: {
          id: `period_${userId}_${date}`,
          user_id: userId,
          date,
          timestamp: new Date().toISOString(),
        },
        userId,
        deviceId,
      });
    }

    notifyDataChange();
  };

  const resetCycleData = async () => {
    const confirmed = confirm(
      '¿Reiniciar Modo Ciclo?\n\n' +
      'Se mantendrá el historial pero resetearás la configuración actual.'
    );

    if (!confirmed) return;

    const newData: CycleData = {
      isActive: true,
      lastPeriodStart: new Date().toISOString().split('T')[0],
      cycleLengthDays: 28,
      periodLengthDays: 5,
      currentPhase: 'menstrual',
      currentDay: 1,
      nextPeriodDate: '',
      fertilityWindow: { start: '', end: '' },
      symptoms: {},
    };

    await updateCycleCalculations(newData);
  };

  return (
    <CycleContext.Provider
      value={{
        cycleData,
        activateCycleMode,
        deactivateCycleMode,
        addSymptom,
        getCurrentPhase,
        getPhaseInfo,
        updateCycleSettings,
        registerNewPeriod,
        resetCycleData,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) throw new Error('useCycle must be used within CycleProvider');
  return context;
};
