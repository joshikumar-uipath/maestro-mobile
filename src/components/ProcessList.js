"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessList = ProcessList;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const processes_1 = require("@uipath/uipath-typescript/processes");
const processes_2 = require("@uipath/uipath-typescript/processes");
const maestro_processes_1 = require("@uipath/uipath-typescript/maestro-processes");
const StatusBadge_1 = require("./StatusBadge");
const ProcessDetail_1 = require("./ProcessDetail");
const InstanceDetail_1 = require("./InstanceDetail");
const timePeriod_1 = require("../utils/timePeriod");
const TYPE_CONFIG = {
    [processes_2.PackageType.Agent]: {
        label: 'Agent',
        icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" }) })),
        gradient: 'from-violet-500 to-purple-600',
        pill: 'bg-violet-100 text-violet-700',
        accentBar: 'bg-violet-400',
        chipBg: 'bg-violet-600',
    },
    [processes_2.PackageType.ProcessOrchestration]: {
        label: 'Orchestration',
        icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" }) })),
        gradient: 'from-indigo-500 to-blue-600',
        pill: 'bg-indigo-100 text-indigo-700',
        accentBar: 'bg-indigo-400',
        chipBg: 'bg-indigo-600',
    },
    [processes_2.PackageType.Process]: {
        label: 'RPA',
        icon: ((0, jsx_runtime_1.jsxs)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
        gradient: 'from-sky-500 to-blue-500',
        pill: 'bg-sky-100 text-sky-700',
        accentBar: 'bg-sky-400',
        chipBg: 'bg-sky-600',
    },
    [processes_2.PackageType.WebApp]: {
        label: 'Web App',
        icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) })),
        gradient: 'from-teal-500 to-emerald-500',
        pill: 'bg-teal-100 text-teal-700',
        accentBar: 'bg-teal-400',
        chipBg: 'bg-teal-600',
    },
    [processes_2.PackageType.TestAutomationProcess]: {
        label: 'Test',
        icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }) })),
        gradient: 'from-amber-500 to-orange-500',
        pill: 'bg-amber-100 text-amber-700',
        accentBar: 'bg-amber-400',
        chipBg: 'bg-amber-600',
    },
    [processes_2.PackageType.Api]: {
        label: 'API',
        icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })),
        gradient: 'from-emerald-500 to-green-600',
        pill: 'bg-emerald-100 text-emerald-700',
        accentBar: 'bg-emerald-400',
        chipBg: 'bg-emerald-600',
    },
};
const defaultConfig = {
    label: 'Process',
    icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) })),
    gradient: 'from-gray-400 to-gray-500',
    pill: 'bg-gray-100 text-gray-600',
    accentBar: 'bg-gray-300',
    chipBg: 'bg-gray-500',
};
function getTypeConfig(packageType) {
    if (!packageType)
        return defaultConfig;
    return TYPE_CONFIG[packageType] ?? defaultConfig;
}
// ── Filter config ─────────────────────────────────────────────────────────────
const FILTER_TYPES = [
    { id: 'all', label: 'All' },
    { id: processes_2.PackageType.Agent, label: 'Agent' },
    { id: processes_2.PackageType.Process, label: 'RPA' },
    { id: processes_2.PackageType.ProcessOrchestration, label: 'Orchestration' },
    { id: processes_2.PackageType.TestAutomationProcess, label: 'Test' },
    { id: processes_2.PackageType.Api, label: 'API' },
    { id: processes_2.PackageType.WebApp, label: 'Web App' },
];
// ── Light Process Header ───────────────────────────────────────────────────────
function ProcessHeader({ totalCount, metrics, statusFilter, onStatusFilter, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-end justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold text-gray-900", children: "Automations" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: "UiPath Orchestrator" })] }), (0, jsx_runtime_1.jsxs)("span", { className: `flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${metrics.totalFaulted === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`, children: [(0, jsx_runtime_1.jsx)("span", { className: `w-1.5 h-1.5 rounded-full ${metrics.totalFaulted === 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}` }), metrics.totalFaulted === 0 ? 'Healthy' : `${metrics.totalFaulted} failed`] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter('all'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'all' ? 'bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-gray-800'}`, children: totalCount }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'all' ? 'text-gray-300' : 'text-gray-400'}`, children: "Total" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'running' ? 'all' : 'running'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'running' ? 'bg-green-600' : metrics.totalRunning > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'running' ? 'text-white' : metrics.totalRunning > 0 ? 'text-green-700' : 'text-gray-400'}`, children: metrics.totalRunning }), metrics.totalRunning > 0 && statusFilter !== 'running' && ((0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }))] }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'running' ? 'text-green-100' : metrics.totalRunning > 0 ? 'text-green-600' : 'text-gray-400'}`, children: "Active" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => onStatusFilter(statusFilter === 'faulted' ? 'all' : 'faulted'), className: `rounded-xl p-3 text-left transition-all active:scale-95 ${statusFilter === 'faulted' ? 'bg-red-600' : metrics.totalFaulted > 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${statusFilter === 'faulted' ? 'text-white' : metrics.totalFaulted > 0 ? 'text-red-600' : 'text-gray-400'}`, children: metrics.totalFaulted }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-0.5 ${statusFilter === 'faulted' ? 'text-red-100' : metrics.totalFaulted > 0 ? 'text-red-400' : 'text-gray-400'}`, children: "Failed" })] })] })] }));
}
// ── Instance mini-row ─────────────────────────────────────────────────────────
function InstanceRow({ inst, onTap, }) {
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: e => { e.stopPropagation(); onTap(inst); }, className: "w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-violet-50 active:bg-violet-100 transition-colors text-left", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: inst.latestRunStatus }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 min-w-0", children: (0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-gray-700 truncate", children: inst.instanceDisplayName || inst.instanceId }) }), (0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3 text-gray-300 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }));
}
// ── Process card ──────────────────────────────────────────────────────────────
function ProcessCard({ process, maestro, processInstances, onInfo, onInstance, }) {
    const isAgent = process.packageType === processes_2.PackageType.Agent;
    const config = getTypeConfig(process.packageType);
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const [instances, setInstances] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [loaded, setLoaded] = (0, react_1.useState)(false);
    const running = maestro?.runningCount ?? 0;
    const pending = maestro?.pendingCount ?? 0;
    const faulted = maestro?.faultedCount ?? 0;
    const total = running + pending + faulted;
    const hasActivity = total > 0;
    const handleCardTap = () => {
        if (isAgent) {
            setExpanded(e => !e);
            if (!loaded && !loading) {
                setLoading(true);
                processInstances
                    .getAll({ processKey: process.key, pageSize: 8 })
                    .then(res => { setInstances('items' in res ? res.items : []); setLoaded(true); })
                    .catch(() => setLoaded(true))
                    .finally(() => setLoading(false));
            }
        }
        else {
            onInfo(process);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl mx-3 mb-2 shadow-sm border border-gray-100 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handleCardTap, className: "w-full text-left", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 px-3.5 py-3.5", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`, children: config.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-900 leading-tight line-clamp-1", children: process.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5 truncate", children: process.description || process.folderName || '' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-end gap-1.5 shrink-0", children: [(0, jsx_runtime_1.jsx)("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${config.pill}`, children: config.label }), isAgent && ((0, jsx_runtime_1.jsx)("svg", { className: `w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }))] })] }), isAgent && hasActivity && ((0, jsx_runtime_1.jsxs)("div", { className: "px-3.5 pb-3.5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex h-1.5 rounded-full overflow-hidden bg-gray-100 mb-2", children: [running > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "bg-blue-500 transition-all", style: { flex: running } })), pending > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "bg-amber-400 transition-all", style: { flex: pending } })), faulted > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-400 transition-all", style: { flex: faulted } }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 flex-wrap", children: [running > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }), running, " running"] })), pending > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium", children: [pending, " pending"] })), faulted > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), faulted, " faulted"] }))] })] }))] }), isAgent && expanded && ((0, jsx_runtime_1.jsxs)("div", { className: "border-t border-gray-100 bg-gray-50/80", children: [loading && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500" }) })), !loading && loaded && instances.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 text-center py-4", children: "No recent instances" })), instances.map(inst => ((0, jsx_runtime_1.jsx)(InstanceRow, { inst: inst, onTap: onInstance }, inst.instanceId))), loaded && instances.length >= 8 && ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 text-center py-2 pb-2.5", children: "Showing first 8 \u00B7 see Agentic tab for all" }))] }))] }));
}
// ── Folder section ────────────────────────────────────────────────────────────
function FolderSection({ folderName, items, maestroMap, processInstances, open, onToggle, onInfo, onInstance, }) {
    const runningTotal = items.reduce((s, p) => s + (maestroMap.get(p.key)?.runningCount ?? 0), 0);
    const faultedTotal = items.reduce((s, p) => s + (maestroMap.get(p.key)?.faultedCount ?? 0), 0);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-1", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onToggle, className: "w-full flex items-center gap-2 px-4 py-2.5 text-left", children: [(0, jsx_runtime_1.jsx)("svg", { className: `w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`, fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight", children: folderName }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 shrink-0", children: [runningTotal > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-semibold", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1 h-1 rounded-full bg-green-500 animate-pulse" }), runningTotal, " live"] })), faultedTotal > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full text-[10px] font-semibold", children: [faultedTotal, " err"] })), (0, jsx_runtime_1.jsx)("span", { className: "bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px]", children: items.length })] })] }), open && ((0, jsx_runtime_1.jsx)("div", { className: "pb-1", children: items.map(process => ((0, jsx_runtime_1.jsx)(ProcessCard, { process: process, maestro: maestroMap.get(process.key), processInstances: processInstances, onInfo: onInfo, onInstance: onInstance }, process.id))) }))] }));
}
// ── Main component ────────────────────────────────────────────────────────────
function ProcessList({ timePeriod }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const processes = (0, react_1.useMemo)(() => new processes_1.Processes(sdk), [sdk]);
    const maestroProcesses = (0, react_1.useMemo)(() => new maestro_processes_1.MaestroProcesses(sdk), [sdk]);
    const processInstances = (0, react_1.useMemo)(() => new maestro_processes_1.ProcessInstances(sdk), [sdk]);
    const [allItems, setAllItems] = (0, react_1.useState)([]);
    const [maestroMap, setMaestroMap] = (0, react_1.useState)(new Map());
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [hasNextPage, setHasNextPage] = (0, react_1.useState)(false);
    const [nextCursor, setNextCursor] = (0, react_1.useState)();
    const [prevCursors, setPrevCursors] = (0, react_1.useState)([]);
    const [currentCursor, setCurrentCursor] = (0, react_1.useState)();
    const [totalCount, setTotalCount] = (0, react_1.useState)();
    const [selectedProcess, setSelectedProcess] = (0, react_1.useState)(null);
    const [selectedInstance, setSelectedInstance] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)('');
    const [typeFilter, setTypeFilter] = (0, react_1.useState)('all');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [openFolders, setOpenFolders] = (0, react_1.useState)(new Set());
    const allFoldersRef = (0, react_1.useRef)([]);
    // Full (unpaginated) list fetched on-demand when a status filter is active
    const [fullItems, setFullItems] = (0, react_1.useState)([]);
    const [isLoadingFull, setIsLoadingFull] = (0, react_1.useState)(false);
    const fetchPage = (0, react_1.useCallback)(async (cursor) => {
        setIsLoading(true);
        setError(null);
        try {
            const [procResult, maestroResult] = await Promise.all([
                processes.getAll({ pageSize: 50, cursor }),
                maestroProcesses.getAll().catch(() => []),
            ]);
            const map = new Map();
            for (const mp of maestroResult)
                map.set(mp.processKey, mp);
            setMaestroMap(map);
            if ('hasNextPage' in procResult) {
                setAllItems(procResult.items);
                setHasNextPage(procResult.hasNextPage);
                setNextCursor(procResult.nextCursor);
                setTotalCount(procResult.totalCount);
                setCurrentCursor(cursor);
                const folders = Array.from(new Set(procResult.items.map(p => p.folderName || 'No Folder')));
                allFoldersRef.current = folders;
                setOpenFolders(new Set());
                setFullItems([]); // reset so it refetches if status filter is active
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load processes');
        }
        finally {
            setIsLoading(false);
        }
    }, [processes, maestroProcesses]);
    (0, react_1.useEffect)(() => { fetchPage(); }, [fetchPage]);
    // When a status filter is active, fetch ALL processes (unpaginated) so the filter is accurate
    (0, react_1.useEffect)(() => {
        if (statusFilter === 'all' || fullItems.length > 0 || isLoadingFull)
            return;
        setIsLoadingFull(true);
        processes.getAll()
            .then(result => setFullItems(result.items))
            .catch(() => { })
            .finally(() => setIsLoadingFull(false));
    }, [statusFilter, fullItems.length, isLoadingFull, processes]);
    // Fetch all instances for time-filtered metrics — re-runs when timePeriod changes
    const [timedInstances, setTimedInstances] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (timePeriod === 'all') {
            setTimedInstances([]);
            return;
        }
        processInstances.getAll()
            .then(result => setTimedInstances(result.items))
            .catch(() => setTimedInstances([]));
    }, [timePeriod, processInstances]);
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
    // ── Computed metrics ───────────────────────────────────────────────────────
    const metrics = (0, react_1.useMemo)(() => {
        if (timePeriod !== 'all') {
            const startDate = (0, timePeriod_1.getStartDate)(timePeriod);
            const inWindow = startDate
                ? timedInstances.filter(i => i.startedTime && new Date(i.startedTime) >= startDate)
                : timedInstances;
            return {
                totalRunning: inWindow.filter(i => i.latestRunStatus === 'Running').length,
                totalFaulted: inWindow.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed').length,
                totalPending: inWindow.filter(i => i.latestRunStatus === 'Pending').length,
            };
        }
        let totalRunning = 0, totalFaulted = 0, totalPending = 0;
        for (const mp of maestroMap.values()) {
            totalRunning += mp.runningCount ?? 0;
            totalFaulted += mp.faultedCount ?? 0;
            totalPending += mp.pendingCount ?? 0;
        }
        return { totalRunning, totalFaulted, totalPending };
    }, [maestroMap, timePeriod, timedInstances]);
    const typeCounts = (0, react_1.useMemo)(() => {
        const base = statusFilter !== 'all' ? fullItems : allItems;
        const counts = new Map();
        for (const p of base) {
            if (p.packageType)
                counts.set(p.packageType, (counts.get(p.packageType) ?? 0) + 1);
        }
        return counts;
    }, [allItems, fullItems, statusFilter]);
    // ── Filter & group ─────────────────────────────────────────────────────────
    const filtered = (0, react_1.useMemo)(() => {
        // Use the full (unpaginated) list when a status filter is active
        let list = statusFilter !== 'all' ? fullItems : allItems;
        if (typeFilter !== 'all')
            list = list.filter(p => p.packageType === typeFilter);
        if (statusFilter === 'running')
            list = list.filter(p => (maestroMap.get(p.key)?.runningCount ?? 0) > 0);
        if (statusFilter === 'faulted')
            list = list.filter(p => (maestroMap.get(p.key)?.faultedCount ?? 0) > 0);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.name?.toLowerCase().includes(q) ||
                p.folderName?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q));
        }
        return list;
    }, [allItems, fullItems, search, typeFilter, statusFilter, maestroMap]);
    const grouped = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const p of filtered) {
            const folder = p.folderName || 'No Folder';
            if (!map.has(folder))
                map.set(folder, []);
            map.get(folder).push(p);
        }
        for (const [, items] of map) {
            items.sort((a, b) => {
                const aR = maestroMap.get(a.key)?.runningCount ?? 0;
                const bR = maestroMap.get(b.key)?.runningCount ?? 0;
                if (bR !== aR)
                    return bR - aR;
                return (a.name ?? '').localeCompare(b.name ?? '');
            });
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered, maestroMap]);
    const toggleFolder = (0, react_1.useCallback)((folder) => {
        setOpenFolders(prev => {
            const next = new Set(prev);
            if (next.has(folder))
                next.delete(folder);
            else
                next.add(folder);
            return next;
        });
    }, []);
    const allCollapsed = openFolders.size === 0;
    const baseCount = statusFilter !== 'all' ? fullItems.length : (totalCount ?? allItems.length);
    const visibleFilters = FILTER_TYPES.filter(f => f.id === 'all' || (typeCounts.get(f.id) ?? 0) > 0);
    if (isLoading && allItems.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full gap-3 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading processes..." })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 font-medium mb-1", children: "Failed to load" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mb-3", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: () => fetchPage(), className: "text-xs bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium", children: "Retry" })] }));
    }
    const hasPreviousPage = prevCursors.length > 0;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsx)(ProcessHeader, { totalCount: totalCount ?? allItems.length, metrics: metrics, statusFilter: statusFilter, onStatusFilter: setStatusFilter }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border-b border-gray-100 shrink-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-3 pt-3 pb-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("svg", { className: "absolute left-3 top-1/2 -trangray-y-1/2 w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Search processes...", className: "w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors" }), search && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSearch(''), className: "absolute right-2.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 8.586L4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586z", clipRule: "evenodd" }) }) }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto px-3 pb-3", children: (0, jsx_runtime_1.jsx)("div", { className: "flex gap-1.5 min-w-max", children: visibleFilters.map(f => {
                                        const active = typeFilter === f.id;
                                        const count = f.id === 'all' ? baseCount : (typeCounts.get(f.id) ?? 0);
                                        return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setTypeFilter(f.id), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`, children: [f.label, (0, jsx_runtime_1.jsx)("span", { className: `rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`, children: count })] }, f.id));
                                    }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 flex items-center justify-between bg-gray-50 shrink-0 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 font-medium flex items-center gap-1.5", children: [isLoadingFull && (0, jsx_runtime_1.jsx)("span", { className: "animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" }), search || typeFilter !== 'all' || statusFilter !== 'all' ? `${filtered.length} of ` : '', baseCount, " processes"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => allCollapsed ? setOpenFolders(new Set(allFoldersRef.current)) : setOpenFolders(new Set()), className: "text-xs text-gray-600 font-semibold flex items-center gap-1 hover:text-gray-900", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: allCollapsed
                                            ? (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                                            : (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" }) }), allCollapsed ? 'Expand all' : 'Collapse all'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4", children: [isLoadingFull && fullItems.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center py-16 gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-gray-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-medium", children: "Loading all processes..." })] })) : grouped.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-10 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: search || typeFilter !== 'all' ? 'No matches found' : 'No processes found' })] })) : (grouped.map(([folder, items]) => ((0, jsx_runtime_1.jsx)(FolderSection, { folderName: folder, items: items, maestroMap: maestroMap, processInstances: processInstances, open: openFolders.has(folder), onToggle: () => toggleFolder(folder), onInfo: setSelectedProcess, onInstance: setSelectedInstance }, folder)))), (hasNextPage || hasPreviousPage) && statusFilter === 'all' && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mx-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: goToPrev, disabled: !hasPreviousPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-gray-800", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] }), isLoading && (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-gray-600" }), (0, jsx_runtime_1.jsxs)("button", { onClick: goToNext, disabled: !hasNextPage || isLoading, className: "flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-gray-800", children: ["Next", (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }))] })] }), selectedProcess && (0, jsx_runtime_1.jsx)(ProcessDetail_1.ProcessDetail, { process: selectedProcess, onClose: () => setSelectedProcess(null) }), selectedInstance && (0, jsx_runtime_1.jsx)(InstanceDetail_1.InstanceDetail, { instance: selectedInstance, onClose: () => setSelectedInstance(null) })] }));
}
//# sourceMappingURL=ProcessList.js.map