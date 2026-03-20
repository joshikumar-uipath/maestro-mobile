interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  totalCount?: number;
  itemCount: number;
}

export function PaginationControls({
  hasNextPage, hasPreviousPage, onNext, onPrevious, isLoading, totalCount, itemCount,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
      <span className="text-xs text-gray-500">
        {totalCount !== undefined ? `${itemCount} of ${totalCount}` : `${itemCount} items`}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={!hasPreviousPage || isLoading}
          className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
