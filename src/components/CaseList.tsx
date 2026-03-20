import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CaseInstances } from '@uipath/uipath-typescript/cases';
import type { CaseInstanceGetResponse } from '@uipath/uipath-typescript/cases';
import type { PaginationCursor } from '@uipath/uipath-typescript/core';
import { StatusBadge } from './StatusBadge';
import { CaseDetail } from './CaseDetail';

type StatusFilter = 'all' | 'active' | 'completed';

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getCaseTypeStyle(caseType?: string | null) {
  if (!caseType) return { badge: 'bg-teal-100 text-teal-700 border border-teal-200', bar: 'bg-teal-500' };
  const hash = Array.from(caseType).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { badge: 'bg-orange-100 text-orange-700 border border-orange-200', bar: 'bg-orange-500' },
    { badge: 'bg-teal-100 text-teal-700 border border-teal-200',       bar: 'bg-teal-500' },
    { badge: 'bg-rose-100 text-rose-700 border border-rose-200',       bar: 'bg-rose-500' },
    { badge: 'bg-amber-100 text-amber-700 border border-amber-200',    bar: 'bg-amber-500' },
    { badge: 'bg-cyan-100 text-cyan-700 border border-cyan-200',       bar: 'bg-cyan-500' },
    { badge: 'bg-lime-100 text-lime-700 border border-lime-200',       bar: 'bg-lime-500' },
  ];
  return palettes[hash % palettes.length];
}

function isActive(status?: string | null) {
  return status === 'Running' || status === 'Open';
}
function isCompleted(status?: string | null) {
  return status === 'Completed' || status === 'Successful' || status === 'Closed';
}

// ── Light orange header ────────────────────────────────────────────────────────

