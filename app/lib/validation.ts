/**
 * Form Validation Utilities
 * Provides reusable validation functions for all app forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate activity/habit name
 */
export function validateName(name: string, minLength = 1, maxLength = 100): ValidationError | null {
  if (!name || !name.trim()) {
    return { field: 'name', message: 'El nombre es requerido' };
  }
  if (name.trim().length < minLength) {
    return { field: 'name', message: `El nombre debe tener al menos ${minLength} caracteres` };
  }
  if (name.length > maxLength) {
    return { field: 'name', message: `El nombre no puede exceder ${maxLength} caracteres` };
  }
  return null;
}

/**
 * Validate numeric duration (minutes/hours)
 */
export function validateDuration(value: number, minValue = 1, maxValue = 1440): ValidationError | null {
  if (isNaN(value)) {
    return { field: 'duration', message: 'La duración debe ser un número válido' };
  }
  if (value < minValue) {
    return { field: 'duration', message: `La duración mínima es ${minValue} minutos` };
  }
  if (value > maxValue) {
    return { field: 'duration', message: `La duración máxima es ${maxValue} minutos` };
  }
  return null;
}

/**
 * Validate numeric habit goal value
 */
export function validateGoalValue(value: number, minValue = 1, maxValue = 10000): ValidationError | null {
  if (isNaN(value)) {
    return { field: 'goalValue', message: 'El valor debe ser un número válido' };
  }
  if (value < minValue) {
    return { field: 'goalValue', message: `El valor mínimo es ${minValue}` };
  }
  if (value > maxValue) {
    return { field: 'goalValue', message: `El valor máximo es ${maxValue}` };
  }
  return null;
}

/**
 * Validate frequency interval (how often habit repeats)
 */
export function validateFrequencyInterval(value: number, minValue = 1, maxValue = 365): ValidationError | null {
  if (isNaN(value)) {
    return { field: 'frequencyInterval', message: 'La frecuencia debe ser un número válido' };
  }
  if (value < minValue) {
    return { field: 'frequencyInterval', message: `La frecuencia mínima es ${minValue} día` };
  }
  if (value > maxValue) {
    return { field: 'frequencyInterval', message: `La frecuencia máxima es ${maxValue} días` };
  }
  return null;
}

/**
 * Validate date is not in the future
 */
export function validateDateNotFuture(dateStr: string, fieldName = 'date'): ValidationError | null {
  if (!dateStr) {
    return { field: fieldName, message: 'La fecha es requerida' };
  }

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    return { field: fieldName, message: 'La fecha no puede ser en el futuro' };
  }
  return null;
}

/**
 * Validate date is not too old (older than 1 year)
 */
export function validateDateNotTooOld(dateStr: string, maxDaysOld = 365, fieldName = 'date'): ValidationError | null {
  if (!dateStr) {
    return { field: fieldName, message: 'La fecha es requerida' };
  }

  const date = new Date(dateStr);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > maxDaysOld) {
    return { field: fieldName, message: `La fecha no puede ser hace más de ${maxDaysOld} días` };
  }
  return null;
}

/**
 * Validate time range (end time > start time)
 */
export function validateTimeRange(startTime: string, endTime: string): ValidationError | null {
  if (!startTime || !endTime) {
    return { field: 'timeRange', message: 'Las horas de inicio y fin son requeridas' };
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    return { field: 'timeRange', message: 'La hora de fin debe ser después de la hora de inicio' };
  }
  return null;
}

/**
 * Validate text area content
 */
export function validateTextArea(value: string, minLength = 1, maxLength = 5000, required = true): ValidationError | null {
  if (required && (!value || !value.trim())) {
    return { field: 'textarea', message: 'Este campo es requerido' };
  }

  if (value && value.length < minLength) {
    return { field: 'textarea', message: `Mínimo ${minLength} caracteres` };
  }

  if (value.length > maxLength) {
    return { field: 'textarea', message: `Máximo ${maxLength} caracteres` };
  }
  return null;
}

/**
 * Validate cycle date (not in future, not too old)
 */
export function validateCycleDate(dateStr: string): ValidationError | null {
  if (!dateStr) {
    return { field: 'cycleDate', message: 'La fecha del último período es requerida' };
  }

  const dateError = validateDateNotFuture(dateStr, 'cycleDate');
  if (dateError) return dateError;

  const dateOldError = validateDateNotTooOld(dateStr, 365, 'cycleDate');
  if (dateOldError) return dateOldError;

  return null;
}

/**
 * Validate required select field
 */
export function validateSelectRequired(value: string, fieldName = 'field'): ValidationError | null {
  if (!value || value === '') {
    return { field: fieldName, message: `Debes seleccionar una opción para ${fieldName}` };
  }
  return null;
}

/**
 * Validate cycle length range
 */
export function validateCycleLength(value: number, minValue = 21, maxValue = 35): ValidationError | null {
  if (isNaN(value)) {
    return { field: 'cycleLength', message: 'La duración del ciclo debe ser un número válido' };
  }
  if (value < minValue || value > maxValue) {
    return { field: 'cycleLength', message: `La duración del ciclo debe estar entre ${minValue} y ${maxValue} días` };
  }
  return null;
}

/**
 * Validate period length range
 */
export function validatePeriodLength(value: number, minValue = 2, maxValue = 8): ValidationError | null {
  if (isNaN(value)) {
    return { field: 'periodLength', message: 'La duración del período debe ser un número válido' };
  }
  if (value < minValue || value > maxValue) {
    return { field: 'periodLength', message: `La duración del período debe estar entre ${minValue} y ${maxValue} días` };
  }
  return null;
}

