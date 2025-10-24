/* INSTRUCCIONES PARA CLAUDE VS CODE:
Creá el archivo app/components/StreakCard.tsx con este código
*/

'use client'

type Props = {
  currentStreak: number;
  bestStreak: number;
};

export default function StreakCard({ currentStreak, bestStreak }: Props) {
  const getStreakMessage = () => {
    if (currentStreak === 0) return {
      icon: '🔥',
      title: 'Empezá tu racha',
      subtitle: 'Registrá actividad hoy para comenzar'
    };
    if (currentStreak === 1) return {
      icon: '🌟',
      title: '¡Primera chispa!',
      subtitle: 'Seguí mañana para crear una racha'
    };
    if (currentStreak >= 7) return {
      icon: '🚀',
      title: '¡Semana completa!',
      subtitle: 'Tu constancia es imparable'
    };
    if (currentStreak >= 3) return {
      icon: '🔥',
      title: `${currentStreak} días seguidos`,
      subtitle: 'Vas construyendo un hábito sólido'
    };
    return {
      icon: '🔥',
      title: `${currentStreak} días seguidos`,
      subtitle: '¡Seguí así!'
    };
  };

  const message = getStreakMessage();

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Tu racha</h3>
        {bestStreak > currentStreak && (
          <div className="text-xs text-slate-500">
            Récord: {bestStreak} días
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
          <span className="text-4xl">{message.icon}</span>
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-bold text-slate-800 mb-1">
            {message.title}
          </h4>
          <p className="text-sm text-slate-600">
            {message.subtitle}
          </p>
        </div>
      </div>

      {/* Visualización de días */}
      {currentStreak > 0 && (
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-scaleIn"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="text-white text-xs font-bold">🔥</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
