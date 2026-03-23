interface PaginationControlsProps {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
    isLoading: boolean;
    totalCount?: number;
    itemCount: number;
}
export declare function PaginationControls({ hasNextPage, hasPreviousPage, onNext, onPrevious, isLoading, totalCount, itemCount, }: PaginationControlsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PaginationControls.d.ts.map