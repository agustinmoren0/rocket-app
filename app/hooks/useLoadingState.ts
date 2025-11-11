import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

interface UseLoadingStateReturn {
  state: LoadingState;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (data: any) => void;
  reset: () => void;
  execute: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Hook para manejar estados de carga (loading, error, data) de forma reutilizable
 *
 * Ejemplo:
 * const { state, execute } = useLoadingState();
 *
 * const handleLoad = async () => {
 *   await execute(async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   });
 * };
 */
export function useLoadingState(): UseLoadingStateReturn {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: any) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  const execute = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [setLoading, setError]);

  return {
    state,
    setLoading,
    setError,
    setData,
    reset,
    execute,
  };
}
