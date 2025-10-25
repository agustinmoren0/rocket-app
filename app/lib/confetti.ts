'use client'

import confetti from 'canvas-confetti';

// Confetti sutil al completar logro
export function celebrateAchievement() {
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
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { y: 0.7 },
    zIndex: 9999,
    colors: ['#10b981', '#06b6d4'],
    ticks: 100,
  });
}
