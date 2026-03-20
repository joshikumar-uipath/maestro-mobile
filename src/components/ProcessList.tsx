import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Processes } from '@uipath/uipath-typescript/processes';
import { PackageType } from '@uipath/uipath-typescript/processes';
import type { ProcessGetResponse } from '@uipath/uipath-typescript/processes';
import { MaestroProcesses, ProcessInstances } from '@uipath/uipath-typescript/maestro-processes';
import type { MaestroProcessGetAllResponse, ProcessInstanceGetResponse } from '@uipath/uipath-typescript/maestro-processes';
import type { PaginationCursor } from '@uipath/uipath-typescript/core';
import { StatusBadge } from './StatusBadge';
import { ProcessDetail } from './ProcessDetail';
import { InstanceDetail } from './InstanceDetail';

// ── Type config ───────────────────────────────────────────────────────────────

type TypeFilter = 'all' | PackageType;

const TYPE_CONFIG: Partial<Record<PackageType, {
  label: string;
  icon: ReactNode;
  gradient: string;
  pill: string;
  accentBar: string;
  chipBg: string;
}>> = {
  [PackageType.Agent]: {
    label: 'Agent',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    pill: 'bg-violet-100 text-violet-700',
    accentBar: 'bg-violet-400',
    chipBg: 'bg-violet-600',
  },
  [PackageType.ProcessOrchestration]: {
    label: 'Orchestration',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-blue-600',
    pill: 'bg-indigo-100 text-indigo-700',
    accentBar: 'bg-indigo-400',
    chipBg: 'bg-indigo-600',
  },
  [PackageType.Process]: {
    label: 'RPA',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-sky-500 to-blue-500',
    pill: 'bg-sky-100 text-sky-700',
    accentBar: 'bg-sky-400',
    chipBg: 'bg-sky-600',
  },
  [PackageType.WebApp]: {
    label: 'Web App',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
    gradient: 'from-teal-500 to-emerald-500',
    pill: 'bg-teal-100 text-teal-700',
    accentBar: 'bg-teal-400',
    chipBg: 'bg-teal-600',
  },
  [PackageType.TestAutomationProcess]: {
    label: 'Test',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
    pill: 'bg-amber-100 text-amber-700',
    accentBar: 'bg-amber-400',
    chipBg: 'bg-amber-600',
  },
  [PackageType.Api]: {
    label: 'API',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-green-600',
    pill: 'bg-emerald-100 text-emerald-700',
    accentBar: 'bg-emerald-400',
    chipBg: 'bg-emerald-600',
  },
};

const defaultConfig = {
  label: 'Process',
  icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  gradient: 'from-gray-400 to-gray-500',
  pill: 'bg-gray-100 text-gray-600',
  accentBar: 'bg-gray-300',
  chipBg: 'bg-gray-500',
};

function getTypeConfig(packageType?: PackageType | null) {
  if (!packageType) return defaultConfig;
  return TYPE_CONFIG[packageType] ?? defaultConfig;
}

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTER_TYPES: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: PackageType.Agent, label: 'Agent' },
  { id: PackageType.Process, label: 'RPA' },
  { id: PackageType.ProcessOrchestration, label: 'Orchestration' },
  { id: PackageType.TestAutomationProcess, label: 'Test' },
  { id: PackageType.Api, label: 'API' },
  { id: PackageType.WebApp, label: 'Web App' },
];

type StatusFilter = 'all' | 'running' | 'faulted';

// ── Light Process Header ───────────────────────────────────────────────────────

