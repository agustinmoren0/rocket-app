'use client'

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

// Check if user prefers reduced motion
function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const triggerConfetti = () => {
  // Respect user's motion preferences
  if (shouldReduceMotion()) return;

  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerSuccess = () => {
  // Respect user's motion preferences
  if (shouldReduceMotion()) return;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#34d399', '#6ee7b7'],
  });
};
