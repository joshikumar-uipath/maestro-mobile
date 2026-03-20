import { useState, useCallback } from 'react';
import type { PaginatedResponse, PaginationCursor } from '@uipath/uipath-typescript/core';

interface UsePaginationOptions<T> {
  fetchFn: (params: { pageSize: number; cursor?: PaginationCursor }) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
}

interface UsePaginationResult<T> {
  items: T[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount?: number;
}

export function usePagination<T>({ fetchFn, pageSize = 20 }: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<PaginationCursor | undefined>();
  const [prevCursors, setPrevCursors] = useState<PaginationCursor[]>([]);
  const [currentCursor, setCurrentCursor] = useState<PaginationCursor | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [initialized, setInitialized] = useState(false);

  const fetchPage = useCallback(async (cursor?: PaginationCursor) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn({ pageSize, cursor });
      setItems(result.items);
      setNextCursor(result.nextCursor);
      setHasNextPage(result.hasNextPage);
      setTotalCount(result.totalCount);
      setCurrentCursor(cursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [fetchFn, pageSize]);

  // Load first page on mount
  useState(() => {
    if (!initialized) {
      fetchPage();
    }
  });

  const goToNextPage = useCallback(async () => {
    if (!nextCursor) return;
    setPrevCursors(prev => currentCursor ? [...prev, currentCursor] : prev);
    await fetchPage(nextCursor);
  }, [nextCursor, currentCursor, fetchPage]);

  const goToPreviousPage = useCallback(async () => {
    if (prevCursors.length === 0) return;
    const newPrevCursors = [...prevCursors];
    const prevCursor = newPrevCursors.pop();
    setPrevCursors(newPrevCursors);
    await fetchPage(prevCursor);
  }, [prevCursors, fetchPage]);

  const refresh = useCallback(() => fetchPage(currentCursor), [currentCursor, fetchPage]);

  return {
    items, isLoading, error, hasNextPage,
    hasPreviousPage: prevCursors.length > 0,
    goToNextPage, goToPreviousPage, refresh, totalCount,
  };
}
