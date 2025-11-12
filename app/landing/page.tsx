'use client'

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Brain, BarChart3, Moon, Zap, ArrowRight, Check, Smartphone } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: 'Bienestar Mental',
      description: 'Enfócate en tu salud emocional y mental con herramientas diseñadas para el autocuidado.',
    },
    {
      icon: Heart,
      title: 'Hábitos Significativos',
      description: 'Crea hábitos que realmente importan, no tareas vacías. Progreso real y consciente.',
    },
    {
      icon: BarChart3,
      title: 'Datos Claros',
      description: 'Visualiza tu progreso con gráficas intuitivas que te motivan a continuar.',
    },
    {
      icon: Moon,
      title: 'Ritmo Personal',
      description: 'Respeta tu propio ritmo. Sin presión, sin culpa, solo intención.',
    },
    {
      icon: Sparkles,
      title: 'Reflexión Diaria',
      description: 'Espacio para reflexionar, crecer y conocerte mejor cada día.',
    },
    {
      icon: Zap,
      title: 'Disponible Siempre',
      description: 'Web, PWA, iOS y Android. Tu bienestar, en el dispositivo que prefieras.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Define tus Hábitos',
      description: 'Elige hábitos personalizados que se alineen con tu visión de bienestar.',
    },
    {
      number: '02',
      title: 'Registra tu Progreso',
      description: 'Marca cada logro diario y mantén tu consistencia visible.',
    },
    {
      number: '03',
      title: 'Reflexiona y Crece',
      description: 'Analiza tu evolución y celebra cada paso del camino.',
    },
  ];

  return (
    <div className="relative w-full bg-white">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs subtle */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF99AC]/5 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#FFC0A9]/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#FDF0D5]/5 rounded-full filter blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] bg-clip-text text-transparent"
        >
          Habika
        </motion.h1>
        <div className="flex gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-2 text-sm font-medium text-[#FF8C66] hover:text-[#FF6B4A] transition-colors"
          >
            Login
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => router.push('/app/onboarding')}
            className="px-6 py-2 text-sm font-medium text-[#3D2C28] hover:text-[#FF8C66] transition-colors"
          >
            Entrar
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="inline-block">
              <span className="text-sm font-medium text-[#FF8C66] bg-[#FF8C66]/10 px-4 py-2 rounded-full">
                ✨ Tu compañero en el bienestar
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#3D2C28] leading-tight">
              Equilibra tu mente, crea tus hábitos con calma
            </h1>
            <p className="text-xl md:text-2xl text-[#6B9B9E] max-w-2xl mx-auto font-light leading-relaxed">
              Un espacio tranquilo para tus hábitos, reflexiones y autoconocimiento. Sin prisa, sin presión, solo intención.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <button
              onClick={() => router.push('/app/onboarding')}
              className="px-8 py-4 bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border-2 border-[#FFB4A8] text-[#3D2C28] rounded-2xl font-semibold text-lg hover:bg-[#FFB4A8]/5 transition-all duration-300"
            >
              Conocer más
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8 border-t border-[#FFB4A8]/30 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-[#6B9B9E]"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FF8C66]" />
              <span>Web + PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FF8C66]" />
              <span>iOS y Android próximamente</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#FF8C66]" />
              <span>100% Privado</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div
            {...fadeInUp}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#3D2C28]">
              Diseñado para ti
            </h2>
            <p className="text-xl text-[#6B9B9E] max-w-2xl mx-auto">
              Cada característica está pensada para apoyar tu bienestar y crecimiento personal.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="group p-8 rounded-3xl border border-[#FFB4A8]/20 bg-white/50 backdrop-blur-sm hover:border-[#FFB4A8]/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8C66]/20 to-[#FF99AC]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-[#FF8C66]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3D2C28] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#6B9B9E] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 bg-gradient-to-b from-[#FFF5F0]/50 to-white">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div
            {...fadeInUp}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#3D2C28]">
              Tu Camino Comienza Aquí
            </h2>
            <p className="text-xl text-[#6B9B9E] max-w-2xl mx-auto">
              Tres pasos simples para transformar tu vida con intención y calma.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="relative"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8C66] to-[#FF99AC] flex items-center justify-center text-white text-2xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-[#3D2C28]">
                    {step.title}
                  </h3>
                  <p className="text-[#6B9B9E] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-[#FF8C66] to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeInUp}
            viewport={{ once: true }}
            className="rounded-3xl border border-[#FFB4A8]/20 bg-gradient-to-br from-white to-[#FFF5F0]/50 backdrop-blur-sm p-12 md:p-16 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-[#FF8C66]" />
                <h2 className="text-3xl md:text-4xl font-bold text-[#3D2C28]">
                  Disponible en Todos Lados
                </h2>
              </div>
              <p className="text-xl text-[#6B9B9E] max-w-2xl">
                Accede a Habika desde tu navegador, como PWA en tu teléfono, o descarga la app nativa para iOS y Android. Tu bienestar siempre contigo.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
            >
              {[
                { title: 'Web', description: 'Acceso inmediato desde cualquier navegador' },
                { title: 'PWA', description: 'Instala como app nativa en tu teléfono' },
                { title: 'Apps Nativas', description: 'iOS y Android próximamente' },
              ].map((platform, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="p-6 rounded-2xl bg-white/50 border border-[#FFB4A8]/20 space-y-2"
                >
                  <h3 className="font-semibold text-[#3D2C28] text-lg">{platform.title}</h3>
                  <p className="text-sm text-[#6B9B9E]">{platform.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <motion.div
          {...fadeInUp}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3D2C28]">
              Tu bienestar es una prioridad
            </h2>
            <p className="text-xl text-[#6B9B9E]">
              No es sobre ser perfecto. Es sobre ser consistente, compasivo contigo mismo, y crecer a tu ritmo.
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            onClick={() => router.push('/app/onboarding')}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            Comienza tu Viaje Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="text-sm text-[#A67B6B] pt-4">
            Gratis • Sin tarjeta de crédito • Comienza en segundos
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#FFB4A8]/20 py-12 px-6 md:px-12 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="font-bold text-[#3D2C28] text-lg">Habika</h3>
              <p className="text-sm text-[#6B9B9E]">
                Tu compañero en el camino hacia el bienestar y la transformación personal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2C28] mb-4 text-sm">Producto</h4>
              <ul className="space-y-2 text-sm text-[#6B9B9E]">
                <li><button onClick={() => router.push('/app/onboarding')} className="hover:text-[#FF8C66] transition-colors">Comenzar</button></li>
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#FF8C66] transition-colors">Características</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2C28] mb-4 text-sm">Plataformas</h4>
              <ul className="space-y-2 text-sm text-[#6B9B9E]">
                <li>Web</li>
                <li>PWA</li>
                <li>iOS (próx.)</li>
                <li>Android (próx.)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#3D2C28] mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-[#6B9B9E]">
                <li><a href="#" className="hover:text-[#FF8C66] transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-[#FF8C66] transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#FFB4A8]/20 pt-8 text-center text-sm text-[#A67B6B]">
            <p>© 2025 Habika. Todos los derechos reservados. Construido con cuidado para tu bienestar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}