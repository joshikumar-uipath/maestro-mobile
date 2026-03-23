"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeView = HomeView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const processes_1 = require("@uipath/uipath-typescript/processes");
const maestro_processes_1 = require("@uipath/uipath-typescript/maestro-processes");
const cases_1 = require("@uipath/uipath-typescript/cases");
const timePeriod_1 = require("../utils/timePeriod");
const TYPE_INFO = {
    [processes_1.PackageType.Process]: { label: 'RPA' },
    [processes_1.PackageType.Agent]: { label: 'Agents' },
    [processes_1.PackageType.ProcessOrchestration]: { label: 'Orchestration' },
    [processes_1.PackageType.TestAutomationProcess]: { label: 'Testing' },
    [processes_1.PackageType.Api]: { label: 'API' },
    [processes_1.PackageType.WebApp]: { label: 'Web App' },
};
// ── Gauge chart (right side of card) ─────────────────────────────────────────
const GAUGE_COLORS = [
    '#064e3b', '#064e3b', '#064e3b', '#064e3b',
    '#064e3b', '#064e3b', '#064e3b',
    '#047857', '#059669', '#10b981',
    '#22c55e', '#4ade80', '#86efac',
    '#d1fae5', '#e5e7eb',
];
const GAUGE_DELAYS = [0.4, 0.6, 0.8, 1.0, 1.2, 1.3, 1.4, 1.6, 1.8, 2.1, 2.25, 2.3, 2.45, 2.5, 2.75];
function GaugeChart({ value, badge, activeSegments = 14 }) {
    const total = 15;
    // Width 148px, radius ≈ 64px (diameter 128px) — wider arc using the right-side space.
    // alignSelf: stretch fills the card's full content height; space-evenly distributes items.
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center shrink-0", style: { width: 148, alignSelf: 'flex-start' }, children: [(0, jsx_runtime_1.jsx)("style", { children: `@keyframes gseg{to{opacity:1}}` }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", style: { width: 148, height: 82 }, children: [Array.from({ length: total }, (_, i) => {
                        const angle = (i * 180) / (total - 1) - 90;
                        const isActive = i < activeSegments;
                        return ((0, jsx_runtime_1.jsx)("div", { style: {
                                position: 'absolute',
                                width: 11,
                                height: 24,
                                borderRadius: 6,
                                left: '50%',
                                top: 0,
                                marginLeft: -5.5,
                                transformOrigin: '50% 76px',
                                transform: `translateX(-50%) rotate(${angle}deg)`,
                                background: isActive ? GAUGE_COLORS[i] : '#e5e7eb',
                                opacity: isActive ? 0 : 1,
                                animation: isActive
                                    ? `gseg 0.3s ${GAUGE_DELAYS[i]}s ease-out forwards`
                                    : undefined,
                            } }, i));
                    }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            position: 'absolute', bottom: 4, left: 0, right: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        }, children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: 18, fontWeight: 800, color: '#1f2937', lineHeight: 1 }, children: value }), badge && ((0, jsx_runtime_1.jsx)("span", { style: { fontSize: 8, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: 999 }, children: badge }))] })] })] }));
}
// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({ category, value, sub, subColor = 'text-green-500', gauge, onClick, }) {
    const inner = ((0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm", style: { padding: '12px 16px 14px' }, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", style: { gap: 16 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[9px] font-bold text-gray-400 tracking-widest uppercase", style: { marginBottom: 6 }, children: category }), (0, jsx_runtime_1.jsx)("p", { className: "text-[30px] font-black text-gray-900 leading-none tracking-tight", children: value }), (0, jsx_runtime_1.jsx)("p", { className: `text-[10px] font-semibold leading-snug ${subColor}`, style: { marginTop: 6 }, children: sub })] }), (0, jsx_runtime_1.jsx)(GaugeChart, { ...gauge })] }) }));
    return onClick
        ? (0, jsx_runtime_1.jsx)("button", { onClick: onClick, className: "w-full text-left active:scale-[0.99] transition-transform", children: inner })
        : (0, jsx_runtime_1.jsx)("div", { children: inner });
}
// ── Bottom section card ────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children, action, onAction, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-bold text-gray-900", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: subtitle })] }), action && ((0, jsx_runtime_1.jsx)("button", { onClick: onAction, className: "text-xs font-semibold text-indigo-500", children: action }))] }), children] }));
}
// ── Running instance row ───────────────────────────────────────────────────────
function RunRow({ inst, isLast }) {
    const name = inst.instanceDisplayName || inst.instanceId || 'Automation';
    const initials = name.split(/[\s_-]/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'AU';
    const user = inst.startedByUser ?? '';
    const userInitials = user.split(/[\s@.]/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '—';
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-3 px-5 py-3 ${!isLast ? 'border-b border-gray-50' : ''}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0", children: (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold text-indigo-600", children: initials }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-900 truncate", children: name }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-gray-400 mt-0.5", children: "Agent Run" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 shrink-0", children: [(0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" }), "Active"] }), (0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-[8px] font-bold text-gray-500", children: userInitials }) })] })] }));
}
// ── Greeting helper ────────────────────────────────────────────────────────────
function greeting() {
    const h = new Date().getHours();
    if (h < 12)
        return 'Good morning';
    if (h < 17)
        return 'Good afternoon';
    return 'Good evening';
}
// ── Tenant dropdown ────────────────────────────────────────────────────────────
function TenantDropdown({ orgName, tenantName, open, onClose, }) {
    if (!open)
        return null;
    // Derive a display-friendly tenant label (strip internal prefixes if any)
    const tenantDisplay = tenantName || 'Default';
    const orgDisplay = orgName || 'Organization';
    // Build the tenant list — currently one entry from config.
    // Add more entries here when multi-tenant support is available.
    const tenants = [
        { name: orgDisplay, tenant: tenantDisplay, active: true },
    ];
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-40", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute top-full right-0 mt-2 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3 border-b border-gray-100", children: (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] font-bold uppercase tracking-widest text-gray-400", children: "Switch Workspace" }) }), (0, jsx_runtime_1.jsx)("div", { className: "py-1.5", children: tenants.map((t, i) => ((0, jsx_runtime_1.jsxs)("button", { onClick: onClose, className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-sm", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { d: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-900 truncate", children: t.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-gray-400 mt-0.5 truncate", children: ["Tenant: ", t.tenant] })] }), t.active && ((0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3 text-indigo-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }) }))] }, i))) }), (0, jsx_runtime_1.jsx)("div", { className: "px-4 py-2.5 border-t border-gray-100", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-[10px] text-gray-400 leading-relaxed", children: ["Logged into ", (0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-gray-600", children: tenantDisplay }), " tenant. Contact your admin to access additional tenants."] }) })] })] }));
}
// ── Main component ─────────────────────────────────────────────────────────────
function HomeView({ onNavigate, timePeriod }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const processes = (0, react_1.useMemo)(() => new processes_1.Processes(sdk), [sdk]);
    const maestroProcesses = (0, react_1.useMemo)(() => new maestro_processes_1.MaestroProcesses(sdk), [sdk]);
    const processInstances = (0, react_1.useMemo)(() => new maestro_processes_1.ProcessInstances(sdk), [sdk]);
    const caseInstances = (0, react_1.useMemo)(() => new cases_1.CaseInstances(sdk), [sdk]);
    const [allProcesses, setAllProcesses] = (0, react_1.useState)([]);
    const [maestroList, setMaestroList] = (0, react_1.useState)([]);
    const [allInstances, setAllInstances] = (0, react_1.useState)([]);
    const [caseItems, setCaseItems] = (0, react_1.useState)([]);
    const [caseTotalCount, setCaseTotalCount] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [tenantOpen, setTenantOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        processes.getAll({ pageSize: 100 }).then(r => {
            if (cancelled)
                return;
            if ('items' in r)
                setAllProcesses(r.items);
            else if (Array.isArray(r))
                setAllProcesses(r);
        }).catch(() => { }).finally(() => { if (!cancelled)
            setIsLoading(false); });
        maestroProcesses.getAll().then(r => {
            if (cancelled)
                return;
            if (Array.isArray(r))
                setMaestroList(r);
        }).catch(() => { });
        // Fetch a large page so client-side time filtering has enough coverage
        processInstances.getAll({ pageSize: 100 }).then(r => {
            if (cancelled)
                return;
            let items = [];
            if ('items' in r)
                items = r.items;
            else if (Array.isArray(r))
                items = r;
            setAllInstances(items);
        }).catch(() => { });
        // Fetch case instances for client-side time filtering
        caseInstances.getAll({ pageSize: 100 }).then(r => {
            if (cancelled)
                return;
            if ('totalCount' in r && typeof r.totalCount === 'number')
                setCaseTotalCount(r.totalCount);
            if ('items' in r)
                setCaseItems(r.items);
            else if (Array.isArray(r))
                setCaseItems(r);
        }).catch(() => { });
        return () => { cancelled = true; };
    }, [processes, maestroProcesses, processInstances, caseInstances]);
    // ── Time filter ──────────────────────────────────────────────────────────────
    const startDate = (0, react_1.useMemo)(() => (0, timePeriod_1.getStartDate)(timePeriod), [timePeriod]);
    const filteredInstances = (0, react_1.useMemo)(() => {
        if (!startDate)
            return allInstances;
        return allInstances.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
    }, [allInstances, startDate]);
    const runningInstances = (0, react_1.useMemo)(() => filteredInstances.filter(i => i.latestRunStatus === 'Running'), [filteredInstances]);
    const caseCount = (0, react_1.useMemo)(() => {
        if (!startDate)
            return caseTotalCount;
        return caseItems.filter(c => c.startedTime && new Date(c.startedTime) >= startDate).length;
    }, [caseItems, caseTotalCount, startDate]);
    // ── Derived metrics ──────────────────────────────────────────────────────────
    const metrics = (0, react_1.useMemo)(() => {
        let totalRunning = 0, totalFaulted = 0, totalPending = 0;
        for (const mp of maestroList) {
            totalRunning += mp.runningCount ?? 0;
            totalFaulted += mp.faultedCount ?? 0;
            totalPending += mp.pendingCount ?? 0;
        }
        return { totalRunning, totalFaulted, totalPending };
    }, [maestroList]);
    const typeRows = (0, react_1.useMemo)(() => {
        const counts = new Map();
        for (const p of allProcesses) {
            if (p.packageType)
                counts.set(p.packageType, (counts.get(p.packageType) ?? 0) + 1);
        }
        return Object.entries(TYPE_INFO)
            .map(([type, info]) => ({ type, ...info, count: counts.get(type) ?? 0 }))
            .filter(t => t.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [allProcesses]);
    const rpaProcesses = (0, react_1.useMemo)(() => allProcesses.filter(p => p.packageType === processes_1.PackageType.Process), [allProcesses]);
    const agentProcesses = (0, react_1.useMemo)(() => allProcesses.filter(p => p.packageType === processes_1.PackageType.Agent), [allProcesses]);
    // Build lookup sets for matching instances to their package type.
    // ProcessGetResponse.packageKey ↔ ProcessInstanceGetResponse.packageId
    // ProcessGetResponse.key        ↔ ProcessInstanceGetResponse.processKey
    const rpaKeys = (0, react_1.useMemo)(() => ({
        pkg: new Set(rpaProcesses.map(p => p.packageKey)),
        proc: new Set(rpaProcesses.map(p => p.key)),
    }), [rpaProcesses]);
    const agentKeys = (0, react_1.useMemo)(() => ({
        pkg: new Set(agentProcesses.map(p => p.packageKey)),
        proc: new Set(agentProcesses.map(p => p.key)),
    }), [agentProcesses]);
    const rpaInstances = (0, react_1.useMemo)(() => filteredInstances.filter(i => rpaKeys.pkg.has(i.packageId) || rpaKeys.proc.has(i.processKey)), [filteredInstances, rpaKeys]);
    const agentInstances = (0, react_1.useMemo)(() => filteredInstances.filter(i => agentKeys.pkg.has(i.packageId) || agentKeys.proc.has(i.processKey)), [filteredInstances, agentKeys]);
    // ── Helper: compute completion-rate metrics from an instance array ───────────
    // Completion rate = completedInstances / totalInstances × 100
    // "Completed" covers all terminal-success statuses across Maestro and cases
    const DONE_STATUSES = new Set(['Completed', 'Successful', 'Succeeded', 'Closed', 'Resolved', 'Finished']);
    function instanceMetrics(instances) {
        const completed = instances.filter(i => DONE_STATUSES.has(i.latestRunStatus)).length;
        const running = instances.filter(i => i.latestRunStatus === 'Running').length;
        const faulted = instances.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed').length;
        const pending = instances.filter(i => i.latestRunStatus === 'Pending' || i.latestRunStatus === 'Queued').length;
        const total = instances.length;
        // Completion rate: completed / total (0 when no data)
        const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, running, faulted, pending, completionPct };
    }
    function completionGauge(m) {
        const pct = m.completionPct;
        return {
            value: m.total > 0 ? `${pct}%` : '—',
            badge: m.total === 0 ? 'No data' : pct >= 80 ? 'Efficient' : pct >= 50 ? 'Moderate' : 'Low',
            activeSegments: m.total > 0 ? Math.max(1, Math.round((pct / 100) * 14)) : 1,
        };
    }
    // ── Card 1: Automations (RPA) ─────────────────────────────────────────────────
    const rpaM = instanceMetrics(rpaInstances);
    const rpaSub = rpaM.total > 0
        ? `${rpaM.completed} done · ${rpaM.running} running · ${rpaM.faulted} faulted`
        : 'No RPA runs in period';
    const rpaSubColor = rpaM.faulted > 0 ? 'text-red-400' : rpaM.completed > 0 ? 'text-green-500' : 'text-gray-400';
    const rpaGauge = completionGauge(rpaM);
    // ── Card 2: AI Agents ─────────────────────────────────────────────────────────
    const agentM = instanceMetrics(agentInstances);
    const aiAgentSub = agentM.total > 0
        ? `${agentM.completed} done · ${agentM.running} running · ${agentM.faulted} faulted`
        : 'No agent runs in period';
    const aiAgentSubColor = agentM.faulted > 0 ? 'text-red-400' : agentM.completed > 0 ? 'text-green-500' : 'text-gray-400';
    const aiAgentGauge = completionGauge(agentM);
    // ── Card 3: Agentic Process — unmatched instances in period ─────────────
    const orchInstances = (0, react_1.useMemo)(() => filteredInstances.filter(i => !rpaKeys.pkg.has(i.packageId) && !rpaKeys.proc.has(i.processKey) &&
        !agentKeys.pkg.has(i.packageId) && !agentKeys.proc.has(i.processKey)), [filteredInstances, rpaKeys, agentKeys]);
    const orchM = instanceMetrics(orchInstances);
    const totalJobs = orchM.total;
    const orchSub = totalJobs > 0
        ? `${orchM.completed} done · ${orchM.running} running · ${orchM.faulted} faulted`
        : 'No orchestration jobs in period';
    const orchSubColor = orchM.faulted > 0 ? 'text-red-400' : orchM.completed > 0 ? 'text-green-500' : 'text-gray-400';
    const orchGauge = completionGauge(orchM);
    // ── Card 4: Case Management ───────────────────────────────────────────────────
    // Apply completion rate using time-filtered caseItems
    const filteredCaseItems = (0, react_1.useMemo)(() => {
        if (!startDate)
            return caseItems;
        return caseItems.filter(c => c.startedTime && new Date(c.startedTime) >= startDate);
    }, [caseItems, startDate]);
    const completedCases = filteredCaseItems.filter(c => DONE_STATUSES.has(c.latestRunStatus)).length;
    const caseCompletionPct = caseCount > 0 ? Math.round((completedCases / caseCount) * 100) : 0;
    const caseSub = caseCount > 0
        ? `${completedCases} done · ${caseCount - completedCases} in progress`
        : 'No cases found';
    const caseSubColor = caseCount > 0 ? 'text-green-500' : 'text-gray-400';
    const caseGauge = {
        value: caseCount > 0 ? `${caseCompletionPct}%` : '—',
        badge: caseCount === 0 ? 'No data' : caseCompletionPct >= 80 ? 'Efficient' : caseCompletionPct >= 50 ? 'Moderate' : 'Low',
        activeSegments: caseCount > 0 ? Math.max(1, Math.round((caseCompletionPct / 100) * 14)) : 1,
    };
    // Date string
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const orgLabel = sdk.config.orgName || 'Workspace';
    if (isLoading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full gap-3 bg-[#f7f7f7]", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: "Loading dashboard..." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto bg-[#f7f7f7] h-full", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white px-5 pt-6 pb-5 border-b border-gray-100", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 tracking-tight", children: greeting() }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 mt-0.5", children: dateStr })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col items-end gap-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setTenantOpen(o => !o), className: "flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 rounded bg-indigo-500 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-2.5 h-2.5 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { d: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-semibold text-gray-700", children: orgLabel }), (0, jsx_runtime_1.jsx)("svg", { className: `w-3 h-3 text-gray-400 transition-transform ${tenantOpen ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M19 9l-7 7-7-7" }) })] }), (0, jsx_runtime_1.jsx)(TenantDropdown, { orgName: sdk.config.orgName || '', tenantName: sdk.config.tenantName || '', open: tenantOpen, onClose: () => setTenantOpen(false) })] }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-4 pt-4 pb-6 flex flex-col gap-3", children: [(0, jsx_runtime_1.jsx)(MetricCard, { category: "Automations (RPA)", value: rpaM.total, sub: rpaSub, subColor: rpaSubColor, gauge: rpaGauge, onClick: () => onNavigate('processes') }), (0, jsx_runtime_1.jsx)(MetricCard, { category: "AI Agents", value: agentM.total, sub: aiAgentSub, subColor: aiAgentSubColor, gauge: aiAgentGauge, onClick: () => onNavigate('agentic') }), (0, jsx_runtime_1.jsx)(MetricCard, { category: "Agentic Process", value: totalJobs, sub: orchSub, subColor: orchSubColor, gauge: orchGauge, onClick: () => onNavigate('agentic') }), (0, jsx_runtime_1.jsx)(MetricCard, { category: "Case Management", value: caseCount, sub: caseSub, subColor: caseSubColor, gauge: caseGauge, onClick: () => onNavigate('cases') }), (0, jsx_runtime_1.jsx)(SectionCard, { title: "Active Runs", subtitle: metrics.totalRunning > 0
                            ? `${metrics.totalRunning} automation${metrics.totalRunning !== 1 ? 's' : ''} running now`
                            : 'No active runs at the moment', action: runningInstances.length > 0 ? 'View all' : undefined, onAction: () => onNavigate('agentic'), children: runningInstances.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 px-5 py-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("svg", { className: "w-4 h-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: "All clear \u2014 nothing running right now" })] })) : (runningInstances.slice(0, 5).map((inst, i) => ((0, jsx_runtime_1.jsx)(RunRow, { inst: inst, isLast: i === Math.min(runningInstances.length, 5) - 1 }, inst.instanceId)))) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: [
                            { label: 'Total Types', value: typeRows.length, color: 'text-indigo-600' },
                            { label: 'Queued', value: metrics.totalPending, color: 'text-amber-600' },
                            { label: 'Failed', value: metrics.totalFaulted, color: 'text-red-500' },
                        ].map(({ label, value, color }) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: `text-xl font-bold ${color}`, children: value }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-gray-400 mt-0.5 font-medium", children: label })] }, label))) })] })] }));
}
//# sourceMappingURL=HomeView.js.map