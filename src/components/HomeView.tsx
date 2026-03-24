import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Processes, PackageType } from '@uipath/uipath-typescript/processes';
import type { ProcessGetResponse } from '@uipath/uipath-typescript/processes';
import { MaestroProcesses, ProcessInstances } from '@uipath/uipath-typescript/maestro-processes';
import type { MaestroProcessGetAllResponse, ProcessInstanceGetResponse } from '@uipath/uipath-typescript/maestro-processes';
import { CaseInstances } from '@uipath/uipath-typescript/cases';
import type { CaseInstanceGetResponse } from '@uipath/uipath-typescript/cases';
import { type TimePeriod, getStartDate } from '../utils/timePeriod';

// ── Jobs API types ─────────────────────────────────────────────────────────────
interface OrchestratorJob {
  Id: number;
  State: string; // Pending | Running | Stopping | Faulted | Successful | Stopped | Suspended
  StartTime: string | null;
  EndTime: string | null;
  PackageType?: string;        // Process | Agent | etc. — direct field on job
  ReleaseId?: number;
  Release?: { Id: number };
  ReleaseName?: string;
  OrganizationUnitId?: number;
}

// ── Type config ────────────────────────────────────────────────────────────────
type TypeInfo = { label: string };
const TYPE_INFO: Partial<Record<PackageType, TypeInfo>> = {
  [PackageType.Process]:              { label: 'RPA'          },
  [PackageType.Agent]:                { label: 'Agents'       },
  [PackageType.ProcessOrchestration]: { label: 'Orchestration'},
  [PackageType.TestAutomationProcess]:{ label: 'Testing'      },
  [PackageType.Api]:                  { label: 'API'          },
  [PackageType.WebApp]:               { label: 'Web App'      },
};

// ── Gauge chart (right side of card) ─────────────────────────────────────────
const GAUGE_COLORS = [
  '#064e3b', '#064e3b', '#064e3b', '#064e3b',
  '#064e3b', '#064e3b', '#064e3b',
  '#047857', '#059669', '#10b981',
  '#22c55e', '#4ade80', '#86efac',
  '#d1fae5', '#e5e7eb',
];
const GAUGE_DELAYS = [0.4,0.6,0.8,1.0,1.2,1.3,1.4,1.6,1.8,2.1,2.25,2.3,2.45,2.5,2.75];

