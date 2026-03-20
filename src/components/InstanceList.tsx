import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProcessInstances, MaestroProcesses } from '@uipath/uipath-typescript/maestro-processes';
import type { ProcessInstanceGetResponse } from '@uipath/uipath-typescript/maestro-processes';
import type { PaginationCursor } from '@uipath/uipath-typescript/core';
import { StatusBadge } from './StatusBadge';
import { InstanceDetail } from './InstanceDetail';
import { type TimePeriod, getStartDate } from '../utils/timePeriod';

type StatusFilter = 'all' | 'running' | 'faulted';

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Light violet header ────────────────────────────────────────────────────────

function InstanceHeader({
  totalCount,
  metrics,
  statusFilter,
  onStatusFilter,
}: {
  totalCount: number;
  metrics: { running: number; faulted: number };
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
}) {
  return (
    <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent Runs</h1>
          <p className="text-xs text-gray-400 mt-0.5">UiPath Maestro</p>
        </div>
        {metrics.running > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {metrics.running} active
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onStatusFilter('all')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'all' ? 'bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className={`text-xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-gray-800'}`}>{totalCount}</p>
          <p className={`text-xs mt-0.5 ${statusFilter === 'all' ? 'text-gray-300' : 'text-gray-400'}`}>Total</p>
        </button>

        <button
          onClick={() => onStatusFilter(statusFilter === 'running' ? 'all' : 'running')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'running' ? 'bg-green-600' : metrics.running > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <p className={`text-xl font-bold ${statusFilter === 'running' ? 'text-white' : metrics.running > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {metrics.running}
            </p>
            {metrics.running > 0 && statusFilter !== 'running' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <p className={`text-xs mt-0.5 ${statusFilter === 'running' ? 'text-green-100' : metrics.running > 0 ? 'text-green-600' : 'text-gray-400'}`}>Active</p>
        </button>

        <button
          onClick={() => onStatusFilter(statusFilter === 'faulted' ? 'all' : 'faulted')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'faulted' ? 'bg-red-600' : metrics.faulted > 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className={`text-xl font-bold ${statusFilter === 'faulted' ? 'text-white' : metrics.faulted > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {metrics.faulted}
          </p>
          <p className={`text-xs mt-0.5 ${statusFilter === 'faulted' ? 'text-red-100' : metrics.faulted > 0 ? 'text-red-400' : 'text-gray-400'}`}>Failed</p>
        </button>
      </div>
    </div>
  );
}

// ── Folder group ──────────────────────────────────────────────────────────────

function FolderGroup({
  folderName,
  items,
  open,
  onToggle,
  onSelect,
}: {
  folderName: string;
  items: ProcessInstanceGetResponse[];
  open: boolean;
  onToggle: () => void;
  onSelect: (i: ProcessInstanceGetResponse) => void;
}) {
  return (
    <div className="mb-1">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-left">
        <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight">{folderName}</span>
        <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px] shrink-0">{items.length}</span>
      </button>

      {open && (
        <div className="pb-1">
          {items.map(inst => (
            <div key={inst.instanceId} className="mx-3 mb-2">
              <button
                onClick={() => onSelect(inst)}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden"
              >
                <div className="flex items-center gap-3 px-3.5 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
                      {inst.instanceDisplayName || inst.instanceId}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs text-gray-400 truncate">{inst.startedByUser || 'Unknown'}</span>
                      <span className="text-gray-200 shrink-0">·</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatTime(inst.startedTime)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={inst.latestRunStatus} />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InstanceList({ timePeriod }: { timePeriod: TimePeriod }) {
  const { sdk } = useAuth();
  const processInstances = useMemo(() => new ProcessInstances(sdk), [sdk]);
  const maestroProcesses = useMemo(() => new MaestroProcesses(sdk), [sdk]);
  const [folderNames, setFolderNames] = useState<Map<string, string>>(new Map());

  const [allItems, setAllItems] = useState<ProcessInstanceGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<PaginationCursor | undefined>();
  const [prevCursors, setPrevCursors] = useState<PaginationCursor[]>([]);
  const [currentCursor, setCurrentCursor] = useState<PaginationCursor | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [selected, setSelected] = useState<ProcessInstanceGetResponse | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const allFoldersRef = useRef<string[]>([]);
  const [fullItems, setFullItems] = useState<ProcessInstanceGetResponse[]>([]);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const [listKey, setListKey] = useState(0);
  const prevPeriodRef = useRef(timePeriod);

  const fetchPage = useCallback(async (cursor?: PaginationCursor) => {
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
        const map = new Map<string, string>();
        for (const mp of maestroList) map.set(mp.folderKey, mp.folderName);
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
          const folders = Array.from(new Set(result.items.map(i =>
            maestroList.find(mp => mp.folderKey === i.folderKey)?.folderName || i.folderKey || 'Unknown Folder'
          )));
          allFoldersRef.current = folders;
          setOpenFolders(new Set());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instances');
    } finally {
      setIsLoading(false);
    }
  }, [processInstances, maestroProcesses, folderNames.size]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  // Fetch all instances when a status filter OR time period filter is active
  useEffect(() => {
    const needsFull = statusFilter !== 'all' || timePeriod !== 'all';
    if (!needsFull || fullItems.length > 0 || isLoadingFull) return;
    setIsLoadingFull(true);
    processInstances.getAll()
      .then(result => setFullItems(result.items))
      .catch(() => {})
      .finally(() => setIsLoadingFull(false));
  }, [statusFilter, timePeriod, fullItems.length, isLoadingFull, processInstances]);

  // Reset visible folders and flash list when time period changes
  useEffect(() => {
    if (prevPeriodRef.current === timePeriod) return;
    prevPeriodRef.current = timePeriod;
    setOpenFolders(new Set());
    setListKey(k => k + 1);
  }, [timePeriod]);

  const goToNext = useCallback(async () => {
    if (!nextCursor) return;
    setPrevCursors(prev => currentCursor ? [...prev, currentCursor] : prev);
    await fetchPage(nextCursor);
  }, [nextCursor, currentCursor, fetchPage]);

  const goToPrev = useCallback(async () => {
    if (prevCursors.length === 0) return;
    const newPrev = [...prevCursors];
    const prev = newPrev.pop();
    setPrevCursors(newPrev);
    await fetchPage(prev);
  }, [prevCursors, fetchPage]);

  const needsFull = statusFilter !== 'all' || timePeriod !== 'all';
  const baseList = needsFull ? fullItems : allItems;
  const baseCount = needsFull ? fullItems.length : (totalCount ?? allItems.length);

  const filteredTotal = useMemo(() => {
    const startDate = getStartDate(timePeriod);
    const base = needsFull && fullItems.length > 0 ? fullItems : allItems;
    if (!startDate) return base.length;
    return base.filter(i => i.startedTime && new Date(i.startedTime) >= startDate).length;
  }, [fullItems, allItems, timePeriod, needsFull]);

  // Metrics computed from the full set, with time filter applied
  const instanceMetrics = useMemo(() => {
    const startDate = getStartDate(timePeriod);
    let base = needsFull && fullItems.length > 0 ? fullItems : allItems;
    if (startDate) base = base.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
    return {
      running: base.filter(i => i.latestRunStatus === 'Running').length,
      faulted: base.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed').length,
    };
  }, [allItems, fullItems, statusFilter, timePeriod, needsFull]);

  const filtered = useMemo(() => {
    const startDate = getStartDate(timePeriod);
    let list = baseList;
    if (startDate) list = list.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
    if (statusFilter === 'running') list = list.filter(i => i.latestRunStatus === 'Running');
    if (statusFilter === 'faulted') list = list.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed');
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(i =>
      i.instanceDisplayName?.toLowerCase().includes(q) ||
      i.processKey?.toLowerCase().includes(q) ||
      i.startedByUser?.toLowerCase().includes(q)
    );
  }, [baseList, search, statusFilter, timePeriod]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProcessInstanceGetResponse[]>();
    for (const i of filtered) {
      const folder = folderNames.get(i.folderKey) || i.folderKey || 'Unknown Folder';
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(i);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, folderNames]);

  if (isLoading && allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-200 border-t-green-600" />
        <p className="text-xs text-gray-400 font-medium">Loading instances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 font-medium mb-1">Failed to load</p>
        <p className="text-xs text-gray-400 mb-3">{error}</p>
        <button onClick={() => fetchPage()} className="text-xs bg-green-700 text-white px-4 py-1.5 rounded-full font-medium">Retry</button>
      </div>
    );
  }

  const hasPreviousPage = prevCursors.length > 0;
  const allCollapsed = openFolders.size === 0;

  return (
    <>
      <div className="flex flex-col h-full">
        <InstanceHeader
          totalCount={filteredTotal}
          metrics={instanceMetrics}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        {/* Search + controls */}
        <div className="bg-white border-b border-gray-100 shrink-0">
          <div className="px-3 pt-3 pb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -trangray-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search instances..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 8.586L4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expand/collapse row */}
        <div className="px-4 py-2 flex items-center justify-between bg-gray-50 shrink-0 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            {isLoadingFull && <span className="animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" />}
            {search || statusFilter !== 'all' ? `${filtered.length} of ` : ''}{filteredTotal} instances
          </p>
          <button
            onClick={() => allCollapsed ? setOpenFolders(new Set(allFoldersRef.current)) : setOpenFolders(new Set())}
            className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:text-green-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {allCollapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
            </svg>
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        </div>

        {/* Grouped list */}
        <div key={listKey} className="flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4 animate-[fadeIn_0.2s_ease-out]" style={{ animationFillMode: 'both' }}>
          {isLoadingFull && fullItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-green-600" />
              <p className="text-xs text-gray-400 font-medium">Loading all instances...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">{search || statusFilter !== 'all' ? 'No matches found' : 'No agentic instances found'}</p>
            </div>
          ) : (
            grouped.map(([folderName, items]) => (
              <FolderGroup
                key={folderName}
                folderName={folderName}
                items={items}
                open={openFolders.has(folderName)}
                onToggle={() => setOpenFolders(prev => {
                  const next = new Set(prev);
                  next.has(folderName) ? next.delete(folderName) : next.add(folderName);
                  return next;
                })}
                onSelect={setSelected}
              />
            ))
          )}

          {(hasNextPage || hasPreviousPage) && statusFilter === 'all' && (
            <div className="flex items-center justify-between mx-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button
                onClick={goToPrev}
                disabled={!hasPreviousPage || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-green-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-green-600" />}
              <button
                onClick={goToNext}
                disabled={!hasNextPage || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-green-700"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <InstanceDetail instance={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
