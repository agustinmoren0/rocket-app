/**
 * Modal Accessibility Hook
 * Manages Escape key, focus trapping, and backdrop dismissal
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseModalAccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  focusTrapEnabled?: boolean;
}

/**
 * Hook for accessible modal behavior
 * - Closes on Escape key press
 * - Traps focus within modal
 * - Restores focus when modal closes
 * - Prevents body scroll when modal is open
 */
export function useModalAccessibility({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  focusTrapEnabled = true,
}: UseModalAccessibilityProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap and body scroll prevention
  useEffect(() => {
    if (!isOpen) return;

    // Store previous active element to restore focus later
    previousActiveElement.current = document.activeElement;

    // Prevent body scroll
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Focus trap
    if (focusTrapEnabled && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key !== 'Tab') return;

          if (event.shiftKey) {
            // Shift + Tab: move focus backwards
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab: move focus forwards
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        };

        // Focus first element
        firstElement.focus();

        modalRef.current.addEventListener('keydown', handleKeyDown);

        return () => {
          modalRef.current?.removeEventListener('keydown', handleKeyDown);
        };
      }
    }

    // Cleanup on unmount
    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Restore focus to previous element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, focusTrapEnabled]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  return {
    modalRef,
    handleBackdropClick,
  };
}

/**
 * Hook to announce modal state to screen readers
 */
export function useModalAnnouncement(isOpen: boolean, title: string) {
  useEffect(() => {
    if (!isOpen) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = `${title}. Cuadro de diálogo abierto. Presiona Escape para cerrar.`;

    document.body.appendChild(announcement);

    return () => {
      document.body.removeChild(announcement);
    };
  }, [isOpen, title]);
}
