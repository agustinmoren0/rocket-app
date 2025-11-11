/**
 * Accessibility Utilities
 * ARIA labels, roles, and other a11y helpers for WCAG 2.1 AA compliance
 */

/**
 * ARIA label templates for common components
 */
export const ARIA_LABELS = {
  // Navigation & General
  navigation: 'Navegación principal',
  skipToMain: 'Saltar al contenido principal',
  openMenu: 'Abrir menú',
  closeMenu: 'Cerrar menú',
  goBack: 'Volver a la página anterior',

  // Activities
  addActivity: 'Agregar nueva actividad',
  deleteActivity: 'Eliminar actividad',
  editActivity: 'Editar actividad',
  activityName: 'Nombre de la actividad',
  activityDuration: 'Duración en minutos o horas',
  activityCategory: 'Categoría de la actividad',
  activityDate: 'Fecha de la actividad',

  // Habits
  addHabit: 'Crear nuevo hábito',
  deleteHabit: 'Eliminar hábito',
  editHabit: 'Editar hábito',
  completeHabit: 'Marcar hábito como completado',
  pauseHabit: 'Pausar hábito',
  resumeHabit: 'Reanudar hábito',
  habitName: 'Nombre del hábito',
  habitGoal: 'Objetivo del hábito',
  habitFrequency: 'Frecuencia del hábito',
  habitColor: 'Color del hábito',
  habitIcon: 'Icono del hábito',

  // Cycle
  cycleMode: 'Modo Ciclo',
  activateCycle: 'Activar modo ciclo',
  deactivateCycle: 'Desactivar modo ciclo',
  lastPeriodDate: 'Fecha del último período menstrual',
  cycleLength: 'Duración del ciclo en días',
  periodLength: 'Duración del período en días',
  addSymptom: 'Agregar síntoma del período',
  removeSymptom: 'Eliminar síntoma del período',

  // Calendar
  calendar: 'Calendario',
  selectDate: 'Seleccionar fecha',
  previousMonth: 'Mes anterior',
  nextMonth: 'Próximo mes',
  today: 'Hoy',

  // Modals & Dialogs
  modal: 'Cuadro de diálogo',
  closeModal: 'Cerrar cuadro de diálogo',
  confirmAction: 'Confirmar acción',
  cancelAction: 'Cancelar acción',
  deleteConfirmation: 'Confirmar eliminación',

  // Forms & Inputs
  searchActivities: 'Buscar actividades',
  searchHabits: 'Buscar hábitos',
  submit: 'Enviar',
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  clear: 'Limpiar',
  required: 'Requerido',

  // Notifications & Feedback
  loading: 'Cargando...',
  success: 'Acción completada exitosamente',
  error: 'Ocurrió un error',
  warning: 'Advertencia',
  info: 'Información',

  // User Profile
  profile: 'Perfil de usuario',
  settings: 'Configuración',
  logout: 'Cerrar sesión',
  userName: 'Nombre de usuario',

  // Statistics & Analytics
  statistics: 'Estadísticas',
  consistency: 'Consistencia del hábito',
  streak: 'Racha del hábito',
  chart: 'Gráfico de progreso',
};

/**
 * ARIA roles for semantic HTML
 */
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  region: 'region',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  tablist: 'tablist',
  tab: 'tab',
  tabpanel: 'tabpanel',
  dialog: 'dialog',
  alert: 'alert',
  alertdialog: 'alertdialog',
  menuitem: 'menuitem',
  checkbox: 'checkbox',
  radio: 'radio',
  switch: 'switch',
  slider: 'slider',
  listbox: 'listbox',
  option: 'option',
  progressbar: 'progressbar',
  status: 'status',
};

/**
 * Generate accessible button attributes
 */
export function getAccessibleButton(label: string, disabled = false) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    role: 'button',
    tabIndex: disabled ? -1 : 0,
  };
}

/**
 * Generate accessible form field attributes
 */
export function getAccessibleFormField(
  fieldId: string,
  label: string,
  required = false,
  error?: string
) {
  return {
    id: fieldId,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${fieldId}-error` : undefined,
  };
}

/**
 * Generate accessible modal attributes
 */
export function getAccessibleModal(
  modalId: string,
  title: string,
  ariaLabelledBy = `${modalId}-title`
) {
  return {
    id: modalId,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': ariaLabelledBy,
    'aria-label': title,
  };
}

/**
 * Generate accessible tab attributes
 */
export function getAccessibleTab(
  tabId: string,
  tablistId: string,
  isSelected = false,
  label?: string
) {
  return {
    id: tabId,
    role: 'tab',
    'aria-selected': isSelected,
    'aria-controls': `${tabId}-panel`,
    'aria-labelledby': label ? `${tabId}-label` : undefined,
    tabIndex: isSelected ? 0 : -1,
  };
}

/**
 * Generate accessible tab panel attributes
 */
export function getAccessibleTabPanel(
  tabId: string,
  panelId: string,
  isVisible = false
) {
  return {
    id: panelId,
    role: 'tabpanel',
    'aria-labelledby': tabId,
    hidden: !isVisible,
  };
}

/**
 * Generate accessible list attributes
 */
export function getAccessibleList(
  listId: string,
  isOrdered = false,
  label?: string
) {
  return {
    id: listId,
    role: isOrdered ? 'list' : 'list',
    'aria-label': label,
  };
}

/**
 * Generate accessible list item attributes
 */
export function getAccessibleListItem(index: number, itemId?: string) {
  return {
    id: itemId,
    role: 'listitem',
    'aria-posinset': index + 1,
  };
}

/**
 * Screen reader only text class
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Tailwind class for screen reader only content
 */
export const SR_ONLY_STYLE = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

/**
 * Generate announcement for screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = SR_ONLY_CLASS;
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Keyboard navigation helpers
 */
export const KEY_CODES = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESC: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
};

/**
 * Check if key press is acceptable for activation
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === KEY_CODES.ENTER || event.key === KEY_CODES.SPACE;
}

/**
 * Check if key press is navigation key
 */
export function isNavigationKey(event: KeyboardEvent): boolean {
  return [
    KEY_CODES.ARROW_UP,
    KEY_CODES.ARROW_DOWN,
    KEY_CODES.ARROW_LEFT,
    KEY_CODES.ARROW_RIGHT,
    KEY_CODES.HOME,
    KEY_CODES.END,
  ].includes(event.key);
}

/**
 * Semantic HTML elements map
 */
export const SEMANTIC_HTML = {
  main: 'main',
  nav: 'nav',
  section: 'section',
  article: 'article',
  aside: 'aside',
  header: 'header',
  footer: 'footer',
  form: 'form',
  label: 'label',
  button: 'button',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  fieldset: 'fieldset',
  legend: 'legend',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  table: 'table',
  thead: 'thead',
  tbody: 'tbody',
  tfoot: 'tfoot',
  tr: 'tr',
  th: 'th',
  td: 'td',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'p',
  span: 'span',
  strong: 'strong',
  em: 'em',
  code: 'code',
  pre: 'pre',
};

/**
 * Color contrast checker (WCAG AA standard)
 * Returns true if contrast ratio is >= 4.5:1 for normal text
 * or >= 3:1 for large text (18pt+ or 14pt+ bold)
 */
export function meetsContrastRequirement(
  luminance1: number,
  luminance2: number,
  isLargeText = false
): boolean {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  const contrast = (lighter + 0.05) / (darker + 0.05);

  return isLargeText ? contrast >= 3 : contrast >= 4.5;
}

/**
 * Calculate relative luminance
 */
export function getRelativeLuminance(hex: string): number {
  // Parse hex color
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Convert to relative luminance
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
