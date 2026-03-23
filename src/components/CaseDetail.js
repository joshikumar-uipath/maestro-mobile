"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseDetail = CaseDetail;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const cases_1 = require("@uipath/uipath-typescript/cases");
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
function CaseDetail({ instance, onClose }) {
    const { sdk } = (0, useAuth_1.useAuth)();
    const caseInstances = (0, react_1.useMemo)(() => new cases_1.CaseInstances(sdk), [sdk]);
    const [tab, setTab] = (0, react_1.useState)('info');
    const [stages, setStages] = (0, react_1.useState)([]);
    const [history, setHistory] = (0, react_1.useState)([]);
    const [loadingStages, setLoadingStages] = (0, react_1.useState)(false);
    const [loadingHistory, setLoadingHistory] = (0, react_1.useState)(false);
    const [stagesError, setStagesError] = (0, react_1.useState)(null);
    const [historyError, setHistoryError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (tab === 'stages' && stages.length === 0 && !loadingStages) {
            setLoadingStages(true);
            setStagesError(null);
            caseInstances.getStages(instance.instanceId, instance.folderKey)
                .then(s => setStages(s))
                .catch(err => setStagesError(err instanceof Error ? err.message : 'Failed to load stages'))
                .finally(() => setLoadingStages(false));
        }
    }, [tab, instance.instanceId, instance.folderKey, stages.length, loadingStages, caseInstances]);
    (0, react_1.useEffect)(() => {
        if (tab === 'history' && history.length === 0 && !loadingHistory) {
            setLoadingHistory(true);
            setHistoryError(null);
            caseInstances.getExecutionHistory(instance.instanceId, instance.folderKey)
                .then(h => {
                const executions = h.elementExecutions ?? [];
                setHistory(executions.map((e) => ({
                    status: e.status ?? 'Unknown',
                    startedTime: e.startedTime ?? '',
                })));
            })
                .catch(err => setHistoryError(err instanceof Error ? err.message : 'Failed to load history'))
                .finally(() => setLoadingHistory(false));
        }
    }, [tab, instance.instanceId, instance.folderKey, history.length, loadingHistory, caseInstances]);
    const tabs = [
        { id: 'info', label: 'Info' },
        { id: 'stages', label: 'Stages' },
        { id: 'history', label: 'History' },
    ];
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex flex-col justify-end bg-black/40", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-t-2xl max-h-[85vh] flex flex-col", onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-4 pt-4 pb-0 border-b border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-2 pb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-base font-semibold text-gray-900 truncate", children: instance.caseTitle || instance.instanceDisplayName || instance.instanceId }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: instance.latestRunStatus }), instance.caseType && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded", children: instance.caseType }))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0", children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-0", children: tabs.map(t => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setTab(t.id), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id
                                    ? 'border-green-500 text-green-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: t.label }, t.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "overflow-y-auto flex-1 px-4 pb-6", children: [tab === 'info' && ((0, jsx_runtime_1.jsxs)("dl", { className: "mt-3", children: [(0, jsx_runtime_1.jsx)(Field, { label: "Case Title", value: instance.caseTitle }), (0, jsx_runtime_1.jsx)(Field, { label: "Case Type", value: instance.caseType }), (0, jsx_runtime_1.jsx)(Field, { label: "Instance ID", value: instance.instanceId }), (0, jsx_runtime_1.jsx)(Field, { label: "Started By", value: instance.startedByUser }), (0, jsx_runtime_1.jsx)(Field, { label: "Started", value: formatTime(instance.startedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Completed", value: formatTime(instance.completedTime) }), (0, jsx_runtime_1.jsx)(Field, { label: "Process Key", value: instance.processKey }), (0, jsx_runtime_1.jsx)(Field, { label: "Package", value: `${instance.packageId}@${instance.packageVersion}` }), (0, jsx_runtime_1.jsx)(Field, { label: "Source", value: instance.source }), (0, jsx_runtime_1.jsx)(Field, { label: "Folder Key", value: instance.folderKey })] })), tab === 'stages' && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [loadingStages && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" }) })), stagesError && (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: stagesError }), !loadingStages && !stagesError && stages.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 text-center py-8", children: "No stages found" })), stages.map((stage) => ((0, jsx_runtime_1.jsxs)("div", { className: "py-3 border-b border-gray-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900", children: stage.name }), (0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: stage.status })] }), stage.tasks.flat().map((task) => ((0, jsx_runtime_1.jsxs)("div", { className: "ml-3 mt-2 py-1.5 border-l-2 border-gray-200 pl-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-700", children: task.name }), (0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: task.status })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: task.type })] }, task.id)))] }, stage.id)))] })), tab === 'history' && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3", children: [loadingHistory && ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-8", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" }) })), historyError && (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-600", children: historyError }), !loadingHistory && !historyError && history.length === 0 && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 text-center py-8", children: "No execution history" })), history.map((item, i) => ((0, jsx_runtime_1.jsx)("div", { className: "py-2 border-b border-gray-100", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: item.status }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400", children: item.startedTime ? new Date(item.startedTime).toLocaleTimeString() : '—' })] }) }, i)))] }))] })] }) }));
}
//# sourceMappingURL=CaseDetail.js.map