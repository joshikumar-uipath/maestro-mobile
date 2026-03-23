"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePagination = usePagination;
const react_1 = require("react");
function usePagination({ fetchFn, pageSize = 20 }) {
    const [items, setItems] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [nextCursor, setNextCursor] = (0, react_1.useState)();
    const [prevCursors, setPrevCursors] = (0, react_1.useState)([]);
    const [currentCursor, setCurrentCursor] = (0, react_1.useState)();
    const [hasNextPage, setHasNextPage] = (0, react_1.useState)(false);
    const [totalCount, setTotalCount] = (0, react_1.useState)();
    const [initialized, setInitialized] = (0, react_1.useState)(false);
    const fetchPage = (0, react_1.useCallback)(async (cursor) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFn({ pageSize, cursor });
            setItems(result.items);
            setNextCursor(result.nextCursor);
            setHasNextPage(result.hasNextPage);
            setTotalCount(result.totalCount);
            setCurrentCursor(cursor);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setIsLoading(false);
            setInitialized(true);
        }
    }, [fetchFn, pageSize]);
    // Load first page on mount
    (0, react_1.useState)(() => {
        if (!initialized) {
            fetchPage();
        }
    });
    const goToNextPage = (0, react_1.useCallback)(async () => {
        if (!nextCursor)
            return;
        setPrevCursors(prev => currentCursor ? [...prev, currentCursor] : prev);
        await fetchPage(nextCursor);
    }, [nextCursor, currentCursor, fetchPage]);
    const goToPreviousPage = (0, react_1.useCallback)(async () => {
        if (prevCursors.length === 0)
            return;
        const newPrevCursors = [...prevCursors];
        const prevCursor = newPrevCursors.pop();
        setPrevCursors(newPrevCursors);
        await fetchPage(prevCursor);
    }, [prevCursors, fetchPage]);
    const refresh = (0, react_1.useCallback)(() => fetchPage(currentCursor), [currentCursor, fetchPage]);
    return {
        items, isLoading, error, hasNextPage,
        hasPreviousPage: prevCursors.length > 0,
        goToNextPage, goToPreviousPage, refresh, totalCount,
    };
}
//# sourceMappingURL=usePagination.js.map