function ProcessHeader({
  totalCount,
  metrics,
  statusFilter,
  onStatusFilter,
}: {
  totalCount: number;
  metrics: { totalRunning: number; totalFaulted: number; totalPending: number };
  statusFilter: StatusFilter;
  onStatusFilter: (f: StatusFilter) => void;
}) {
  return (
    <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Automations</h1>
          <p className="text-xs text-gray-400 mt-0.5">UiPath Orchestrator</p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          metrics.totalFaulted === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${metrics.totalFaulted === 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          {metrics.totalFaulted === 0 ? 'Healthy' : `${metrics.totalFaulted} failed`}
        </span>
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
            statusFilter === 'running' ? 'bg-green-600' : metrics.totalRunning > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <p className={`text-xl font-bold ${statusFilter === 'running' ? 'text-white' : metrics.totalRunning > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {metrics.totalRunning}
            </p>
            {metrics.totalRunning > 0 && statusFilter !== 'running' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <p className={`text-xs mt-0.5 ${statusFilter === 'running' ? 'text-green-100' : metrics.totalRunning > 0 ? 'text-green-600' : 'text-gray-400'}`}>Active</p>
        </button>

        <button
          onClick={() => onStatusFilter(statusFilter === 'faulted' ? 'all' : 'faulted')}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 ${
            statusFilter === 'faulted' ? 'bg-red-600' : metrics.totalFaulted > 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className={`text-xl font-bold ${statusFilter === 'faulted' ? 'text-white' : metrics.totalFaulted > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {metrics.totalFaulted}
          </p>
          <p className={`text-xs mt-0.5 ${statusFilter === 'faulted' ? 'text-red-100' : metrics.totalFaulted > 0 ? 'text-red-400' : 'text-gray-400'}`}>Failed</p>
        </button>
      </div>
    </div>
  );
}

// ── Instance mini-row ─────────────────────────────────────────────────────────

function InstanceRow({
  inst,
  onTap,
}: {
  inst: ProcessInstanceGetResponse;
  onTap: (i: ProcessInstanceGetResponse) => void;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onTap(inst); }}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-violet-50 active:bg-violet-100 transition-colors text-left"
    >
      <StatusBadge status={inst.latestRunStatus} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{inst.instanceDisplayName || inst.instanceId}</p>
      </div>
      <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ── Process card ──────────────────────────────────────────────────────────────

function ProcessCard({
  process,
  maestro,
  processInstances,
  onInfo,
  onInstance,
}: {
  process: ProcessGetResponse;
  maestro?: MaestroProcessGetAllResponse;
  processInstances: ProcessInstances;
  onInfo: (p: ProcessGetResponse) => void;
  onInstance: (i: ProcessInstanceGetResponse) => void;
}) {
  const isAgent = process.packageType === PackageType.Agent;
  const config = getTypeConfig(process.packageType);
  const [expanded, setExpanded] = useState(false);
  const [instances, setInstances] = useState<ProcessInstanceGetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
    } else {
      onInfo(process);
    }
  };

  return (
    <div className="bg-white rounded-2xl mx-3 mb-2 shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={handleCardTap} className="w-full text-left">
        <div className="flex items-center gap-3 px-3.5 py-3.5">
          {/* Gradient icon */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            {config.icon}
          </div>

          {/* Name + folder */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{process.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {process.description || process.folderName || ''}
            </p>
          </div>

          {/* Right side: type pill + chevron */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.pill}`}>
              {config.label}
            </span>
            {isAgent && (
              <svg
                className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Activity section for agents */}
        {isAgent && hasActivity && (
          <div className="px-3.5 pb-3.5">
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 mb-2">
              {running > 0 && (
                <div className="bg-blue-500 transition-all" style={{ flex: running }} />
              )}
              {pending > 0 && (
                <div className="bg-amber-400 transition-all" style={{ flex: pending }} />
              )}
              {faulted > 0 && (
                <div className="bg-red-400 transition-all" style={{ flex: faulted }} />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {running > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {running} running
                </span>
              )}
              {pending > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                  {pending} pending
                </span>
              )}
              {faulted > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {faulted} faulted
                </span>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Expanded instance panel */}
      {isAgent && expanded && (
        <div className="border-t border-gray-100 bg-gray-50/80">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500" />
            </div>
          )}
          {!loading && loaded && instances.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No recent instances</p>
          )}
          {instances.map(inst => (
            <InstanceRow key={inst.instanceId} inst={inst} onTap={onInstance} />
          ))}
          {loaded && instances.length >= 8 && (
            <p className="text-xs text-gray-400 text-center py-2 pb-2.5">Showing first 8 · see Agentic tab for all</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Folder section ────────────────────────────────────────────────────────────

function FolderSection({
  folderName,
  items,
  maestroMap,
  processInstances,
  open,
  onToggle,
  onInfo,
  onInstance,
}: {
  folderName: string;
  items: ProcessGetResponse[];
  maestroMap: Map<string, MaestroProcessGetAllResponse>;
  processInstances: ProcessInstances;
  open: boolean;
  onToggle: () => void;
  onInfo: (p: ProcessGetResponse) => void;
  onInstance: (i: ProcessInstanceGetResponse) => void;
}) {
  const runningTotal = items.reduce((s, p) => s + (maestroMap.get(p.key)?.runningCount ?? 0), 0);
  const faultedTotal = items.reduce((s, p) => s + (maestroMap.get(p.key)?.faultedCount ?? 0), 0);

  return (
    <div className="mb-1">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-left">
        <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex-1 text-left leading-tight">{folderName}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {runningTotal > 0 && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />{runningTotal} live
            </span>
          )}
          {faultedTotal > 0 && (
            <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">{faultedTotal} err</span>
          )}
          <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full text-[10px]">{items.length}</span>
        </div>
      </button>

      {open && (
        <div className="pb-1">
          {items.map(process => (
            <ProcessCard
              key={process.id}
              process={process}
              maestro={maestroMap.get(process.key)}
              processInstances={processInstances}
              onInfo={onInfo}
              onInstance={onInstance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProcessList() {
  const { sdk } = useAuth();
  const processes = useMemo(() => new Processes(sdk), [sdk]);
  const maestroProcesses = useMemo(() => new MaestroProcesses(sdk), [sdk]);
  const processInstances = useMemo(() => new ProcessInstances(sdk), [sdk]);

  const [allItems, setAllItems] = useState<ProcessGetResponse[]>([]);
  const [maestroMap, setMaestroMap] = useState<Map<string, MaestroProcessGetAllResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<PaginationCursor | undefined>();
  const [prevCursors, setPrevCursors] = useState<PaginationCursor[]>([]);
  const [currentCursor, setCurrentCursor] = useState<PaginationCursor | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [selectedProcess, setSelectedProcess] = useState<ProcessGetResponse | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstanceGetResponse | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const allFoldersRef = useRef<string[]>([]);
  // Full (unpaginated) list fetched on-demand when a status filter is active
  const [fullItems, setFullItems] = useState<ProcessGetResponse[]>([]);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const fetchPage = useCallback(async (cursor?: PaginationCursor) => {
    setIsLoading(true);
    setError(null);
    try {
      const [procResult, maestroResult] = await Promise.all([
        processes.getAll({ pageSize: 50, cursor }),
        maestroProcesses.getAll().catch(() => [] as MaestroProcessGetAllResponse[]),
      ]);
      const map = new Map<string, MaestroProcessGetAllResponse>();
      for (const mp of maestroResult) map.set(mp.processKey, mp);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load processes');
    } finally {
      setIsLoading(false);
    }
  }, [processes, maestroProcesses]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  // When a status filter is active, fetch ALL processes (unpaginated) so the filter is accurate
  useEffect(() => {
    if (statusFilter === 'all' || fullItems.length > 0 || isLoadingFull) return;
    setIsLoadingFull(true);
    processes.getAll()
      .then(result => setFullItems(result.items))
      .catch(() => {})
      .finally(() => setIsLoadingFull(false));
  }, [statusFilter, fullItems.length, isLoadingFull, processes]);

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

  // ── Computed metrics ───────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    let totalRunning = 0;
    let totalFaulted = 0;
    let totalPending = 0;
    for (const mp of maestroMap.values()) {
      totalRunning += mp.runningCount ?? 0;
      totalFaulted += mp.faultedCount ?? 0;
      totalPending += mp.pendingCount ?? 0;
    }
    return { totalRunning, totalFaulted, totalPending };
  }, [maestroMap]);

  const typeCounts = useMemo(() => {
    const base = statusFilter !== 'all' ? fullItems : allItems;
    const counts = new Map<PackageType, number>();
    for (const p of base) {
      if (p.packageType) counts.set(p.packageType, (counts.get(p.packageType) ?? 0) + 1);
    }
    return counts;
  }, [allItems, fullItems, statusFilter]);

  // ── Filter & group ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // Use the full (unpaginated) list when a status filter is active
    let list = statusFilter !== 'all' ? fullItems : allItems;
    if (typeFilter !== 'all') list = list.filter(p => p.packageType === typeFilter);
    if (statusFilter === 'running') list = list.filter(p => (maestroMap.get(p.key)?.runningCount ?? 0) > 0);
    if (statusFilter === 'faulted') list = list.filter(p => (maestroMap.get(p.key)?.faultedCount ?? 0) > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.folderName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, fullItems, search, typeFilter, statusFilter, maestroMap]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProcessGetResponse[]>();
    for (const p of filtered) {
      const folder = p.folderName || 'No Folder';
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(p);
    }
    for (const [, items] of map) {
      items.sort((a, b) => {
        const aR = maestroMap.get(a.key)?.runningCount ?? 0;
        const bR = maestroMap.get(b.key)?.runningCount ?? 0;
        if (bR !== aR) return bR - aR;
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, maestroMap]);

  const toggleFolder = useCallback((folder: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder); else next.add(folder);
      return next;
    });
  }, []);

  const allCollapsed = openFolders.size === 0;
  const baseCount = statusFilter !== 'all' ? fullItems.length : (totalCount ?? allItems.length);
  const visibleFilters = FILTER_TYPES.filter(f => f.id === 'all' || (typeCounts.get(f.id as PackageType) ?? 0) > 0);

  if (isLoading && allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600" />
        <p className="text-xs text-gray-400 font-medium">Loading processes...</p>
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
        <button onClick={() => fetchPage()} className="text-xs bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium">Retry</button>
      </div>
    );
  }

  const hasPreviousPage = prevCursors.length > 0;

  return (
    <>
      <div className="flex flex-col h-full">

        {/* Light process header */}
        <ProcessHeader
          totalCount={totalCount ?? allItems.length}
          metrics={metrics}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        {/* Search + filters strip */}
        <div className="bg-white border-b border-gray-100 shrink-0">
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -trangray-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search processes..."
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

          {/* Type filter chips */}
          <div className="overflow-x-auto px-3 pb-3">
            <div className="flex gap-1.5 min-w-max">
              {visibleFilters.map(f => {
                const active = typeFilter === f.id;
                const count = f.id === 'all' ? baseCount : (typeCounts.get(f.id as PackageType) ?? 0);
                return (
                  <button
                    key={f.id}
                    onClick={() => setTypeFilter(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {f.label}
                    <span className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expand/collapse row */}
        <div className="px-4 py-2 flex items-center justify-between bg-gray-50 shrink-0 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            {isLoadingFull && <span className="animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" />}
            {search || typeFilter !== 'all' || statusFilter !== 'all' ? `${filtered.length} of ` : ''}{baseCount} processes
          </p>
          <button
            onClick={() => allCollapsed ? setOpenFolders(new Set(allFoldersRef.current)) : setOpenFolders(new Set())}
            className="text-xs text-gray-600 font-semibold flex items-center gap-1 hover:text-gray-900"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {allCollapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
            </svg>
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pt-2 pb-4">
          {isLoadingFull && fullItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-gray-600" />
              <p className="text-xs text-gray-400 font-medium">Loading all processes...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">{search || typeFilter !== 'all' ? 'No matches found' : 'No processes found'}</p>
            </div>
          ) : (
            grouped.map(([folder, items]) => (
              <FolderSection
                key={folder}
                folderName={folder}
                items={items}
                maestroMap={maestroMap}
                processInstances={processInstances}
                open={openFolders.has(folder)}
                onToggle={() => toggleFolder(folder)}
                onInfo={setSelectedProcess}
                onInstance={setSelectedInstance}
              />
            ))
          )}

          {(hasNextPage || hasPreviousPage) && statusFilter === 'all' && (
            <div className="flex items-center justify-between mx-3 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button
                onClick={goToPrev}
                disabled={!hasPreviousPage || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-gray-600" />}
              <button
                onClick={goToNext}
                disabled={!hasNextPage || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 disabled:opacity-30 hover:text-gray-800"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedProcess && <ProcessDetail process={selectedProcess} onClose={() => setSelectedProcess(null)} />}
      {selectedInstance && <InstanceDetail instance={selectedInstance} onClose={() => setSelectedInstance(null)} />}
    </>
  );
}
