// Utility functions for localStorage with automatic event dispatch

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
  notifyDataChange();
}

export function notifyDataChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('habika-data-changed'));
  }
}
