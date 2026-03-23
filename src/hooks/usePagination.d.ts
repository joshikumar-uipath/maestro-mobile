import type { PaginatedResponse, PaginationCursor } from '@uipath/uipath-typescript/core';
interface UsePaginationOptions<T> {
    fetchFn: (params: {
        pageSize: number;
        cursor?: PaginationCursor;
    }) => Promise<PaginatedResponse<T>>;
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
export declare function usePagination<T>({ fetchFn, pageSize }: UsePaginationOptions<T>): UsePaginationResult<T>;
export {};
//# sourceMappingURL=usePagination.d.ts.map