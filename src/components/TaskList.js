"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskList = TaskList;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const tasks_1 = require("@uipath/uipath-typescript/tasks");
// ── Priority badge config ──────────────────────────────────────────────────────
const PRIORITY = {
    [tasks_1.TaskPriority.Critical]: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-600' },
    [tasks_1.TaskPriority.High]: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-600' },
    [tasks_1.TaskPriority.Medium]: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
    [tasks_1.TaskPriority.Low]: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-500' },
};
// ── Helpers ────────────────────────────────────────────────────────────────────
function dueOf(task) {
    const expiry = task.taskSlaDetail?.expiryTime;
    return expiry ? new Date(expiry) : null;
}
function timeAgo(iso) {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1)
        return 'Just now';
    if (m < 60)
        return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}
// ── Fetch tasks using SDK ─────────────────────────────────────────────────────
// getAll({ asTaskAdmin: true })  → folders where user has Task.View + Task.Edit + TaskAssignment.Create
// getAll({ asTaskAdmin: false }) → folders where user has Task.View + Task.Edit
async function fetchTasks(tasksService) {
    const errors = [];
    function extractItems(res) {
        if (res && typeof res === 'object' && 'items' in res)
            return res.items;
        if (Array.isArray(res))
            return res;
        return [];
    }
    function errorMsg(e) {
        if (e instanceof Error)
            return e.message;
        if (typeof e === 'object' && e !== null && 'response' in e) {
            const r = e.response;
            return `HTTP ${r?.status ?? '?'}: ${JSON.stringify(r?.data ?? {})}`;
        }
        return String(e);
    }
    // 1st attempt: admin view — broadest access
    try {
        const items = extractItems(await tasksService.getAll({ asTaskAdmin: true }));
        if (items.length > 0)
            return items;
    }
    catch (e) {
        errors.push(`admin: ${errorMsg(e)}`);
    }
    // 2nd attempt: standard user view
    try {
        const items = extractItems(await tasksService.getAll({ asTaskAdmin: false }));
        // Return even if empty — user may genuinely have no tasks
        if (errors.length === 0 || items.length > 0)
            return items;
    }
    catch (e) {
        errors.push(`user: ${errorMsg(e)}`);
    }
    // Both failed — throw with combined error info
    const hint = errors.some(e => e.includes('401') || e.includes('403') || e.includes('Unauthorized') || e.includes('Forbidden'))
        ? ' — Check that OR.Tasks scope is added to your UiPath External Application and re-login.'
        : '';
    throw new Error(errors.join(' | ') + hint);
}
// ── Week calendar strip ────────────────────────────────────────────────────────
// Shows a rolling 7-day window always ending at today — no future dates.
function WeekCalendar({ selected, onSelect }) {
    const today = (0, react_1.useMemo)(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
    // windowEnd is capped at today; default window = [today-6 .. today]
    const [windowEnd, setWindowEnd] = (0, react_1.useState)(() => today);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(windowEnd);
        d.setDate(windowEnd.getDate() - 6 + i);
        return d;
    });
    const canGoForward = windowEnd.getTime() < today.getTime();
    const goBack = () => setWindowEnd(e => {
        const d = new Date(e);
        d.setDate(d.getDate() - 7);
        return d;
    });
    const goForward = () => setWindowEnd(e => {
        const d = new Date(e);
        d.setDate(d.getDate() + 7);
        // Never go past today
        return d.getTime() > today.getTime() ? today : d;
    });
    // Show month of the last day in the window
    const monthLabel = days[6].toLocaleDateString('en-US', { month: 'long' });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border-b border-gray-100 px-4 pt-3 pb-4 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: goBack, className: "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.8, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-gray-700", children: monthLabel })] }), (0, jsx_runtime_1.jsx)("button", { onClick: goForward, disabled: !canGoForward, className: `w-8 h-8 flex items-center justify-center rounded-lg transition-opacity ${canGoForward ? 'hover:bg-gray-50' : 'opacity-20 cursor-default'}`, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex", children: days.map((d, i) => {
                    const isToday = d.getTime() === today.getTime();
                    const isSelected = selected !== null && d.toDateString() === selected.toDateString();
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                    return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onSelect(d), className: "flex-1 flex flex-col items-center gap-1.5 py-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] text-gray-400 font-medium", children: dayLabel }), (0, jsx_runtime_1.jsx)("span", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'text-blue-500' : 'text-gray-700'}`, children: d.getDate() })] }, i));
                }) })] }));
}
// ── Compact task card (used in date section) ──────────────────────────────────
function CompactTaskCard({ task, onOpen, completed }) {
    const p = PRIORITY[task.priority] ?? PRIORITY[tasks_1.TaskPriority.Low];
    const due = dueOf(task);
    const isOverdue = due && due < new Date() && !completed;
    const assigneeName = task.assignedToUser?.name
        ?? task.assignedToUser?.displayName
        ?? task.taskAssigneeName
        ?? 'Unassigned';
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: onOpen, className: `w-full rounded-xl px-3.5 py-3 shadow-sm border flex items-center gap-3 text-left active:bg-gray-50 transition-colors ${completed ? 'bg-green-50 border-green-100' : 'bg-white border-gray-50'}`, children: [completed ? ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-green-500 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 rounded-full shrink-0", style: { background: p.text.includes('red') ? '#f87171' : p.text.includes('orange') ? '#fb923c' : p.text.includes('amber') ? '#fbbf24' : '#9ca3af' } })), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: `text-sm font-semibold truncate ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`, children: task.title }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 truncate mt-0.5", children: [assigneeName, " \u00B7 ", timeAgo(task.createdTime)] })] }), completed ? ((0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-green-100 text-green-600", children: "Done" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.text}`, children: p.label }), isOverdue && (0, jsx_runtime_1.jsx)("div", { className: "w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" })] }))] }));
}
// ── Create Task bottom sheet ───────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
    { value: tasks_1.TaskPriority.Low, label: 'Low', color: '#6b7280' },
    { value: tasks_1.TaskPriority.Medium, label: 'Medium', color: '#d97706' },
    { value: tasks_1.TaskPriority.High, label: 'High', color: '#ea580c' },
    { value: tasks_1.TaskPriority.Critical, label: 'Urgent', color: '#dc2626' },
];
function initials(u) {
    return ((u.name?.[0] ?? '') + (u.surname?.[0] ?? u.displayName?.[1] ?? '')).toUpperCase() || u.displayName?.[0]?.toUpperCase() || '?';
}
function UserAvatar({ user, size = 36 }) {
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const bg = colors[user.id % colors.length];
    return ((0, jsx_runtime_1.jsx)("div", { style: { width: size, height: size, background: bg, borderRadius: size / 2, flexShrink: 0 }, className: "flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { style: { fontSize: size * 0.38, color: '#fff', fontWeight: 700, lineHeight: 1 }, children: initials(user) }) }));
}
function CreateTaskSheet({ open, onClose, onSubmit, tasksService, folderId, }) {
    const [title, setTitle] = (0, react_1.useState)('');
    const [priority, setPriority] = (0, react_1.useState)(tasks_1.TaskPriority.Medium);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [err, setErr] = (0, react_1.useState)(null);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [usersLoading, setUsersLoading] = (0, react_1.useState)(false);
    const [userSearch, setUserSearch] = (0, react_1.useState)('');
    const [assignee, setAssignee] = (0, react_1.useState)(null);
    const [showUserPicker, setShowUserPicker] = (0, react_1.useState)(false);
    const inputRef = (0, react_1.useRef)(null);
    // Reset + load users when sheet opens
    (0, react_1.useEffect)(() => {
        if (!open)
            return;
        setTitle('');
        setPriority(tasks_1.TaskPriority.Medium);
        setErr(null);
        setAssignee(null);
        setUserSearch('');
        setShowUserPicker(false);
        setTimeout(() => inputRef.current?.focus(), 200);
        if (folderId && folderId > 0) {
            setUsersLoading(true);
            tasksService.getUsers(folderId)
                .then(res => setUsers('items' in res ? res.items : []))
                .catch(() => setUsers([]))
                .finally(() => setUsersLoading(false));
        }
    }, [open, folderId, tasksService]);
    const filteredUsers = (0, react_1.useMemo)(() => {
        const q = userSearch.toLowerCase();
        return q ? users.filter(u => u.displayName?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.emailAddress?.toLowerCase().includes(q)) : users;
    }, [users, userSearch]);
    const handleSubmit = async () => {
        if (!title.trim()) {
            setErr('Title is required');
            return;
        }
        setSaving(true);
        setErr(null);
        try {
            await onSubmit({ title: title.trim(), priority }, assignee?.id);
            onClose();
        }
        catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to create task');
        }
        finally {
            setSaving(false);
        }
    };
    if (!open)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-40 bg-black/50", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: "fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col", style: { maxHeight: '88vh' }, children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center pt-3 shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-1 rounded-full bg-gray-200" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between px-5 pt-4 pb-3 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold text-gray-900", children: "New Task" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: "Action Center" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "w-9 h-9 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto px-5 pb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-5", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block", children: "Title *" }), (0, jsx_runtime_1.jsx)("input", { ref: inputRef, type: "text", value: title, onChange: e => { setTitle(e.target.value); setErr(null); }, placeholder: "What needs to be done?", className: "w-full bg-gray-50 rounded-2xl px-4 py-4 text-[15px] text-gray-800 placeholder-gray-300 outline-none border-2 border-transparent focus:border-blue-400 focus:bg-white transition-colors" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-5", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block", children: "Priority" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-4 gap-2", children: PRIORITY_OPTIONS.map(opt => {
                                            const selected = priority === opt.value;
                                            return ((0, jsx_runtime_1.jsx)("button", { onClick: () => setPriority(opt.value), className: "py-3 rounded-2xl text-xs font-bold transition-all", style: selected
                                                    ? { background: opt.color + '18', color: opt.color, border: `2px solid ${opt.color}` }
                                                    : { background: '#f3f4f6', color: '#9ca3af', border: '2px solid transparent' }, children: opt.label }, opt.value));
                                        }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-5", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block", children: "Assign To" }), assignee ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3", children: [(0, jsx_runtime_1.jsx)(UserAvatar, { user: assignee, size: 32 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-800 truncate", children: assignee.displayName || `${assignee.name} ${assignee.surname}` }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 truncate", children: assignee.emailAddress })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setAssignee(null); setShowUserPicker(false); }, className: "w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3.5 h-3.5 text-blue-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M6 18L18 6M6 6l12 12" }) }) })] })) : ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowUserPicker(v => !v), className: "w-full flex items-center gap-3 bg-gray-50 active:bg-gray-100 rounded-2xl px-4 py-3.5 border-2 border-transparent", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-400 flex-1 text-left", children: usersLoading ? 'Loading users…' : 'Select assignee (optional)' }), (0, jsx_runtime_1.jsx)("svg", { className: `w-4 h-4 text-gray-400 transition-transform ${showUserPicker ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] })), showUserPicker && !assignee && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2.5 border-b border-gray-100", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-300 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: userSearch, onChange: e => setUserSearch(e.target.value), placeholder: "Search users\u2026", className: "flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent" })] }), (0, jsx_runtime_1.jsx)("div", { className: "max-h-44 overflow-y-auto", children: filteredUsers.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 text-center py-4", children: usersLoading ? 'Loading…' : users.length === 0 ? 'No users available' : 'No matches' })) : filteredUsers.map(u => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => { setAssignee(u); setShowUserPicker(false); setUserSearch(''); }, className: "w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 border-b border-gray-50 last:border-0", children: [(0, jsx_runtime_1.jsx)(UserAvatar, { user: u, size: 32 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0 text-left", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-gray-800 truncate", children: u.displayName || `${u.name} ${u.surname}` }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 truncate", children: u.emailAddress })] })] }, u.id))) })] }))] }), err && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-2 bg-red-50 rounded-2xl px-4 py-3 mb-4", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-red-400 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-600 font-medium", children: err })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "px-5 pt-3 pb-8 shrink-0 border-t border-gray-100", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleSubmit, disabled: saving || !title.trim(), className: "w-full bg-blue-500 active:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200", children: saving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" }), (0, jsx_runtime_1.jsx)("span", { children: "Creating\u2026" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 4v16m8-8H4" }) }), "Create Task", assignee ? ` · Assign to ${assignee.name}` : ''] })) }) })] })] }));
}
// ── Action Center deep-link helper ────────────────────────────────────────────
// Strips ".api" from the API base URL to get the portal URL:
//   https://staging.api.uipath.com → https://staging.uipath.com
// Action Center task URL format: /{orgName}/{tenantName}/actions_/tasks/{taskId}
function actionCenterTaskUrl(apiBaseUrl, orgName, tenantName, taskId) {
    const portalBase = apiBaseUrl.replace('://staging.api.', '://staging.').replace('://cloud.api.', '://cloud.').replace('://alpha.api.', '://alpha.');
    return `${portalBase}/${orgName}/${tenantName}/actions_/tasks/${taskId}`;
}
// ── Main component ─────────────────────────────────────────────────────────────
function TaskList() {
    const { sdk } = (0, useAuth_1.useAuth)();
    // Instantiate Tasks service per SDK docs
    const tasksService = (0, react_1.useMemo)(() => new tasks_1.Tasks(sdk), [sdk]);
    const [allTasks, setAllTasks] = (0, react_1.useState)([]);
    const [completedTasks, setCompletedTasks] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)('');
    const [refreshKey, setRefreshKey] = (0, react_1.useState)(0);
    const [showCreate, setShowCreate] = (0, react_1.useState)(false);
    // Default to today; null = "All Tasks" flat mode (no date section)
    const [filterDate, setFilterDate] = (0, react_1.useState)(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    // Use folderId from a loaded task so we create in the same folder
    const defaultFolderId = allTasks[0]?.folderId ?? 0;
    const handleCreateTask = async (opts, assigneeId) => {
        const created = await tasksService.create(opts, defaultFolderId);
        if (assigneeId && created?.id) {
            await tasksService.assign({ taskId: created.id, userId: assigneeId });
        }
        setRefreshKey(k => k + 1);
    };
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        fetchTasks(tasksService)
            .then(items => {
            if (cancelled)
                return;
            setAllTasks(items.filter(t => t.status !== tasks_1.TaskStatus.Completed));
            setCompletedTasks(items.filter(t => t.status === tasks_1.TaskStatus.Completed));
        })
            .catch(err => {
            if (cancelled)
                return;
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || 'Failed to reach Action Center');
        })
            .finally(() => { if (!cancelled)
            setIsLoading(false); });
        return () => { cancelled = true; };
    }, [tasksService, refreshKey]);
    // All tasks sorted by due date descending, filtered by search
    const allSorted = (0, react_1.useMemo)(() => {
        const q = search.trim().toLowerCase();
        const src = q ? allTasks.filter(t => t.title.toLowerCase().includes(q)) : allTasks;
        return [...src].sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
    }, [allTasks, search]);
    // Tasks created on the selected date (top section)
    const dateTasks = (0, react_1.useMemo)(() => {
        if (!filterDate)
            return [];
        return allSorted.filter(t => new Date(t.createdTime).toDateString() === filterDate.toDateString());
    }, [allSorted, filterDate]);
    // Completed tasks for the selected date
    const completedDateTasks = (0, react_1.useMemo)(() => {
        if (!filterDate)
            return [];
        return completedTasks.filter(t => new Date(t.createdTime).toDateString() === filterDate.toDateString()).sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
    }, [completedTasks, filterDate]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-[#f7f7f7] relative", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white border-b border-gray-100 px-5 pt-5 pb-3 shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900 tracking-tight", children: "My Tasks" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 mt-0.5", children: isLoading
                                            ? 'Fetching from Action Center…'
                                            : error
                                                ? 'Could not load tasks'
                                                : `${allTasks.length} pending · Action Center` })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setRefreshKey(k => k + 1), disabled: isLoading, className: "text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl disabled:opacity-50", children: isLoading ? '…' : 'Refresh' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setFilterDate(null), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterDate === null
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-500'}`, children: "All Tasks" }), filterDate && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs font-semibold text-blue-600", children: filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setFilterDate(null), children: (0, jsx_runtime_1.jsx)("svg", { className: "w-3 h-3 text-blue-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M6 18L18 6M6 6l12 12" }) }) })] }))] })] }), (0, jsx_runtime_1.jsx)(WeekCalendar, { selected: filterDate, onSelect: d => setFilterDate(prev => prev?.toDateString() === d.toDateString() ? null : d) }), (0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3 shrink-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-gray-100", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-300 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search tasks...", value: search, onChange: e => setSearch(e.target.value), className: "flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none" }), search && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setSearch(''), children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto", children: isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-48 gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: "Fetching Action Center tasks\u2026" })] })) : error ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center py-14 px-6 gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-7 h-7 text-red-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-bold text-gray-800 mb-1", children: "Could not load tasks" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-xl mt-2", children: error })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setRefreshKey(k => k + 1), className: "bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl", children: "Retry" })] })) : allSorted.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center py-16 px-8 gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8 text-blue-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }) }) }), (0, jsx_runtime_1.jsx)("p", { className: "text-base font-bold text-gray-700", children: "No pending tasks" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400 text-center", children: "Your Action Center inbox is empty" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "px-4 pt-3 pb-4 flex flex-col gap-3", children: [filterDate && (dateTasks.length > 0 || completedDateTasks.length > 0) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 px-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-bold text-gray-700", children: filterDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }), dateTasks.length > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full", children: [dateTasks.length, " pending"] })), completedDateTasks.length > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full", children: [completedDateTasks.length, " done"] }))] }), dateTasks.map(t => (0, jsx_runtime_1.jsx)(CompactTaskCard, { task: t, onOpen: () => window.open(actionCenterTaskUrl(sdk.config.baseUrl ?? '', sdk.config.orgName ?? '', sdk.config.tenantName ?? '', t.id), '_blank') }, `d-${t.id}`)), completedDateTasks.map(t => (0, jsx_runtime_1.jsx)(CompactTaskCard, { task: t, completed: true, onOpen: () => window.open(actionCenterTaskUrl(sdk.config.baseUrl ?? '', sdk.config.orgName ?? '', sdk.config.tenantName ?? '', t.id), '_blank') }, `c-${t.id}`))] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 py-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 h-px bg-gray-200" }), (0, jsx_runtime_1.jsx)("span", { className: "text-[11px] font-bold text-gray-400 uppercase tracking-wider", children: "All Tasks" }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 h-px bg-gray-200" })] }), allSorted.map(t => (0, jsx_runtime_1.jsx)(CompactTaskCard, { task: t, onOpen: () => window.open(actionCenterTaskUrl(sdk.config.baseUrl ?? '', sdk.config.orgName ?? '', sdk.config.tenantName ?? '', t.id), '_blank') }, t.id))] })) }), (0, jsx_runtime_1.jsx)("div", { className: "shrink-0 px-4 py-3 bg-white border-t border-gray-100", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowCreate(true), className: "w-full bg-blue-500 active:bg-blue-600 text-white text-sm font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M12 4v16m8-8H4" }) }), "Create Task"] }) }), (0, jsx_runtime_1.jsx)(CreateTaskSheet, { open: showCreate, onClose: () => setShowCreate(false), onSubmit: handleCreateTask, tasksService: tasksService, folderId: defaultFolderId })] }));
}
//# sourceMappingURL=TaskList.js.map