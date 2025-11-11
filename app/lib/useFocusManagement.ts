'use client'

import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing focus in forms and interactive elements
 * Helps with accessibility and keyboard navigation
 */
export function useFocusOnError(dependencies: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find first element with error
    const errorElement = containerRef.current.querySelector('[aria-invalid="true"]');
    if (errorElement && errorElement instanceof HTMLElement) {
      // Scroll into view with smooth behavior
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus on the error element
      errorElement.focus();
    }
  }, dependencies);

  return containerRef;
}

/**
 * Trap focus within a modal or dialog
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerRef.current?.addEventListener('keydown', handleKeyDown);
    // Auto-focus first element
    const firstFocusable = containerRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Announce changes to screen readers
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;
    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      if (announcerRef.current) announcerRef.current.textContent = '';
    }, 1000);
  };

  return { announcerRef, announce };
}

/**
 * Manage keyboard navigation for list/menu items
 */
export function useKeyboardNavigation(items: HTMLElement[], onSelect?: (index: number) => void) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setActiveIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setActiveIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          items[activeIndex]?.click();
          onSelect?.(activeIndex);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
      }
    };

    items[activeIndex]?.addEventListener('keydown', handleKeyDown);
    items[activeIndex]?.focus();

    return () => {
      items[activeIndex]?.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, items, onSelect]);

  return activeIndex;
}
