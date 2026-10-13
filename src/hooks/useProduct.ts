import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProduct, Product } from '../api/products';
import { getErrorMessage } from './getErrorMessage';

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (mode === 'initial') {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      try {
        const result = await fetchProduct(id, controller.signal);
        if (!controller.signal.aborted) {
          setProduct(result);
          setError(null);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(e));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    load('initial');
    return () => controllerRef.current?.abort();
  }, [load]);

  return {
    product,
    loading,
    refreshing,
    error,
    retry: useCallback(() => load('initial'), [load]),
    refresh: useCallback(() => load('refresh'), [load]),
  };
}
