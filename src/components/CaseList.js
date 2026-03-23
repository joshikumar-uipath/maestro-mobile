"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseList = CaseList;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const cases_1 = require("@uipath/uipath-typescript/cases");
const StatusBadge_1 = require("./StatusBadge");
const CaseDetail_1 = require("./CaseDetail");
const timePeriod_1 = require("../utils/timePeriod");
function formatTime(iso) {
    if (!iso)
        return '—';
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function getCaseTypeStyle(caseType) {
    if (!caseType)
        return { badge: 'bg-teal-100 text-teal-700 border border-teal-200', bar: 'bg-teal-500' };
    const hash = Array.from(caseType).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const palettes = [
        { badge: 'bg-orange-100 text-orange-700 border border-orange-200', bar: 'bg-orange-500' },
        { badge: 'bg-teal-100 text-teal-700 border border-teal-200', bar: 'bg-teal-500' },
        { badge: 'bg-rose-100 text-rose-700 border border-rose-200', bar: 'bg-rose-500' },
        { badge: 'bg-amber-100 text-amber-700 border border-amber-200', bar: 'bg-amber-500' },
        { badge: 'bg-cyan-100 text-cyan-700 border border-cyan-200', bar: 'bg-cyan-500' },
        { badge: 'bg-lime-100 text-lime-700 border border-lime-200', bar: 'bg-lime-500' },
    ];
    return palettes[hash % palettes.length];
}
function isActive(status) {
    return status === 'Running' || status === 'Open';
}
function isCompleted(status) {
    return status === 'Completed' || status === 'Successful' || status === 'Closed';
}
// ── Light orange header ────────────────────────────────────────────────────────
function CaseHeader({ totalCount, metrics, statusFilter, onStatusFilter, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-end justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold text-gray-900", children: "Cases" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: "UiPath Maestro" })] }), metrics.active > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }), metrics.active, " active"] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter('all'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'all' ? 'bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-gray-800'}`, children: totalCount }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'all' ? 'text-gray-300' : 'text-gray-400'}`, children: "Total" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'active' ? 'all' : 'active'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'active' ? 'bg-green-600' : metrics.active > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'active' ? 'text-white' : metrics.active > 0 ? 'text-green-700' : 'text-gray-400'}`, children: metrics.active }), metrics.active > 0 && statusFilter !== 'active' && ((0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }))] }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'active' ? 'text-green-100' : metrics.active > 0 ? 'text-green-600' : 'text-gray-400'}`, children: "Active" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'completed' ? 'all' : 'completed'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'completed' ? 'bg-gray-800' : metrics.completed > 0 ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'completed' ? 'text-white' : metrics.completed > 0 ? 'text-gray-700' : 'text-gray-400'}`, children: metrics.completed }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'completed' ? 'text-gray-300' : metrics.completed > 0 ? 'text-gray-500' : 'text-gray-400'}`, children: "Resolved" })] })] })] }));
}
// ── Case type group ───────────────────────────────────────────────────────────
function CaseTypeGroup({ caseType, items, open, onToggle, onSelect, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-1", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onToggle, className: "w-full flex items-center gap-2 px-4 py-2.5 text-left", children: [(0, jsx_runtime_1.jsx)("svg", { className: `w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`, fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight", children: caseType }), (0, jsx_runtime_1.jsx)("span", { className: "bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px] shrink-0", children: items.length })] }), open && ((0, jsx_runtime_1.jsx)("div", { className: "pb-1", children: items.map(inst => {
                    const cardStyle = getCaseTypeStyle(caseType === 'No Type' ? null : caseType);
                    return ((0, jsx_runtime_1.jsx)("div", { className: "mx-3 mb-2", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => onSelect(inst), className: "w-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 px-3.5 py-3.5", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-10 h-10 rounded-xl ${cardStyle.bar} bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm`, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-900 leading-tight line-clamp-1", children: inst.caseTitle || inst.instanceDisplayName || inst.instanceId }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 mt-0.5", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3 text-gray-300 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400 truncate", children: inst.startedByUser || 'Unknown' }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-200 shrink-0", children: "\u00B7" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400 shrink-0", children: formatTime(inst.startedTime) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: inst.latestRunStatus }) })] }) }) }, inst.instanceId));
                }) }))] }));
}
// ── Main component ────────────────────────────────────────────────────────────
function CaseList({ timePeriod }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const caseInstances = (0, react_1.useMemo)(() => new cases_1.CaseInstances(sdk), [sdk]);
    const [allItems, setAllItems] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [hasNextPage, setHasNextPage] = (0, react_1.useState)(false);
    const [nextCursor, setNextCursor] = (0, react_1.useState)();
    const [prevCursors, setPrevCursors] = (0, react_1.useState)([]);
    const [currentCursor, setCurrentCursor] = (0, react_1.useState)();
    const [totalCount, setTotalCount] = (0, react_1.useState)();
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [openGroups, setOpenGroups] = (0, react_1.useState)(new Set());
    const allGroupsRef = (0, react_1.useRef)([]);
    const [fullItems, setFullItems] = (0, react_1.useState)([]);
    const [isLoadingFull, setIsLoadingFull] = (0, react_1.useState)(false);
    const [listKey, setListKey] = (0, react_1.useState)(0);
    const prevPeriodRef = (0, react_1.useRef)(timePeriod);
    const fetchPage = (0, react_1.useCallback)(async (cursor) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await caseInstances.getAll({ pageSize: 50, cursor });
            if ('hasNextPage' in result) {
                setAllItems(result.items);
                setHasNextPage(result.hasNextPage);
                setNextCursor(result.nextCursor);
                setTotalCount(result.totalCount);
                setCurrentCursor(cursor);
                setFullItems([]); // reset full cache on page change
                const groups = Array.from(new Set(result.items.map(i => i.caseType || 'No Type')));
                allGroupsRef.current = groups;
                setOpenGroups(new Set());
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cases');
        }
        finally {
            setIsLoading(false);
        }
    }, [caseInstances]);
    (0, react_1.useEffect)(() => { fetchPage(); }, [fetchPage]);
    // Fetch all cases when a status filter OR time period filter is active
    (0, react_1.useEffect)(() => {
        const needsFull = statusFilter !== 'all' || timePeriod !== 'all';
        if (!needsFull || fullItems.length > 0 || isLoadingFull)
            return;
        setIsLoadingFull(true);
        caseInstances.getAll()
            .then(result => setFullItems(result.items))
            .catch(() => { })
            .finally(() => setIsLoadingFull(false));
    }, [statusFilter, timePeriod, fullItems.length, isLoadingFull, caseInstances]);
    // Reset visible groups and flash list when time period changes
    (0, react_1.useEffect)(() => {
        if (prevPeriodRef.current === timePeriod)
            return;
        prevPeriodRef.current = timePeriod;
        setOpenGroups(new Set());
        setListKey(k => k + 1);
    }, [timePeriod]);
    const goToNext = (0, react_1.useCallback)(async () => {
        if (!nextCursor)
            return;
        setPrevCursors(prev => currentCursor ? [...prev, currentCursor] : prev);
        await fetchPage(nextCursor);
    }, [nextCursor, currentCursor, fetchPage]);
    const goToPrev = (0, react_1.useCallback)(async () => {
        if (prevCursors.length === 0)
            return;
        const newPrev = [...prevCursors];
        const prev = newPrev.pop();
        setPrevCursors(newPrev);
        await fetchPage(prev);
    }, [prevCursors, fetchPage]);
    const needsFull = statusFilter !== 'all' || timePeriod !== 'all';
    const baseList = needsFull ? fullItems : allItems;
    const baseCount = needsFull ? fullItems.length : (totalCount ?? allItems.length);
    const filteredTotal = (0, react_1.useMemo)(() => {
        const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
        const base = needsFull && fullItems.length > 0 ? fullItems : allItems;
        if (!startDate)
            return base.length;
        return base.filter(i => i.startedTime && new Date(i.startedTime) >= startDate).length;
    }, [fullItems, allItems, timePeriod, needsFull]);
    const caseMetrics = (0, react_1.useMemo)(() => {
        const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
        let base = needsFull && fullItems.length > 0 ? fullItems : allItems;
        if (startDate)
            base = base.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
        return {
            active: base.filter(i => isActive(i.latestRunStatus)).length,
            completed: base.filter(i => isCompleted(i.latestRunStatus)).length,
        };
    }, [allItems, fullItems, statusFilter, timePeriod, needsFull]);
    const filtered = (0, react_1.useMemo)(() => {
        const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
        let list = baseList;
        if (startDate)
            list = list.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
        if (statusFilter === 'active')
            list = list.filter(i => isActive(i.latestRunStatus));
        if (statusFilter === 'completed')
            list = list.filter(i => isCompleted(i.latestRunStatus));
        if (!search.trim())
            return list;
        const q = search.toLowerCase();
        return list.filter(i => i.caseTitle?.toLowerCase().includes(q) ||
            i.caseType?.toLowerCase().includes(q) ||
            i.instanceDisplayName?.toLowerCase().includes(q) ||
            i.startedByUser?.toLowerCase().includes(q));
    }, [baseList, search, statusFilter, timePeriod]);
    const grouped = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const i of filtered) {
            const key = i.caseType || 'No Type';
            if (!map.has(key))
                map.set(key, []);
            map.get(key).push(i);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);
    if (isLoading && allItems.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full gap-3 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-orange-500" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading cases..." })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 font-medium mb-1", children: "Failed to load" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mb-3", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: () => fetchPage(), className: "text-xs bg-orange-700 text-white px-4 py-1.5 rounded-full font-medium", children: "Retry" })] }));
    }
    const hasPreviousPage = prevCursors.length > 0;
    const allCollapsed = openGroups.size === 0;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(CaseHeader, { totalCount: filteredTotal, metrics: caseMetrics, statusFilter: statusFilter, onStatusFilter: setStatusFilter }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white border-b border-gray-100 shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "px-3 pt-3 pb-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("svg", { className: "absolute left-3 top-1/2 -trangray-y-1/2 w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Search cases...", className: "w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors" }), search && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSearch(''), className: "absolute right-2.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 8.586L4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586z", clipRule: "evenodd" }) }) }))] }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 flex items-center justify-between bg-gray-50 shrink-0 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 font-medium flex items-center gap-1.5", children: [isLoadingFull && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" }), search || statusFilter !== 'all' ? `${filtered.length} of ` : '', filteredTotal, " cases"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => allCollapsed ? setOpenGroups(new Set(allGroupsRef.current)) : setOpenGroups(new Set()), className: "text-xs text-orange-600 font-semibold flex items-center gap-1 hover:text-orange-900", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: allCollapsed
                                            ? (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                                            : (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" }) }), allCollapsed ? 'Expand all' : 'Collapse all'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4 animate-[fadeIn_0.2s_ease-out]", style: { animationFillMode: 'both' }, children: [isLoadingFull && fullItems.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center py-16 gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-orange-500" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading all cases..." })] })) : grouped.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-10 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: search || statusFilter !== 'all' ? 'No matches found' : 'No case instances found' })] })) : (grouped.map(([caseType, items]) => ((0, jsx_runtime_1.jsx)(CaseTypeGroup, { caseType: caseType, items: items, open: openGroups.has(caseType), onToggle: () => setOpenGroups(prev => {
                                    const next = new Set(prev);
                                    next.has(caseType) ? next.delete(caseType) : next.add(caseType);
                                    return next;
                                }), onSelect: setSelected }, caseType)))), (hasNextPage || hasPreviousPage) && statusFilter === 'all' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mx-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: goToPrev, disabled: !hasPreviousPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-orange-700", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] }), isLoading && (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-orange-500" }), (0, jsx_runtime_1.jsxs)("button", { onClick: goToNext, disabled: !hasNextPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-orange-700", children: ["Next", (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }))] }, listKey)] }), selected && ((0, jsx_runtime_1.jsx)(CaseDetail_1.CaseDetail, { instance: selected, onClose: () => setSelected(null) }))] }));
}
//# sourceMappingURL=CaseList.js.map