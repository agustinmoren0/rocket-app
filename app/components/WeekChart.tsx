// components/WeekChart.tsx
'use client'

type Props = {
  activeDays: boolean[]; // [true, false, true, ...]
};

const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function WeekChart({ activeDays }: Props) {
  return (
    <div className="flex justify-around items-end h-32 px-4">
      {activeDays.map((active, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {/* Burbuja */}
          <div className="relative w-16 h-16">
            {/* Fondo claro */}
            <div className="absolute inset-0 rounded-full bg-indigo-100" />
            {/* Progreso (si está activo) */}
            {active && (
              <div 
                className="absolute bottom-0 left-0 right-0 rounded-full bg-indigo-600 transition-all duration-500"
                style={{ height: '70%' }}
              />
            )}
          </div>
          {/* Etiqueta */}
          <span className="text-xs font-medium text-slate-600">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}
