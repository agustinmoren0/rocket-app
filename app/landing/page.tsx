'use client'

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Target, TrendingUp, Heart, Wind, Calendar } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
    }}
  >
    <div className="w-12 h-12 rounded-lg bg-[#FF8C66]/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-[#FF8C66]" />
    </div>
    <h3 className="text-[#3D2C28] font-bold text-lg mb-2">{title}</h3>
    <p className="text-[#A67B6B] text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Target,
      title: 'Hábitos Personalizados',
      description: 'Crea hábitos diarios, semanales o mensuales adaptados a tu ritmo de vida.',
      delay: 0.1,
    },
    {
      icon: Calendar,
      title: 'Seguimiento Inteligente',
      description: 'Visualiza tu progreso en vista diaria, semanal y mensual con detalles completos.',
      delay: 0.2,
    },
    {
      icon: Flame,
      title: 'Racha de Consistencia',
      description: 'Mantén tu racha activa y celebra tus logros día a día.',
      delay: 0.3,
    },
    {
      icon: Heart,
      title: 'Bienestar Integral',
      description: 'Integra actividades y hábitos para un cuidado completo de tu salud mental.',
      delay: 0.4,
    },
    {
      icon: Wind,
      title: 'Mindfulness',
      description: 'Accede a ejercicios de respiración y meditación cuando los necesites.',
      delay: 0.5,
    },
    {
      icon: TrendingUp,
      title: 'Estadísticas Detalladas',
      description: 'Analiza tu progreso con gráficas y datos que te motiven a continuar.',
      delay: 0.6,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFF5F0]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60 animate-float" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#3D2C28] tracking-tight mb-4">
            Habika
          </h1>
          <p className="text-xl md:text-2xl text-[#A67B6B] font-medium">
            Tu compañero en el camino hacia mejores hábitos
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl text-lg text-[#A67B6B] mb-10 leading-relaxed"
        >
          Transforma tu vida registrando hábitos y actividades. Visualiza tu progreso, mantén tu racha y celebra cada logro con datos que realmente importan.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/app/onboarding')}
          className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl backdrop-blur-xl transition-all duration-300 border border-white/20 mb-16"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 140, 102, 0.8) 0%, rgba(255, 153, 123, 0.8) 100%)',
            boxShadow: '0 8px 32px 0 rgba(255, 140, 102, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          Comenzar Ahora
        </motion.button>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3D2C28] tracking-tight mb-4">
            Características
          </h2>
          <p className="text-lg text-[#A67B6B] max-w-2xl mx-auto">
            Todo lo que necesitas para crear y mantener los hábitos que deseas
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto rounded-3xl p-12 text-center backdrop-blur-xl border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 192, 169, 0.3) 0%, rgba(255, 153, 172, 0.3) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          <h3 className="text-3xl font-bold text-[#3D2C28] mb-4">
            ¿Listo para Comenzar?
          </h3>
          <p className="text-[#A67B6B] text-lg mb-8">
            Únete a miles de personas que están transformando sus vidas con Habika. Tu próximo mejor día comienza aquí.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/app/onboarding')}
            className="px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl backdrop-blur-xl transition-all duration-300 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 140, 102, 0.9) 0%, rgba(255, 153, 123, 0.9) 100%)',
              boxShadow: '0 8px 32px 0 rgba(255, 140, 102, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            }}
          >
            Acceder a Habika
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/20 py-8 px-6 text-center">
        <p className="text-[#A67B6B] text-sm">
          © 2025 Habika. Todos los derechos reservados. Construido con dedicación para tu bienestar.
        </p>
      </div>
    </div>
  );
}
