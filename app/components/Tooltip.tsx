'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, text, side = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute ${positionClasses[side]} px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-50`}
          >
            {text}
            <div className={`absolute ${arrowClasses[side]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
