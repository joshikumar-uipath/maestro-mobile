"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceList = InstanceList;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const maestro_processes_1 = require("@uipath/uipath-typescript/maestro-processes");
const StatusBadge_1 = require("./StatusBadge");
const InstanceDetail_1 = require("./InstanceDetail");
const timePeriod_1 = require("../utils/timePeriod");
function formatTime(iso) {
    if (!iso)
        return '—';
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
// ── Light violet header ────────────────────────────────────────────────────────
function InstanceHeader({ totalCount, metrics, statusFilter, onStatusFilter, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-end justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold text-gray-900", children: "Agent Runs" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: "UiPath Maestro" })] }), metrics.running > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }), metrics.running, " active"] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter('all'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'all' ? 'bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-gray-800'}`, children: totalCount }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'all' ? 'text-gray-300' : 'text-gray-400'}`, children: "Total" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'running' ? 'all' : 'running'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'running' ? 'bg-green-600' : metrics.running > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'running' ? 'text-white' : metrics.running > 0 ? 'text-green-700' : 'text-gray-400'}`, children: metrics.running }), metrics.running > 0 && statusFilter !== 'running' && ((0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }))] }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'running' ? 'text-green-100' : metrics.running > 0 ? 'text-green-600' : 'text-gray-400'}`, children: "Active" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'faulted' ? 'all' : 'faulted'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'faulted' ? 'bg-red-600' : metrics.faulted > 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'faulted' ? 'text-white' : metrics.faulted > 0 ? 'text-red-600' : 'text-gray-400'}`, children: metrics.faulted }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'faulted' ? 'text-red-100' : metrics.faulted > 0 ? 'text-red-400' : 'text-gray-400'}`, children: "Failed" })] })] })] }));
}
// ── Folder group ──────────────────────────────────────────────────────────────
function FolderGroup({ folderName, items, open, onToggle, onSelect, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-1", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onToggle, className: "w-full flex items-center gap-2 px-4 py-2.5 text-left", children: [(0, jsx_runtime_1.jsx)("svg", { className: `w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`, fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight", children: folderName }), (0, jsx_runtime_1.jsx)("span", { className: "bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px] shrink-0", children: items.length })] }), open && ((0, jsx_runtime_1.jsx)("div", { className: "pb-1", children: items.map(inst => ((0, jsx_runtime_1.jsx)("div", { className: "mx-3 mb-2", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => onSelect(inst), className: "w-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 px-3.5 py-3.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-900 leading-tight line-clamp-1", children: inst.instanceDisplayName || inst.instanceId }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 mt-0.5", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3 text-gray-300 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400 truncate", children: inst.startedByUser || 'Unknown' }), (0, jsx_runtime_1.jsx)("span", { className: "text-gray-200 shrink-0", children: "\u00B7" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400 shrink-0", children: formatTime(inst.startedTime) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: inst.latestRunStatus }) })] }) }) }, inst.instanceId))) }))] }));
}
// ── Main component ────────────────────────────────────────────────────────────
function InstanceList({ timePeriod }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const processInstances = (0, react_1.useMemo)(() => new maestro_processes_1.ProcessInstances(sdk), [sdk]);
    const maestroProcesses = (0, react_1.useMemo)(() => new maestro_processes_1.MaestroProcesses(sdk), [sdk]);
    const [folderNames, setFolderNames] = (0, react_1.useState)(new Map());
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
    const [openFolders, setOpenFolders] = (0, react_1.useState)(new Set());
    const allFoldersRef = (0, react_1.useRef)([]);
    const [fullItems, setFullItems] = (0, react_1.useState)([]);
    const [isLoadingFull, setIsLoadingFull] = (0, react_1.useState)(false);
    const [listKey, setListKey] = (0, react_1.useState)(0);
    const prevPeriodRef = (0, react_1.useRef)(timePeriod);
    const fetchPage = (0, react_1.useCallback)(async (cursor) => {
        setIsLoading(true);
        setError(null);
        try {
            const [result, maestroList] = await Promise.all([
                processInstances.getAll({ pageSize: 50, cursor }),
                folderNames.size === 0
                    ? maestroProcesses.getAll().catch(() => [])
                    : Promise.resolve(null),
            ]);
            if (maestroList) {
                const map = new Map();
                for (const mp of maestroList)
                    map.set(mp.folderKey, mp.folderName);
                setFolderNames(map);
            }
            if ('hasNextPage' in result) {
                setAllItems(result.items);
                setHasNextPage(result.hasNextPage);
                setNextCursor(result.nextCursor);
                setTotalCount(result.totalCount);
                setCurrentCursor(cursor);
                setFullItems([]); // reset full cache on page change
                if (maestroList) {
                    const folders = Array.from(new Set(result.items.map(i => maestroList.find(mp => mp.folderKey === i.folderKey)?.folderName || i.folderKey || 'Unknown Folder')));
                    allFoldersRef.current = folders;
                    setOpenFolders(new Set());
                }
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load instances');
        }
        finally {
            setIsLoading(false);
        }
    }, [processInstances, maestroProcesses, folderNames.size]);
    (0, react_1.useEffect)(() => { fetchPage(); }, [fetchPage]);
    // Fetch all instances when a status filter OR time period filter is active
    (0, react_1.useEffect)(() => {
        const needsFull = statusFilter !== 'all' || timePeriod !== 'all';
        if (!needsFull || fullItems.length > 0 || isLoadingFull)
            return;
        setIsLoadingFull(true);
        processInstances.getAll()
            .then(result => setFullItems(result.items))
            .catch(() => { })
            .finally(() => setIsLoadingFull(false));
    }, [statusFilter, timePeriod, fullItems.length, isLoadingFull, processInstances]);
    // Reset visible folders and flash list when time period changes
    (0, react_1.useEffect)(() => {
        if (prevPeriodRef.current === timePeriod)
            return;
        prevPeriodRef.current = timePeriod;
        setOpenFolders(new Set());
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
    // Metrics computed from the full set, with time filter applied
    const instanceMetrics = (0, react_1.useMemo)(() => {
        const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
        let base = needsFull && fullItems.length > 0 ? fullItems : allItems;
        if (startDate)
            base = base.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
        return {
            running: base.filter(i => i.latestRunStatus === 'Running').length,
            faulted: base.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed').length,
        };
    }, [allItems, fullItems, statusFilter, timePeriod, needsFull]);
    const filtered = (0, react_1.useMemo)(() => {
        const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
        let list = baseList;
        if (startDate)
            list = list.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
        if (statusFilter === 'running')
            list = list.filter(i => i.latestRunStatus === 'Running');
        if (statusFilter === 'faulted')
            list = list.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed');
        if (!search.trim())
            return list;
        const q = search.toLowerCase();
        return list.filter(i => i.instanceDisplayName?.toLowerCase().includes(q) ||
            i.processKey?.toLowerCase().includes(q) ||
            i.startedByUser?.toLowerCase().includes(q));
    }, [baseList, search, statusFilter, timePeriod]);
    const grouped = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const i of filtered) {
            const folder = folderNames.get(i.folderKey) || i.folderKey || 'Unknown Folder';
            if (!map.has(folder))
                map.set(folder, []);
            map.get(folder).push(i);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered, folderNames]);
    if (isLoading && allItems.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full gap-3 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-green-200 border-t-green-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading instances..." })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 font-medium mb-1", children: "Failed to load" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mb-3", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: () => fetchPage(), className: "text-xs bg-green-700 text-white px-4 py-1.5 rounded-full font-medium", children: "Retry" })] }));
    }
    const hasPreviousPage = prevCursors.length > 0;
    const allCollapsed = openFolders.size === 0;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(InstanceHeader, { totalCount: filteredTotal, metrics: instanceMetrics, statusFilter: statusFilter, onStatusFilter: setStatusFilter }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white border-b border-gray-100 shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "px-3 pt-3 pb-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("svg", { className: "absolute left-3 top-1/2 -trangray-y-1/2 w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Search instances...", className: "w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors" }), search && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSearch(''), className: "absolute right-2.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 8.586L4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586z", clipRule: "evenodd" }) }) }))] }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 flex items-center justify-between bg-gray-50 shrink-0 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 font-medium flex items-center gap-1.5", children: [isLoadingFull && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" }), search || statusFilter !== 'all' ? `${filtered.length} of ` : '', filteredTotal, " instances"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => allCollapsed ? setOpenFolders(new Set(allFoldersRef.current)) : setOpenFolders(new Set()), className: "text-xs text-green-600 font-semibold flex items-center gap-1 hover:text-green-900", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: allCollapsed
                                            ? (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                                            : (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" }) }), allCollapsed ? 'Expand all' : 'Collapse all'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4 animate-[fadeIn_0.2s_ease-out]", style: { animationFillMode: 'both' }, children: [isLoadingFull && fullItems.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center py-16 gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-green-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading all instances..." })] })) : grouped.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-10 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: search || statusFilter !== 'all' ? 'No matches found' : 'No agentic instances found' })] })) : (grouped.map(([folderName, items]) => ((0, jsx_runtime_1.jsx)(FolderGroup, { folderName: folderName, items: items, open: openFolders.has(folderName), onToggle: () => setOpenFolders(prev => {
                                    const next = new Set(prev);
                                    next.has(folderName) ? next.delete(folderName) : next.add(folderName);
                                    return next;
                                }), onSelect: setSelected }, folderName)))), (hasNextPage || hasPreviousPage) && statusFilter === 'all' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mx-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: goToPrev, disabled: !hasPreviousPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-green-700", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] }), isLoading && (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-green-600" }), (0, jsx_runtime_1.jsxs)("button", { onClick: goToNext, disabled: !hasNextPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-green-700", children: ["Next", (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }))] }, listKey)] }), selected && ((0, jsx_runtime_1.jsx)(InstanceDetail_1.InstanceDetail, { instance: selected, onClose: () => setSelected(null) }))] }));
}
//# sourceMappingURL=InstanceList.js.map