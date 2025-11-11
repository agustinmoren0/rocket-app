/**
 * Loading Spinner Components
 * Accessible loading states with aria-busy and ARIA labels
 */

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  ariaLabel?: string;
  fullScreen?: boolean;
}

/**
 * Rotating spinner loading indicator
 */
export function LoadingSpinner({
  size = 'md',
  color = '#FF99AC',
  ariaLabel = 'Cargando...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const spinnerSize = sizeMap[size];

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="inline-block"
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="113"
          strokeDashoffset="0"
          strokeLinecap="round"
          opacity="0.25"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="45"
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {spinner}
          <p className="mt-4 text-center text-slate-600 font-medium">{ariaLabel}</p>
        </div>
      </div>
    );
  }

  return spinner;
}

/**
 * Inline loading skeleton (pulse animation)
 */
export function LoadingSkeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  count = 1,
}: {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${width} ${height} bg-slate-200 rounded-lg ${className} ${i > 0 ? 'mt-2' : ''}`}
          role="status"
          aria-label="Cargando contenido"
        />
      ))}
    </>
  );
}

/**
 * Loading overlay for buttons
 */
export function LoadingButton({
  isLoading,
  children,
  disabled,
  className = '',
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`relative transition-opacity ${isLoading ? 'opacity-70' : ''} ${className}`}
      aria-busy={isLoading}
      aria-disabled={isLoading || disabled}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="45"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </motion.div>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Loading card - skeleton for content blocks
 */
export function LoadingCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm ${i > 0 ? 'mt-4' : ''}`}>
          <LoadingSkeleton width="w-1/3" height="h-6" className="mb-4" />
          <LoadingSkeleton width="w-full" height="h-4" count={3} />
        </div>
      ))}
    </>
  );
}

/**
 * Loading text with shimmer effect
 */
export function LoadingText({
  words = 3,
  className = '',
}: {
  words?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Cargando texto">
      {Array.from({ length: words }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded"
        />
      ))}
    </div>
  );
}

/**
 * Progress bar with percentage
 */
export function LoadingProgress({
  progress = 0,
  label = 'Progreso',
  showPercentage = true,
}: {
  progress?: number;
  label?: string;
  showPercentage?: boolean;
}) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showPercentage && <span className="text-sm text-slate-500">{progress}%</span>}
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-[#FF99AC] to-[#FFC0A9]"
        />
      </div>
    </div>
  );
}