function CaseHeader({
  totalCount,
  metrics,
  statusFilter,
  onStatusFilter,
}: {
  totalCount: number;
  metrics: { active: number; completed: number };
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
}) {
  return (
    <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cases</h1>
          <p className="text-xs text-gray-400 mt-0.5">UiPath Maestro</p>
        </div>
        {metrics.active > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {metrics.active} active
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
          onClick={() => onStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'active' ? 'bg-green-600' : metrics.active > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <p className={`text-xl font-bold ${statusFilter === 'active' ? 'text-white' : metrics.active > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {metrics.active}
            </p>
            {metrics.active > 0 && statusFilter !== 'active' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <p className={`text-xs mt-0.5 ${statusFilter === 'active' ? 'text-green-100' : metrics.active > 0 ? 'text-green-600' : 'text-gray-400'}`}>Active</p>
        </button>

        <button
          onClick={() => onStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'completed' ? 'bg-gray-800' : metrics.completed > 0 ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className={`text-xl font-bold ${statusFilter === 'completed' ? 'text-white' : metrics.completed > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
            {metrics.completed}
          </p>
          <p className={`text-xs mt-0.5 ${statusFilter === 'completed' ? 'text-gray-300' : metrics.completed > 0 ? 'text-gray-500' : 'text-gray-400'}`}>Resolved</p>
        </button>
      </div>
    </div>
  );
}

// ── Case type group ───────────────────────────────────────────────────────────

function CaseTypeGroup({
  caseType,
  items,
  open,
  onToggle,
  onSelect,
}: {
  caseType: string;
  items: CaseInstanceGetResponse[];
  open: boolean;
  onToggle: () => void;
  onSelect: (c: CaseInstanceGetResponse) => void;
}) {
  return (
    <div className="mb-1">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-left">
        <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight">{caseType}</span>
        <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px] shrink-0">{items.length}</span>
      </button>

      {open && (
        <div className="pb-1">
          {items.map(inst => {
            const cardStyle = getCaseTypeStyle(caseType === 'No Type' ? null : caseType);
            return (
              <div key={inst.instanceId} className="mx-3 mb-2">
                <button
                  onClick={() => onSelect(inst)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-3.5 py-3.5">
                    <div className={`w-10 h-10 rounded-xl ${cardStyle.bar} bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
                        {inst.caseTitle || inst.instanceDisplayName || inst.instanceId}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CaseList() {
  const { sdk } = useAuth();
  const caseInstances = useMemo(() => new CaseInstances(sdk), [sdk]);

  const [allItems, setAllItems] = useState<CaseInstanceGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<PaginationCursor | undefined>();
  const [prevCursors, setPrevCursors] = useState<PaginationCursor[]>([]);
  const [currentCursor, setCurrentCursor] = useState<PaginationCursor | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [selected, setSelected] = useState<CaseInstanceGetResponse | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const allGroupsRef = useRef<string[]>([]);
  const [fullItems, setFullItems] = useState<CaseInstanceGetResponse[]>([]);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const fetchPage = useCallback(async (cursor?: PaginationCursor) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  }, [caseInstances]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  // Fetch all cases when a status filter is active
  useEffect(() => {
    if (statusFilter === 'all' || fullItems.length > 0 || isLoadingFull) return;
    setIsLoadingFull(true);
    caseInstances.getAll()
      .then(result => setFullItems(result.items))
      .catch(() => {})
      .finally(() => setIsLoadingFull(false));
  }, [statusFilter, fullItems.length, isLoadingFull, caseInstances]);

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

  const baseList = statusFilter !== 'all' ? fullItems : allItems;
  const baseCount = statusFilter !== 'all' ? fullItems.length : (totalCount ?? allItems.length);

  const caseMetrics = useMemo(() => {
    const base = statusFilter !== 'all' && fullItems.length > 0 ? fullItems : allItems;
    return {
      active: base.filter(i => isActive(i.latestRunStatus)).length,
      completed: base.filter(i => isCompleted(i.latestRunStatus)).length,
    };
  }, [allItems, fullItems, statusFilter]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (statusFilter === 'active') list = list.filter(i => isActive(i.latestRunStatus));
    if (statusFilter === 'completed') list = list.filter(i => isCompleted(i.latestRunStatus));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(i =>
      i.caseTitle?.toLowerCase().includes(q) ||
      i.caseType?.toLowerCase().includes(q) ||
      i.instanceDisplayName?.toLowerCase().includes(q) ||
      i.startedByUser?.toLowerCase().includes(q)
    );
  }, [baseList, search, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, CaseInstanceGetResponse[]>();
    for (const i of filtered) {
      const key = i.caseType || 'No Type';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (isLoading && allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-orange-500" />
        <p className="text-xs text-gray-400 font-medium">Loading cases...</p>
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
        <button onClick={() => fetchPage()} className="text-xs bg-orange-700 text-white px-4 py-1.5 rounded-full font-medium">Retry</button>
      </div>
    );
  }

  const hasPreviousPage = prevCursors.length > 0;
  const allCollapsed = openGroups.size === 0;

  return (
    <>
      <div className="flex flex-col h-full">
        <CaseHeader
          totalCount={baseCount}
          metrics={caseMetrics}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        {/* Search */}
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
                placeholder="Search cases..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
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
            {search || statusFilter !== 'all' ? `${filtered.length} of ` : ''}{baseCount} cases
          </p>
          <button
            onClick={() => allCollapsed ? setOpenGroups(new Set(allGroupsRef.current)) : setOpenGroups(new Set())}
            className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:text-orange-900"
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
        <div className="flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4">
          {isLoadingFull && fullItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-orange-500" />
              <p className="text-xs text-gray-400 font-medium">Loading all cases...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">{search || statusFilter !== 'all' ? 'No matches found' : 'No case instances found'}</p>
            </div>
          ) : (
            grouped.map(([caseType, items]) => (
              <CaseTypeGroup
                key={caseType}
                caseType={caseType}
                items={items}
                open={openGroups.has(caseType)}
                onToggle={() => setOpenGroups(prev => {
                  const next = new Set(prev);
                  next.has(caseType) ? next.delete(caseType) : next.add(caseType);
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
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-orange-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-orange-500" />}
              <button
                onClick={goToNext}
                disabled={!hasNextPage || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-orange-700"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <CaseDetail instance={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
