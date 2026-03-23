"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceDetail = InstanceDetail;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const maestro_processes_1 = require("@uipath/uipath-typescript/maestro-processes");
const StatusBadge_1 = require("./StatusBadge");
function Field({ label, value }) {
    if (!value && value !== 0)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "py-2 border-b border-gray-100 last:border-0", children: [(0, jsx_runtime_1.jsx)("dt", { className: "text-xs text-gray-500", children: label }), (0, jsx_runtime_1.jsx)("dd", { className: "text-sm text-gray-900 mt-0.5 break-all", children: String(value) })] }));
}
function formatTime(iso) {
    if (!iso)
        return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
function renderValue(value) {
    if (value === null || value === undefined)
        return '—';
    if (typeof value === 'object')
        return JSON.stringify(value, null, 2);
    return String(value);
}
/** Convert API base URL (staging.api.uipath.com) → web UI URL (staging.uipath.com) */
function toWebBaseUrl(apiBaseUrl) {
    return apiBaseUrl.replace('://staging.api.', '://staging.').replace('://cloud.api.', '://cloud.').replace('://alpha.api.', '://alpha.');
}
function InstanceDetail({ instance, onClose }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const processInstances = (0, react_1.useMemo)(() => new maestro_processes_1.ProcessInstances(sdk), [sdk]);
    const [tab, setTab] = (0, react_1.useState)('maestro');
    const [history, setHistory] = (0, react_1.useState)([]);
    const [variables, setVariables] = (0, react_1.useState)([]);
    const [loadingHistory, setLoadingHistory] = (0, react_1.useState)(false);
    const [loadingVars, setLoadingVars] = (0, react_1.useState)(false);
    const [historyError, setHistoryError] = (0, react_1.useState)(null);
    const [varsError, setVarsError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (tab === 'history' && history.length === 0 && !loadingHistory) {
            setLoadingHistory(true);
            setHistoryError(null);
            processInstances.getExecutionHistory(instance.instanceId)
                .then(h => setHistory(h))
                .catch(err => setHistoryError(err instanceof Error ? err.message : 'Failed to load history'))
                .finally(() => setLoadingHistory(false));
        }
    }, [tab, instance.instanceId, history.length, loadingHistory, processInstances]);
    (0, react_1.useEffect)(() => {
        if (tab === 'variables' && variables.length === 0 && !loadingVars) {
            setLoadingVars(true);
            setVarsError(null);
            processInstances.getVariables(instance.instanceId, instance.folderKey)
                .then(res => {
                const vars = (res.globalVariables ?? []).map(v => ({
                    name: v.name,
                    value: v.value,
                    type: v.type,
                    source: v.source,
                }));
                setVariables(vars);
            })
                .catch(err => setVarsError(err instanceof Error ? err.message : 'Failed to load variables'))
                .finally(() => setLoadingVars(false));
        }
    }, [tab, instance.instanceId, instance.folderKey, variables.length, loadingVars, processInstances]);
    // Build the Maestro web UI deep-link
    const maestroUrl = (0, react_1.useMemo)(() => {
        const webBase = toWebBaseUrl(sdk.config.baseUrl);
        const org = sdk.config.orgName;
        const tenant = sdk.config.tenantName;
        const { processKey, instanceId, folderKey } = instance;
        return `${webBase}/${org}/${tenant}/maestro_/processes/${processKey}/instances/${instanceId}?folderKey=${folderKey}`;
    }, [sdk, instance]);
    const tabs = [
        { id: 'maestro', label: 'Maestro' },
        { id: 'info', label: 'Info' },
        { id: 'history', label: 'History' },
        { id: 'variables', label: 'Variables' },
    ];
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex flex-col justify-end bg-black/40", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-t-2xl flex flex-col max-h-[85vh]", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-4 pt-4 pb-0 border-b border-gray-200 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-2 pb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-base font-semibold text-gray-900 truncate", children: instance.instanceDisplayName || instance.instanceId }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: instance.latestRunStatus }), instance.source && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400", children: instance.source }))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0", children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-0 overflow-x-auto", children: tabs.map(t => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setTab(t.id), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id
                                    ? 'border-green-500 text-green-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: t.label }, t.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "overflow-y-auto flex-1 px-4 pb-6", children: [tab === 'maestro' && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mb-1", children: "Status" }), (0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: instance.latestRunStatus })] }), instance.source && ((0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mb-1", children: "Trigger" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-gray-700", children: instance.source })] }))] }), (0, jsx_runtime_1.jsxs)("dl", { className: "mb-4", children: [(0, jsx_runtime_1.jsx)(Field, { label: "Started By", value: instance.startedByUser }), (0, jsx_runtime_1.jsx)(Field, { label: "Started", value: formatTime(instance.startedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Completed", value: formatTime(instance.completedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Process Key", value: instance.processKey }), (0, jsx_runtime_1.jsx)(Field, { label: "Folder Key", value: instance.folderKey })] }), (0, jsx_runtime_1.jsxs)("a", { href: maestroUrl, target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }), "Open in Maestro"] })] })), tab === 'info' && ((0, jsx_runtime_1.jsxs)("dl", { className: "mt-3", children: [(0, jsx_runtime_1.jsx)(Field, { label: "Instance ID", value: instance.instanceId }), (0, jsx_runtime_1.jsx)(Field, { label: "Started By", value: instance.startedByUser }), (0, jsx_runtime_1.jsx)(Field, { label: "Started", value: formatTime(instance.startedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Completed", value: formatTime(instance.completedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Process Key", value: instance.processKey }), (0, jsx_runtime_1.jsx)(Field, { label: "Package", value: `${instance.packageId}@${instance.packageVersion}` }), (0, jsx_runtime_1.jsx)(Field, { label: "Latest Run ID", value: instance.latestRunId }), (0, jsx_runtime_1.jsx)(Field, { label: "Folder Key", value: instance.folderKey }), (0, jsx_runtime_1.jsx)(Field, { label: "User ID", value: instance.userId }), (0, jsx_runtime_1.jsx)(Field, { label: "Source", value: instance.source })] })), tab === 'history' && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [loadingHistory && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" }) })), historyError && (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: historyError }), !loadingHistory && !historyError && history.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 text-center py-8", children: "No execution history" })), history.map((span) => ((0, jsx_runtime_1.jsxs)("div", { className: "py-2 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 flex-1", children: span.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400 shrink-0", children: new Date(span.startedTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) })] }), span.endTime && ((0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 mt-0.5", children: ["End: ", new Date(span.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })] }))] }, span.id)))] })), tab === 'variables' && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [loadingVars && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" }) })), varsError && (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: varsError }), !loadingVars && !varsError && variables.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 text-center py-8", children: "No variables" })), variables.map((v, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "py-2 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium text-gray-900", children: v.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded", children: v.type })] }), v.source && (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 mt-0.5", children: ["from: ", v.source] }), (0, jsx_runtime_1.jsx)("pre", { className: "text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all", children: renderValue(v.value) })] }, `${v.name}-${i}`)))] }))] })] }) }));
}
//# sourceMappingURL=InstanceDetail.js.map