function GaugeChart({ value, badge, activeSegments = 14 }: {
  value: number | string;
  badge?: string;
  activeSegments?: number;
}) {
  const total = 15;
  // Width 148px, radius ≈ 64px (diameter 128px) — wider arc using the right-side space.
  // alignSelf: stretch fills the card's full content height; space-evenly distributes items.
  return (
    <div
      className="flex flex-col items-center shrink-0"
      style={{ width: 148, alignSelf: 'flex-start' }}
    >
      <style>{`@keyframes gseg{to{opacity:1}}`}</style>

      {/* Arc wrapper — text sits inside the arc mouth via absolute positioning */}
      <div className="relative" style={{ width: 148, height: 82 }}>
        {Array.from({ length: total }, (_, i) => {
          const angle = (i * 180) / (total - 1) - 90;
          const isActive = i < activeSegments;
          return (
            <div
              key={i}
              style={{
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
              }}
            />
          );
        })}
        {/* Text inside the arc mouth */}
        <div style={{
          position: 'absolute', bottom: 4, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', lineHeight: 1 }}>{value}</p>
          {badge && (
            <span style={{ fontSize: 8, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: 999 }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({
  category, value, sub, subColor = 'text-green-500', gauge, onClick,
}: {
  category: string;
  value: string | number;
  sub: string;
  subColor?: string;
  gauge: { value: number | string; badge?: string; activeSegments: number };
  onClick?: () => void;
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '12px 16px 14px' }}>
      {/* Category label is in the left column so arc starts at the very top */}
      <div className="flex items-start justify-between" style={{ gap: 16 }}>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase" style={{ marginBottom: 6 }}>
            {category}
          </p>
          <p className="text-[30px] font-black text-gray-900 leading-none tracking-tight">{value}</p>
          <p className={`text-[10px] font-semibold leading-snug ${subColor}`} style={{ marginTop: 6 }}>{sub}</p>
        </div>
        <GaugeChart {...gauge} />
      </div>
    </div>
  );
  return onClick
    ? <button onClick={onClick} className="w-full text-left active:scale-[0.99] transition-transform">{inner}</button>
    : <div>{inner}</div>;
}

// ── Bottom section card ────────────────────────────────────────────────────────
function SectionCard({
  title, subtitle, children, action, onAction,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        {action && (
          <button onClick={onAction} className="text-xs font-semibold text-indigo-500">{action}</button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Running instance row ───────────────────────────────────────────────────────
function RunRow({ inst, isLast }: { inst: ProcessInstanceGetResponse; isLast: boolean }) {
  const name = inst.instanceDisplayName || inst.instanceId || 'Automation';
  const initials = name.split(/[\s_-]/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'AU';
  const user = inst.startedByUser ?? '';
  const userInitials = user.split(/[\s@.]/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '—';

  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${!isLast ? 'border-b border-gray-50' : ''}`}>
      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-indigo-600">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Agent Run</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Active
        </span>
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-[8px] font-bold text-gray-500">{userInitials}</span>
        </div>
      </div>
    </div>
  );
}

// ── Greeting helper ────────────────────────────────────────────────────────────
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Tenant dropdown ────────────────────────────────────────────────────────────
function TenantDropdown({
  orgName, tenantName, open, onClose,
}: {
  orgName: string;
  tenantName: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  // Derive a display-friendly tenant label (strip internal prefixes if any)
  const tenantDisplay = tenantName || 'Default';
  const orgDisplay = orgName || 'Organization';

  // Build the tenant list — currently one entry from config.
  // Add more entries here when multi-tenant support is available.
  const tenants = [
    { name: orgDisplay, tenant: tenantDisplay, active: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown panel */}
      <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Switch Workspace</p>
        </div>

        {/* Tenant list */}
        <div className="py-1.5">
          {tenants.map((t, i) => (
            <button
              key={i}
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>

              {/* Name + tenant label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">Tenant: {t.tenant}</p>
              </div>

              {/* Active check */}
              {t.active && (
                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Logged into <span className="font-semibold text-gray-600">{tenantDisplay}</span> tenant.
            Contact your admin to access additional tenants.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function HomeView({ onNavigate, timePeriod }: { onNavigate: (tab: 'processes' | 'agentic' | 'cases') => void; timePeriod: TimePeriod }) {
  const { sdk } = useAuth();
  const processes = useMemo(() => new Processes(sdk), [sdk]);
  const maestroProcesses = useMemo(() => new MaestroProcesses(sdk), [sdk]);
  const processInstances = useMemo(() => new ProcessInstances(sdk), [sdk]);
  const caseInstances = useMemo(() => new CaseInstances(sdk), [sdk]);

  const [allProcesses, setAllProcesses] = useState<ProcessGetResponse[]>([]);
  const [maestroList, setMaestroList] = useState<MaestroProcessGetAllResponse[]>([]);
  const [allInstances, setAllInstances] = useState<ProcessInstanceGetResponse[]>([]);
  const [caseItems, setCaseItems] = useState<CaseInstanceGetResponse[]>([]);
  const [caseTotalCount, setCaseTotalCount] = useState<number>(0);
  const [allJobs, setAllJobs] = useState<OrchestratorJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantOpen, setTenantOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    processes.getAll({ pageSize: 100 }).then(r => {
      if (cancelled) return;
      const items = 'items' in r ? r.items : Array.isArray(r) ? r : [];
      console.log('[Processes] count:', items.length, 'types:', [...new Set(items.map((p: ProcessGetResponse) => p.packageType))], 'sample id:', items[0]?.id, 'folderId:', items[0]?.folderId);
      if ('items' in r) setAllProcesses(r.items);
      else if (Array.isArray(r)) setAllProcesses(r);
    }).catch((err) => console.error('[Processes] FAILED:', err)).finally(() => { if (!cancelled) setIsLoading(false); });

    maestroProcesses.getAll().then(r => {
      if (cancelled) return;
      if (Array.isArray(r)) setMaestroList(r);
    }).catch(() => {});

    // Fetch a large page so client-side time filtering has enough coverage
    processInstances.getAll({ pageSize: 100 }).then(r => {
      if (cancelled) return;
      let items: ProcessInstanceGetResponse[] = [];
      if ('items' in r) items = r.items;
      else if (Array.isArray(r)) items = r;
      setAllInstances(items);
    }).catch(() => {});

    // Fetch case instances for client-side time filtering
    caseInstances.getAll({ pageSize: 100 }).then(r => {
      if (cancelled) return;
      if ('totalCount' in r && typeof r.totalCount === 'number') setCaseTotalCount(r.totalCount);
      if ('items' in r) setCaseItems((r as { items: CaseInstanceGetResponse[] }).items);
      else if (Array.isArray(r)) setCaseItems(r as CaseInstanceGetResponse[]);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [processes, maestroProcesses, processInstances, caseInstances]);

  // Fetch Jobs — try without folder header first (cross-folder), then per-folder if empty
  useEffect(() => {
    const token = sdk.getToken();
    if (!token) return;
    const { baseUrl, orgName, tenantName } = sdk.config;
    let cancelled = false;

    const fetchJobs = (extraHeaders: Record<string, string> = {}) =>
      fetch(`${baseUrl}/${orgName}/${tenantName}/orchestrator_/odata/Jobs?$top=500&$orderby=StartTime desc`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...extraHeaders },
      }).then(r => r.json());

    // Step 1: try cross-folder (no folder header)
    fetchJobs()
      .then(data => {
        console.log('[Jobs API] cross-folder status, count:', data.value?.length, 'error:', data.message ?? data['@odata.error']?.message?.value, 'sample:', JSON.stringify(data.value?.[0]));
        if (!cancelled && data.value?.length > 0) {
          setAllJobs(data.value);
        } else if (!cancelled && allInstances.length > 0) {
          // Step 2: fall back to per-folder using folderKey from instances
          const folderKeys = [...new Set(allInstances.map((i) => i.folderKey).filter(Boolean))];
          console.log('[Jobs API] falling back to per-folder, keys:', folderKeys);
          Promise.all(folderKeys.map(key =>
            fetchJobs({ 'X-UIPATH-FolderKey': key })
              .then((d): OrchestratorJob[] => { console.log('[Jobs API] folder', key, 'count:', d.value?.length, 'err:', d.message); return d.value ?? []; })
              .catch(() => [] as OrchestratorJob[])
          )).then(results => { if (!cancelled) setAllJobs(results.flat()); });
        }
      })
      .catch(err => console.error('[Jobs API] error:', err));

    return () => { cancelled = true; };
  }, [sdk, allInstances]);

  // ── Time filter ──────────────────────────────────────────────────────────────
  const startDate = useMemo(() => getStartDate(timePeriod), [timePeriod]);

  // Map process id → packageType for categorising jobs
  const processTypeMap = useMemo(() => {
    const map = new Map<number, PackageType>();
    for (const p of allProcesses) {
      if (p.id != null && p.packageType) map.set(p.id, p.packageType);
    }
    console.log('[processTypeMap] size:', map.size, 'entries:', [...map.entries()].slice(0, 3));
    return map;
  }, [allProcesses]);

  // Time-filtered jobs
  const filteredJobs = useMemo(() => {
    if (!startDate) return allJobs;
    return allJobs.filter(j => j.StartTime && new Date(j.StartTime) >= startDate);
  }, [allJobs, startDate]);

  const rpaJobs = useMemo(() => {
    const jobs = filteredJobs.filter(j => {
      if (j.PackageType) return j.PackageType === 'Process';
      const rid = j.ReleaseId ?? j.Release?.Id;
      return rid != null && processTypeMap.get(rid) === PackageType.Process;
    });
    console.log('[rpaJobs] total filtered:', filteredJobs.length, 'rpa:', jobs.length, 'samplePkgType:', filteredJobs[0]?.PackageType);
    return jobs;
  }, [filteredJobs, processTypeMap]);

  const agentJobs = useMemo(() => {
    const jobs = filteredJobs.filter(j => {
      if (j.PackageType) return j.PackageType === 'Agent';
      const rid = j.ReleaseId ?? j.Release?.Id;
      return rid != null && processTypeMap.get(rid) === PackageType.Agent;
    });
    console.log('[agentJobs] agent:', jobs.length);
    return jobs;
  }, [filteredJobs, processTypeMap]);

  function jobMetrics(jobs: OrchestratorJob[]) {
    const completed = jobs.filter(j => j.State === 'Successful' || j.State === 'Stopped').length;
    const running   = jobs.filter(j => j.State === 'Running' || j.State === 'Pending' || j.State === 'Resuming').length;
    const faulted   = jobs.filter(j => j.State === 'Faulted').length;
    const total     = jobs.length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, running, faulted, completionPct };
  }

  const filteredInstances = useMemo(() => {
    if (!startDate) return allInstances;
    return allInstances.filter(i => i.startedTime && new Date(i.startedTime) >= startDate);
  }, [allInstances, startDate]);

  const runningInstances = useMemo(
    () => filteredInstances.filter(i => i.latestRunStatus === 'Running'),
    [filteredInstances]
  );

  const caseCount = useMemo(() => {
    if (!startDate) return caseTotalCount;
    return caseItems.filter(c => c.startedTime && new Date(c.startedTime) >= startDate).length;
  }, [caseItems, caseTotalCount, startDate]);

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    let totalRunning = 0, totalFaulted = 0, totalPending = 0;
    for (const mp of maestroList) {
      totalRunning += mp.runningCount ?? 0;
      totalFaulted += mp.faultedCount ?? 0;
      totalPending += mp.pendingCount ?? 0;
    }
    return { totalRunning, totalFaulted, totalPending };
  }, [maestroList]);

  const typeRows = useMemo(() => {
    const counts = new Map<PackageType, number>();
    for (const p of allProcesses) {
      if (p.packageType) counts.set(p.packageType, (counts.get(p.packageType) ?? 0) + 1);
    }
    return (Object.entries(TYPE_INFO) as [PackageType, TypeInfo][])
      .map(([type, info]) => ({ type, ...info, count: counts.get(type) ?? 0 }))
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allProcesses]);

  // ── Helper: completion-rate metrics from instances (used for Agentic Process card) ──
  const DONE_STATUSES = new Set(['Completed', 'Successful', 'Succeeded', 'Closed', 'Resolved', 'Finished']);

  function instanceMetrics(instances: typeof filteredInstances) {
    const completed = instances.filter(i => DONE_STATUSES.has(i.latestRunStatus)).length;
    const running   = instances.filter(i => i.latestRunStatus === 'Running').length;
    const faulted   = instances.filter(i => i.latestRunStatus === 'Faulted' || i.latestRunStatus === 'Failed').length;
    const total     = instances.length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, running, faulted, completionPct };
  }

  function completionGauge(m: ReturnType<typeof instanceMetrics>) {
    const pct = m.completionPct;
    return {
      value: m.total > 0 ? `${pct}%` : '—',
      badge: m.total === 0 ? 'No data' : pct >= 80 ? 'Efficient' : pct >= 50 ? 'Moderate' : 'Low',
      activeSegments: m.total > 0 ? Math.max(1, Math.round((pct / 100) * 14)) : 1,
    };
  }

  // ── Card 1: Automations (RPA) — from Jobs API ─────────────────────────────────
  const rpaM = jobMetrics(rpaJobs);
  const rpaSub = rpaM.total > 0
    ? `${rpaM.completed} done · ${rpaM.running} running · ${rpaM.faulted} faulted`
    : 'No RPA runs in period';
  const rpaSubColor = rpaM.faulted > 0 ? 'text-red-400' : rpaM.completed > 0 ? 'text-green-500' : 'text-gray-400';
  const rpaGauge = {
    value: rpaM.total > 0 ? `${rpaM.completionPct}%` : '—',
    badge: rpaM.total === 0 ? 'No data' : rpaM.completionPct >= 80 ? 'Efficient' : rpaM.completionPct >= 50 ? 'Moderate' : 'Low',
    activeSegments: rpaM.total > 0 ? Math.max(1, Math.round((rpaM.completionPct / 100) * 14)) : 1,
  };

  // ── Card 2: AI Agents — from Jobs API ────────────────────────────────────────
  const agentM = jobMetrics(agentJobs);
  const aiAgentSub = agentM.total > 0
    ? `${agentM.completed} done · ${agentM.running} running · ${agentM.faulted} faulted`
    : 'No agent runs in period';
  const aiAgentSubColor = agentM.faulted > 0 ? 'text-red-400' : agentM.completed > 0 ? 'text-green-500' : 'text-gray-400';
  const aiAgentGauge = {
    value: agentM.total > 0 ? `${agentM.completionPct}%` : '—',
    badge: agentM.total === 0 ? 'No data' : agentM.completionPct >= 80 ? 'Efficient' : agentM.completionPct >= 50 ? 'Moderate' : 'Low',
    activeSegments: agentM.total > 0 ? Math.max(1, Math.round((agentM.completionPct / 100) * 14)) : 1,
  };

  // ── Card 3: Agentic Process — all Maestro process instances in period ───────
  const orchInstances = filteredInstances;
  const orchM = instanceMetrics(orchInstances);
  const totalJobs = orchM.total;
  const orchSub = totalJobs > 0
    ? `${orchM.completed} done · ${orchM.running} running · ${orchM.faulted} faulted`
    : 'No orchestration jobs in period';
  const orchSubColor = orchM.faulted > 0 ? 'text-red-400' : orchM.completed > 0 ? 'text-green-500' : 'text-gray-400';
  const orchGauge = completionGauge(orchM);

  // ── Card 4: Case Management ───────────────────────────────────────────────────
  // Apply completion rate using time-filtered caseItems
  const filteredCaseItems = useMemo(() => {
    if (!startDate) return caseItems;
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
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-[#f7f7f7]">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f7f7] h-full">

      {/* ── Header ── */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{greeting()}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Workspace selector */}
            <div className="relative">
              <button
                onClick={() => setTenantOpen(o => !o)}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl"
              >
                <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">{orgLabel}</span>
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform ${tenantOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <TenantDropdown
                orgName={sdk.config.orgName || ''}
                tenantName={sdk.config.tenantName || ''}
                open={tenantOpen}
                onClose={() => setTenantOpen(false)}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="px-4 pt-4 pb-6 flex flex-col gap-3">

        {/* Card 1: Automations (RPA) */}
        <MetricCard
          category="Automations (RPA)"
          value={rpaM.total}
          sub={rpaSub}
          subColor={rpaSubColor}
          gauge={rpaGauge}
          onClick={() => onNavigate('processes')}
        />

        {/* Card 2: AI Agents */}
        <MetricCard
          category="AI Agents"
          value={agentM.total}
          sub={aiAgentSub}
          subColor={aiAgentSubColor}
          gauge={aiAgentGauge}
          onClick={() => onNavigate('agentic')}
        />

        {/* Card 3: Agentic Process */}
        <MetricCard
          category="Agentic Process"
          value={totalJobs}
          sub={orchSub}
          subColor={orchSubColor}
          gauge={orchGauge}
          onClick={() => onNavigate('agentic')}
        />

        {/* Card 4: Case Management */}
        <MetricCard
          category="Case Management"
          value={caseCount}
          sub={caseSub}
          subColor={caseSubColor}
          gauge={caseGauge}
          onClick={() => onNavigate('cases')}
        />

        {/* ── Active Runs section ── */}
        <SectionCard
          title="Active Runs"
          subtitle={
            metrics.totalRunning > 0
              ? `${metrics.totalRunning} automation${metrics.totalRunning !== 1 ? 's' : ''} running now`
              : 'No active runs at the moment'
          }
          action={runningInstances.length > 0 ? 'View all' : undefined}
          onAction={() => onNavigate('agentic')}
        >
          {runningInstances.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">All clear — nothing running right now</p>
            </div>
          ) : (
            runningInstances.slice(0, 5).map((inst, i) => (
              <RunRow
                key={inst.instanceId}
                inst={inst}
                isLast={i === Math.min(runningInstances.length, 5) - 1}
              />
            ))
          )}
        </SectionCard>

        {/* ── Summary row ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Types', value: typeRows.length, color: 'text-indigo-600' },
            { label: 'Queued', value: metrics.totalPending, color: 'text-amber-600' },
            { label: 'Failed', value: metrics.totalFaulted, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