/**
 * Validate username
 */
export function validateUsername(username: string, minLength = 1, maxLength = 50): ValidationError | null {
  if (!username || !username.trim()) {
    return { field: 'username', message: 'El nombre de usuario es requerido' };
  }
  if (username.trim().length < minLength) {
    return { field: 'username', message: `El nombre debe tener al menos ${minLength} caracteres` };
  }
  if (username.length > maxLength) {
    return { field: 'username', message: `El nombre no puede exceder ${maxLength} caracteres` };
  }
  return null;
}

/**
 * Register activity validation
 */
export function validateRegisterActivity(data: {
  name: string;
  minutes: number;
  category: string;
  date: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const durationError = validateDuration(data.minutes, 1, 1440);
  if (durationError) errors.push(durationError);

  const categoryError = validateSelectRequired(data.category, 'categoría');
  if (categoryError) errors.push(categoryError);

  const dateError = validateDateNotFuture(data.date);
  if (dateError) errors.push(dateError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create habit validation
 */
export function validateCreateHabit(data: {
  name: string;
  goalValue: number;
  targetUnit: string;
  frequencyInterval?: number;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const goalError = validateGoalValue(data.goalValue);
  if (goalError) errors.push(goalError);

  const unitError = validateSelectRequired(data.targetUnit, 'unidad');
  if (unitError) errors.push(unitError);

  if (data.frequencyInterval) {
    const freqError = validateFrequencyInterval(data.frequencyInterval);
    if (freqError) errors.push(freqError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Activate cycle validation
 */
export function validateActivateCycle(data: {
  lastPeriod: string;
  cycleLength: number;
  periodLength: number;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const dateError = validateCycleDate(data.lastPeriod);
  if (dateError) errors.push(dateError);

  const cycleLenError = validateCycleLength(data.cycleLength);
  if (cycleLenError) errors.push(cycleLenError);

  const periodLenError = validatePeriodLength(data.periodLength);
  if (periodLenError) errors.push(periodLenError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get error message for a specific field
 */
export function getErrorForField(errors: ValidationError[], fieldName: string): string | null {
  const error = errors.find(e => e.field === fieldName);
  return error ? error.message : null;
}

/**
 * Check if field has error
 */
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(e => e.field === fieldName);
}

/**
 * Validate activity duration is positive
 */
export function validateActivityDuration(duration: number | undefined): ValidationError | null {
  if (duration === undefined || duration === null) {
    return { field: 'duration', message: 'La duración es requerida' };
  }
  if (duration <= 0) {
    return { field: 'duration', message: 'La duración debe ser mayor que 0' };
  }
  if (duration > 1440) {
    return { field: 'duration', message: 'La duración no puede exceder 24 horas (1440 minutos)' };
  }
  return null;
}

/**
 * Validate activity unit is valid
 */
export function validateActivityUnit(unit: string | undefined): ValidationError | null {
  const validUnits = ['min', 'hs'];
  if (!unit || !validUnits.includes(unit)) {
    return { field: 'unit', message: 'La unidad debe ser "min" (minutos) o "hs" (horas)' };
  }
  return null;
}

/**
 * Validate activity category is valid
 */
export function validateActivityCategory(category: string | undefined): ValidationError | null {
  const validCategories = ['bienestar', 'trabajo', 'creatividad', 'social', 'aprendizaje', 'deporte', 'hogar', 'otro'];
  if (!category || !validCategories.includes(category)) {
    return { field: 'categoria', message: 'Debes seleccionar una categoría válida' };
  }
  return null;
}

/**
 * Validate cycle phase is valid
 */
export function validateCyclePhase(phase: string | undefined): ValidationError | null {
  const validPhases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  if (!phase || !validPhases.includes(phase)) {
    return { field: 'phase', message: 'La fase del ciclo debe ser válida' };
  }
  return null;
}

/**
 * Validate cycle data consistency
 */
export function validateCycleDataConsistency(data: {
  lastPeriodStart: string;
  cycleLengthDays: number;
  periodLengthDays: number;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const dateError = validateCycleDate(data.lastPeriodStart);
  if (dateError) errors.push(dateError);

  const cycleLenError = validateCycleLength(data.cycleLengthDays);
  if (cycleLenError) errors.push(cycleLenError);

  const periodLenError = validatePeriodLength(data.periodLengthDays);
  if (periodLenError) errors.push(periodLenError);

  // Check that period length is less than cycle length
  if (data.periodLengthDays >= data.cycleLengthDays) {
    errors.push({
      field: 'periodLength',
      message: `La duración del período (${data.periodLengthDays} días) no puede ser mayor o igual a la del ciclo (${data.cycleLengthDays} días)`
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive activity validation
 */
export function validateActivityComprehensive(data: {
  name?: string;
  duration?: number;
  unit?: string;
  categoria?: string;
  date?: string;
  color?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.name) {
    const nameError = validateName(data.name);
    if (nameError) errors.push(nameError);
  }

  if (data.duration !== undefined) {
    const durationError = validateActivityDuration(data.duration);
    if (durationError) errors.push(durationError);
  }

  if (data.unit) {
    const unitError = validateActivityUnit(data.unit);
    if (unitError) errors.push(unitError);
  }

  if (data.categoria) {
    const categoryError = validateActivityCategory(data.categoria);
    if (categoryError) errors.push(categoryError);
  }

  if (data.date) {
    const dateError = validateDateNotFuture(data.date);
    if (dateError) errors.push(dateError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
