/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/components/WeekChart.tsx con este código
*/

'use client'

type Props = {
  activeDays: boolean[];
};

const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function WeekChart({ activeDays }: Props) {
  return (
    <div className="flex justify-around items-end h-32 px-2">
      {activeDays.map((active, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {/* Burbuja */}
          <div className="relative w-14 h-14">
            {/* Fondo claro siempre visible */}
            <div className="absolute inset-0 rounded-full bg-indigo-100" />

            {/* Relleno si está activo - efecto de llenar desde abajo */}
            {active && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{
                    height: '85%',
                    animation: 'fillUp 0.8s ease-out'
                  }}
                />
              </div>
            )}
          </div>

          {/* Etiqueta del día */}
          <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
            {days[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
