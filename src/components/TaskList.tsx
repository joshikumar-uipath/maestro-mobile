import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tasks, TaskPriority, TaskStatus } from '@uipath/uipath-typescript/tasks';
import type { TaskGetResponse, TaskCreateOptions, UserLoginInfo } from '@uipath/uipath-typescript/tasks';

// ── Priority badge config ──────────────────────────────────────────────────────
const PRIORITY: Record<string, { label: string; bg: string; text: string }> = {
  [TaskPriority.Critical]: { label: 'Urgent',  bg: 'bg-red-100',    text: 'text-red-600'    },
  [TaskPriority.High]:     { label: 'High',    bg: 'bg-orange-100', text: 'text-orange-600' },
  [TaskPriority.Medium]:   { label: 'Medium',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  [TaskPriority.Low]:      { label: 'Low',     bg: 'bg-gray-100',   text: 'text-gray-500'   },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function dueOf(task: TaskGetResponse): Date | null {
  const expiry = task.taskSlaDetail?.expiryTime;
  return expiry ? new Date(expiry) : null;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Fetch tasks using SDK ─────────────────────────────────────────────────────
// getAll({ asTaskAdmin: true })  → folders where user has Task.View + Task.Edit + TaskAssignment.Create
// getAll({ asTaskAdmin: false }) → folders where user has Task.View + Task.Edit
async function fetchTasks(tasksService: InstanceType<typeof Tasks>): Promise<TaskGetResponse[]> {
  const errors: string[] = [];

  function extractItems(res: unknown): TaskGetResponse[] {
    if (res && typeof res === 'object' && 'items' in res) return (res as { items: TaskGetResponse[] }).items;
    if (Array.isArray(res)) return res as TaskGetResponse[];
    return [];
  }

  function errorMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === 'object' && e !== null && 'response' in e) {
      const r = (e as { response?: { status?: number; data?: unknown } }).response;
      return `HTTP ${r?.status ?? '?'}: ${JSON.stringify(r?.data ?? {})}`;
    }
    return String(e);
  }

  // 1st attempt: admin view — broadest access
  try {
    const items = extractItems(await tasksService.getAll({ asTaskAdmin: true }));
    if (items.length > 0) return items;
  } catch (e) {
    errors.push(`admin: ${errorMsg(e)}`);
  }

  // 2nd attempt: standard user view
  try {
    const items = extractItems(await tasksService.getAll({ asTaskAdmin: false }));
    // Return even if empty — user may genuinely have no tasks
    if (errors.length === 0 || items.length > 0) return items;
  } catch (e) {
    errors.push(`user: ${errorMsg(e)}`);
  }

  // Both failed — throw with combined error info
  const hint = errors.some(e => e.includes('401') || e.includes('403') || e.includes('Unauthorized') || e.includes('Forbidden'))
    ? ' — Check that OR.Tasks scope is added to your UiPath External Application and re-login.'
    : '';
  throw new Error(errors.join(' | ') + hint);
}

// ── Week calendar strip ────────────────────────────────────────────────────────
function WeekCalendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  });

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-4 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {weekStart.toLocaleDateString('en-US', { month: 'long' })}
          </span>
        </div>
        <button
          onClick={() => setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex">
        {days.map((d, i) => {
          const isToday = d.getTime() === today.getTime();
          const isSelected = selected !== null && d.toDateString() === selected.toDateString();
          return (
            <button key={i} onClick={() => onSelect(d)} className="flex-1 flex flex-col items-center gap-1.5 py-1">
              <span className="text-[10px] text-gray-400 font-medium">{DAY_LABELS[i]}</span>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'text-blue-500' : 'text-gray-700'}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task }: { task: TaskGetResponse }) {
  const p = PRIORITY[task.priority] ?? PRIORITY[TaskPriority.Low];
  const due = dueOf(task);
  const isOverdue = due && due < new Date() && !task.isCompleted;
  const assigneeName = task.assignedToUser?.name
    ?? task.assignedToUser?.displayName
    ?? task.taskAssigneeName
    ?? null;

  return (
    <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-50">
      {/* Priority + menu */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </div>

      {/* Title */}
      <p className="text-[15px] font-bold text-gray-900 leading-snug mb-1">{task.title}</p>

      {/* Subtitle from action label or type */}
      <p className="text-sm text-gray-400 leading-snug mb-3 line-clamp-2">
        {task.actionLabel || task.action || task.type.replace('Task', '') + ' · Action Center'}
      </p>

      {/* Footer chips */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Due date */}
        {due && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
            <svg className={`w-3 h-3 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
              {formatDate(due)}
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${
            task.status === TaskStatus.Pending ? 'bg-blue-400' : 'bg-amber-400'
          }`} />
          <span className="text-xs text-gray-500 font-medium">{task.status}</span>
        </div>

        {/* Assignee */}
        {assigneeName && (
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">{assigneeName}</span>
          </div>
        )}

        {/* Created time */}
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg ml-auto">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-400 font-medium">{timeAgo(task.createdTime)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Compact task card (used in date section) ──────────────────────────────────
function CompactTaskCard({ task, onOpen }: { task: TaskGetResponse; onOpen: () => void }) {
  const p = PRIORITY[task.priority] ?? PRIORITY[TaskPriority.Low];
  const due = dueOf(task);
  const isOverdue = due && due < new Date();
  const assigneeName = task.assignedToUser?.name
    ?? task.assignedToUser?.displayName
    ?? task.taskAssigneeName
    ?? 'Unassigned';

  return (
    <button
      onClick={onOpen}
      className="w-full bg-white rounded-xl px-3.5 py-3 shadow-sm border border-gray-50 flex items-center gap-3 text-left active:bg-gray-50 transition-colors"
    >
      {/* Priority dot */}
      <div className="w-2 h-2 rounded-full shrink-0"
        style={{ background: p.text.includes('red') ? '#f87171' : p.text.includes('orange') ? '#fb923c' : p.text.includes('amber') ? '#fbbf24' : '#9ca3af' }} />
      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{assigneeName} · {timeAgo(task.createdTime)}</p>
      </div>
      {/* Priority badge */}
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.text}`}>{p.label}</span>
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      )}
    </button>
  );
}

// ── Create Task bottom sheet ───────────────────────────────────────────────────
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: TaskPriority.Low,      label: 'Low',    color: '#6b7280' },
  { value: TaskPriority.Medium,   label: 'Medium', color: '#d97706' },
  { value: TaskPriority.High,     label: 'High',   color: '#ea580c' },
  { value: TaskPriority.Critical, label: 'Urgent', color: '#dc2626' },
];

function initials(u: UserLoginInfo) {
  return ((u.name?.[0] ?? '') + (u.surname?.[0] ?? u.displayName?.[1] ?? '')).toUpperCase() || u.displayName?.[0]?.toUpperCase() || '?';
}

function UserAvatar({ user, size = 36 }: { user: UserLoginInfo; size?: number }) {
  const colors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
  const bg = colors[user.id % colors.length];
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: size / 2, flexShrink: 0 }}
      className="flex items-center justify-center">
      <span style={{ fontSize: size * 0.38, color: '#fff', fontWeight: 700, lineHeight: 1 }}>{initials(user)}</span>
    </div>
  );
}

function CreateTaskSheet({
  open,
  onClose,
  onSubmit,
  tasksService,
  folderId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (opts: TaskCreateOptions, assigneeId?: number) => Promise<void>;
  tasksService: InstanceType<typeof Tasks>;
  folderId: number;
}) {
  const [title, setTitle]         = useState('');
  const [priority, setPriority]   = useState<TaskPriority>(TaskPriority.Medium);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState<string | null>(null);
  const [users, setUsers]         = useState<UserLoginInfo[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch]     = useState('');
  const [assignee, setAssignee]         = useState<UserLoginInfo | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + load users when sheet opens
  useEffect(() => {
    if (!open) return;
    setTitle(''); setPriority(TaskPriority.Medium); setErr(null);
    setAssignee(null); setUserSearch(''); setShowUserPicker(false);
    setTimeout(() => inputRef.current?.focus(), 200);

    if (folderId && folderId > 0) {
      setUsersLoading(true);
      tasksService.getUsers(folderId)
        .then(res => setUsers('items' in res ? res.items : []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [open, folderId, tasksService]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return q ? users.filter(u =>
      u.displayName?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.emailAddress?.toLowerCase().includes(q)
    ) : users;
  }, [users, userSearch]);

  const handleSubmit = async () => {
    if (!title.trim()) { setErr('Title is required'); return; }
    setSaving(true); setErr(null);
    try {
      await onSubmit({ title: title.trim(), priority }, assignee?.id);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Sheet — constrained to the app's max-w-md frame */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '88vh' }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Task</h2>
            <p className="text-xs text-gray-400 mt-0.5">Action Center</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">

          {/* Title */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Title *</label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErr(null); }}
              placeholder="What needs to be done?"
              className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-[15px] text-gray-800 placeholder-gray-300 outline-none border-2 border-transparent focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Priority */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map(opt => {
                const selected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className="py-3 rounded-2xl text-xs font-bold transition-all"
                    style={selected
                      ? { background: opt.color + '18', color: opt.color, border: `2px solid ${opt.color}` }
                      : { background: '#f3f4f6', color: '#9ca3af', border: '2px solid transparent' }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign To */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Assign To</label>

            {/* Selected assignee chip */}
            {assignee ? (
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
                <UserAvatar user={assignee} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{assignee.displayName || `${assignee.name} ${assignee.surname}`}</p>
                  <p className="text-xs text-gray-400 truncate">{assignee.emailAddress}</p>
                </div>
                <button onClick={() => { setAssignee(null); setShowUserPicker(false); }}
                  className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowUserPicker(v => !v)}
                className="w-full flex items-center gap-3 bg-gray-50 active:bg-gray-100 rounded-2xl px-4 py-3.5 border-2 border-transparent"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 flex-1 text-left">
                  {usersLoading ? 'Loading users…' : 'Select assignee (optional)'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserPicker ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* User picker dropdown */}
            {showUserPicker && !assignee && (
              <div className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users…"
                    className="flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent"
                  />
                </div>
                {/* User list */}
                <div className="max-h-44 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      {usersLoading ? 'Loading…' : users.length === 0 ? 'No users available' : 'No matches'}
                    </p>
                  ) : filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setAssignee(u); setShowUserPicker(false); setUserSearch(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <UserAvatar user={u} size={32} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {u.displayName || `${u.name} ${u.surname}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.emailAddress}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {err && (
            <div className="flex items-start gap-2 bg-red-50 rounded-2xl px-4 py-3 mb-4">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{err}</p>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="px-5 pt-3 pb-8 shrink-0 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className="w-full bg-blue-500 active:bg-blue-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Creating…</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create Task{assignee ? ` · Assign to ${assignee.name}` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Action Center deep-link helper ────────────────────────────────────────────
// Strips ".api" from the API base URL to get the portal URL:
//   https://staging.api.uipath.com → https://staging.uipath.com
// Action Center task URL format: /{orgName}/{tenantName}/actions_/tasks/{taskId}
function actionCenterTaskUrl(apiBaseUrl: string, orgName: string, tenantName: string, taskId: number): string {
  const portalBase = apiBaseUrl.replace('://staging.api.', '://staging.').replace('://cloud.api.', '://cloud.').replace('://alpha.api.', '://alpha.');
  return `${portalBase}/${orgName}/${tenantName}/actions_/tasks/${taskId}`;
}

// ── Main component ─────────────────────────────────────────────────────────────
export function TaskList() {
  const { sdk } = useAuth();
  // Instantiate Tasks service per SDK docs
  const tasksService = useMemo(() => new Tasks(sdk), [sdk]);

  const [allTasks, setAllTasks] = useState<TaskGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  // Default to today; null = "All Tasks" flat mode (no date section)
  const [filterDate, setFilterDate] = useState<Date | null>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });

  // Use folderId from a loaded task so we create in the same folder
  const defaultFolderId = allTasks[0]?.folderId ?? 0;

  const handleCreateTask = async (opts: TaskCreateOptions, assigneeId?: number) => {
    const created = await tasksService.create(opts, defaultFolderId);
    if (assigneeId && created?.id) {
      await tasksService.assign({ taskId: created.id, userId: assigneeId });
    }
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchTasks(tasksService)
      .then(items => {
        if (cancelled) return;
        setAllTasks(items.filter(t => t.status !== TaskStatus.Completed));
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'Failed to reach Action Center');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [tasksService, refreshKey]);

  // All tasks sorted by due date descending, filtered by search
  const allSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const src = q ? allTasks.filter(t => t.title.toLowerCase().includes(q)) : allTasks;
    return [...src].sort((a, b) =>
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    );
  }, [allTasks, search]);

  // Tasks created on the selected date (top section)
  const dateTasks = useMemo(() => {
    if (!filterDate) return [];
    return allSorted.filter(t =>
      new Date(t.createdTime).toDateString() === filterDate.toDateString()
    );
  }, [allSorted, filterDate]);

  const totalPending = allTasks.length;

  return (
    <div className="flex flex-col h-full bg-[#f7f7f7] relative">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading
                ? 'Fetching from Action Center…'
                : error
                ? 'Could not load tasks'
                : `${allTasks.length} pending · Action Center`}
            </p>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={isLoading}
            className="text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl disabled:opacity-50"
          >
            {isLoading ? '…' : 'Refresh'}
          </button>
        </div>

        {/* All Tasks toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterDate(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterDate === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            All Tasks
          </button>
          {filterDate && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
              <span className="text-xs font-semibold text-blue-600">
                {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button onClick={() => setFilterDate(null)}>
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calendar — tap a day to filter by creation date */}
      <WeekCalendar
        selected={filterDate}
        onSelect={d => setFilterDate(prev =>
          prev?.toDateString() === d.toDateString() ? null : d
        )}
      />

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-gray-100">
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">Fetching Action Center tasks…</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center py-14 px-6 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800 mb-1">Could not load tasks</p>
              <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-xl mt-2">{error}</p>
            </div>
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl">
              Retry
            </button>
          </div>

        ) : allSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-700">No pending tasks</p>
            <p className="text-sm text-gray-400 text-center">Your Action Center inbox is empty</p>
          </div>

        ) : (
          <div className="px-4 pt-3 pb-4 flex flex-col gap-3">

            {/* ── Date section (top) — compact cards when a date is selected */}
            {filterDate && dateTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-1">
                  <p className="text-xs font-bold text-gray-700">
                    {filterDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                    {dateTasks.length}
                  </span>
                </div>
                {dateTasks.map(t => <CompactTaskCard key={`d-${t.id}`} task={t} onOpen={() => window.open(actionCenterTaskUrl(sdk.config.baseUrl ?? '', sdk.config.orgName ?? '', sdk.config.tenantName ?? '', t.id), '_blank')} />)}

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">All Tasks</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}

            {/* ── All tasks (always shown below) */}
            {allSorted.map(t => <CompactTaskCard key={t.id} task={t} onOpen={() => window.open(actionCenterTaskUrl(sdk.config.baseUrl ?? '', sdk.config.orgName ?? '', sdk.config.tenantName ?? '', t.id), '_blank')} />)}

          </div>
        )}
      </div>

      {/* Create Task button — pinned above bottom nav */}
      <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full bg-blue-500 active:bg-blue-600 text-white text-sm font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      <CreateTaskSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateTask}
        tasksService={tasksService}
        folderId={defaultFolderId}
      />

    </div>
  );
}
