/**
 * JSON Optimization Utilities
 * Reduces serialization overhead and improves storage efficiency
 */

/**
 * Compress JSON by removing unnecessary whitespace and comments
 */
export function compressJson(obj: any): string {
  return JSON.stringify(obj);
}

/**
 * Decompress JSON string
 */
export function decompressJson<T>(jsonStr: string): T {
  return JSON.parse(jsonStr);
}

/**
 * Calculate JSON size in bytes
 */
export function getJsonSize(obj: any): number {
  return new Blob([JSON.stringify(obj)]).size;
}

/**
 * Estimate localStorage usage
 */
export function estimateStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
  items: number;
} {
  let used = 0;
  let items = 0;

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
      items++;
    }
  }

  // Most browsers limit to 5-10MB
  const available = 5242880; // 5MB default

  return {
    used,
    available,
    percentage: (used / available) * 100,
    items,
  };
}

/**
 * Optimize object by removing null/undefined values
 */
export function optimizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const optimized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip null, undefined, empty strings, empty arrays
    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      optimized[key as keyof T] = value;
    }
  }

  return optimized;
}

/**
 * Deep clone object (optimized for serialization)
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Deep clone failed, returning original:', error);
    return obj;
  }
}

/**
 * Selective serialization - only serialize changed fields
 */
export function getDifferences<T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> {
  const diff: Partial<T> = {};

  for (const key in updated) {
    if (updated.hasOwnProperty(key)) {
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        diff[key] = updated[key];
      }
    }
  }

  return diff;
}

/**
 * Batch serialize multiple objects efficiently
 */
export function batchSerialize<T>(items: T[]): string {
  return JSON.stringify(items);
}

/**
 * Batch deserialize with error recovery
 */
export function batchDeserialize<T>(jsonStr: string, itemRepair?: (item: any) => T): T[] {
  try {
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      console.warn('Expected array, got:', typeof parsed);
      return [];
    }

    if (itemRepair) {
      return parsed.map((item, index) => {
        try {
          return itemRepair(item);
        } catch (error) {
          console.warn(`Error repairing item ${index}:`, error);
          return itemRepair({});
        }
      });
    }

    return parsed;
  } catch (error) {
    console.error('Batch deserialize failed:', error);
    return [];
  }
}

/**
 * Lazy serialize - only stringify when needed
 */
export class LazyJson<T> {
  private original: T;
  private serialized: string | null = null;
  private isDirty = false;

  constructor(data: T) {
    this.original = data;
  }

  getData(): T {
    return this.original;
  }

  setData(data: T): void {
    this.original = data;
    this.isDirty = true;
    this.serialized = null;
  }

  toString(): string {
    if (!this.serialized || this.isDirty) {
      this.serialized = JSON.stringify(this.original);
      this.isDirty = false;
    }
    return this.serialized;
  }

  getSize(): number {
    return this.toString().length;
  }
}

/**
 * Deduplicate repeated values in arrays
 */
export function deduplicateArrays<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };

  for (const [key, value] of Object.entries(result)) {
    if (Array.isArray(value)) {
      result[key as keyof T] = [...new Set(value)] as any;
    }
  }

  return result;
}

/**
 * Compress string arrays by storing indices instead of repeated values
 */
export function compressStringArray(arr: string[]): { values: string[]; indices: number[] } {
  const uniqueValues = [...new Set(arr)];
  const indices = arr.map((item) => uniqueValues.indexOf(item));
  return { values: uniqueValues, indices };
}

/**
 * Decompress string array from compressed format
 */
export function decompressStringArray(compressed: {
  values: string[];
  indices: number[];
}): string[] {
  return compressed.indices.map((idx) => compressed.values[idx]);
}

/**
 * Incremental update - only serialize changed data
 */
export function createIncrementalUpdate<T extends Record<string, any>>(
  previous: T,
  current: T
): { timestamp: number; changes: Partial<T> } {
  return {
    timestamp: Date.now(),
    changes: getDifferences(previous, current),
  };
}

/**
 * Apply incremental updates
 */
export function applyIncrementalUpdates<T extends Record<string, any>>(
  base: T,
  updates: Array<{ timestamp: number; changes: Partial<T> }>
): T {
  let result = { ...base };

  for (const update of updates) {
    result = { ...result, ...update.changes };
  }

  return result;
}

/**
 * Estimate compression ratio
 */
export function estimateCompressionRatio(original: any): {
  original: number;
  optimized: number;
  reduction: number;
  ratio: string;
} {
  const originalSize = getJsonSize(original);
  const optimized = optimizeObject(original);
  const optimizedSize = getJsonSize(optimized);
  const reduction = originalSize - optimizedSize;
  const ratio = `${((reduction / originalSize) * 100).toFixed(2)}%`;

  return {
    original: originalSize,
    optimized: optimizedSize,
    reduction,
    ratio,
  };
}
