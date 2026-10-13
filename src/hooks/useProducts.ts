import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  fetchProducts,
  PAGE_SIZE,
  ProductPage,
  ProductSummary,
} from '../api/products';
import { getErrorMessage } from './getErrorMessage';

export interface ProductsState {
  items: ProductSummary[];
  total: number;
  status: 'loading' | 'success' | 'error';
  // Set when the first page fails. Shown full screen if there is nothing
  // to display yet, or as a banner above stale data after a failed refresh.
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
}

type Action =
  | { type: 'FETCH_START'; mode: 'initial' | 'refresh' }
  | { type: 'FETCH_SUCCESS'; page: ProductPage }
  | { type: 'FETCH_FAILURE'; error: string }
  | { type: 'MORE_START' }
  | { type: 'MORE_SUCCESS'; page: ProductPage }
  | { type: 'MORE_FAILURE'; error: string };

export const initialState: ProductsState = {
  items: [],
  total: 0,
  status: 'loading',
  error: null,
  refreshing: false,
  loadingMore: false,
  loadMoreError: null,
};

export function productsReducer(
  state: ProductsState,
  action: Action,
): ProductsState {
  switch (action.type) {
    case 'FETCH_START':
      return action.mode === 'initial'
        ? { ...state, status: 'loading', error: null, loadingMore: false }
        : { ...state, refreshing: true, loadingMore: false };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        items: action.page.products,
        total: action.page.total,
        status: 'success',
        error: null,
        refreshing: false,
        loadMoreError: null,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        status: state.items.length > 0 ? 'success' : 'error',
        error: action.error,
        refreshing: false,
      };
    case 'MORE_START':
      return { ...state, loadingMore: true, loadMoreError: null };
    case 'MORE_SUCCESS': {
      const seen = new Set(state.items.map(item => item.id));
      const fresh = action.page.products.filter(item => !seen.has(item.id));
      return {
        ...state,
        items: [...state.items, ...fresh],
        total: action.page.total,
        loadingMore: false,
      };
    }
    case 'MORE_FAILURE':
      return { ...state, loadingMore: false, loadMoreError: action.error };
  }
}

export function useProducts() {
  const [state, dispatch] = useReducer(productsReducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  const startRequest = () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  const loadFirstPage = useCallback(async (mode: 'initial' | 'refresh') => {
    const controller = startRequest();
    dispatch({ type: 'FETCH_START', mode });
    try {
      const page = await fetchProducts(0, PAGE_SIZE, controller.signal);
      if (!controller.signal.aborted) {
        dispatch({ type: 'FETCH_SUCCESS', page });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        dispatch({ type: 'FETCH_FAILURE', error: getErrorMessage(error) });
      }
    }
  }, []);

  const hasMore = state.items.length < state.total;
  const canLoadMore =
    state.status === 'success' &&
    hasMore &&
    !state.refreshing &&
    !state.loadingMore &&
    !state.loadMoreError;
  const offset = state.items.length;

  const loadMore = useCallback(
    async (force = false) => {
      if (!canLoadMore && !force) {
        return;
      }
      const controller = startRequest();
      dispatch({ type: 'MORE_START' });
      try {
        const page = await fetchProducts(offset, PAGE_SIZE, controller.signal);
        if (!controller.signal.aborted) {
          dispatch({ type: 'MORE_SUCCESS', page });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          dispatch({ type: 'MORE_FAILURE', error: getErrorMessage(error) });
        }
      }
    },
    [canLoadMore, offset],
  );

  useEffect(() => {
    loadFirstPage('initial');
    return () => controllerRef.current?.abort();
  }, [loadFirstPage]);

  return {
    ...state,
    hasMore,
    retry: useCallback(() => loadFirstPage('initial'), [loadFirstPage]),
    refresh: useCallback(() => loadFirstPage('refresh'), [loadFirstPage]),
    loadMore: useCallback(() => loadMore(), [loadMore]),
    retryLoadMore: useCallback(() => loadMore(true), [loadMore]),
  };
}
