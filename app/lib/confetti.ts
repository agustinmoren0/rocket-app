'use client'

import confetti from 'canvas-confetti';

// Check if user prefers reduced motion
function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Confetti sutil al completar logro
export function celebrateAchievement() {
  // Respect user's motion preferences
  if (shouldReduceMotion()) return;

  const count = 80;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Confetti mínimo para racha
export function celebrateStreak() {
  // Respect user's motion preferences
  if (shouldReduceMotion()) return;

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    zIndex: 9999,
    colors: ['#8b5cf6', '#6366f1', '#ec4899'],
  });
}

// Celebración al guardar actividad
export function celebrateSave() {
  // Respect user's motion preferences
  if (shouldReduceMotion()) return;

  confetti({
    particleCount: 30,
    spread: 40,
    origin: { y: 0.7 },
    zIndex: 9999,
    colors: ['#10b981', '#06b6d4'],
    ticks: 100,
  });
}
