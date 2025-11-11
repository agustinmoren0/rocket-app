import { useState, useEffect } from 'react';

/**
 * Hook para detectar la preferencia de movimiento reducido del usuario
 * Respeta la configuración de accesibilidad del sistema operativo
 *
 * Uso en Framer Motion:
 * const prefersReducedMotion = useMotionPreference();
 *
 * <motion.div
 *   initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
 *   animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
 *   transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
 * >
 *   Content
 * </motion.div>
 *
 * O simplemente:
 * <motion.div
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 * >
 *   Content
 * </motion.div>
 */
export function useMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes in preference
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    // @ts-ignore
    mediaQuery.addListener(handleChange);
    return () => {
      // @ts-ignore
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Función standalone para chequear prefers-reduced-motion sin hook
 * Útil cuando se necesita decidir en tiempo de renderizado
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Configuración de transiciones según preferencia de movimiento
 * Simplifica la lógica de Framer Motion
 */
export function getMotionConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: {},
      animate: {},
      exit: {},
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };
}

/**
 * Config para animaciones más complejas
 */
export function getStaggerConfig(
  prefersReducedMotion: boolean,
  delay: number = 0.1
) {
  if (prefersReducedMotion) {
    return {
      container: { transition: { staggerChildren: 0 } },
      item: { transition: { duration: 0 } },
    };
  }

  return {
    container: {
      transition: {
        staggerChildren: delay,
        delayChildren: 0,
      },
    },
    item: {
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };
}
