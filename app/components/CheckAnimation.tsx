'use client'

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const CheckAnimation = ({ onComplete }: { onComplete?: () => void }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onAnimationComplete={onComplete}
      className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Check size={32} className="text-white" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
};
