import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CaseInstances } from '@uipath/uipath-typescript/cases';
import type { CaseInstanceGetResponse, CaseGetStageResponse } from '@uipath/uipath-typescript/cases';
import { StatusBadge } from './StatusBadge';

interface CaseDetailProps {
  instance: CaseInstanceGetResponse;
  onClose: () => void;
}

type Tab = 'info' | 'stages' | 'history';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 break-all">{String(value)}</dd>
    </div>
  );
}

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function CaseDetail({ instance, onClose }: CaseDetailProps) {
  const { sdk } = useAuth();
  const caseInstances = useMemo(() => new CaseInstances(sdk), [sdk]);
  const [tab, setTab] = useState<Tab>('info');
  const [stages, setStages] = useState<CaseGetStageResponse[]>([]);
  const [history, setHistory] = useState<{ status: string; startedTime: string }[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'stages' && stages.length === 0 && !loadingStages) {
      setLoadingStages(true);
      setStagesError(null);
      caseInstances.getStages(instance.instanceId, instance.folderKey)
        .then(s => setStages(s))
        .catch(err => setStagesError(err instanceof Error ? err.message : 'Failed to load stages'))
        .finally(() => setLoadingStages(false));
    }
  }, [tab, instance.instanceId, instance.folderKey, stages.length, loadingStages, caseInstances]);

  useEffect(() => {
    if (tab === 'history' && history.length === 0 && !loadingHistory) {
      setLoadingHistory(true);
      setHistoryError(null);
      caseInstances.getExecutionHistory(instance.instanceId, instance.folderKey)
        .then(h => {
          const executions = h.elementExecutions ?? [];
          setHistory(executions.map((e: { status?: string; startedTime?: string }) => ({
            status: e.status ?? 'Unknown',
            startedTime: e.startedTime ?? '',
          })));
        })
        .catch(err => setHistoryError(err instanceof Error ? err.message : 'Failed to load history'))
        .finally(() => setLoadingHistory(false));
    }
  }, [tab, instance.instanceId, instance.folderKey, history.length, loadingHistory, caseInstances]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'stages', label: 'Stages' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-0 border-b border-gray-200">
          <div className="flex items-start justify-between gap-2 pb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {instance.caseTitle || instance.instanceDisplayName || instance.instanceId}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={instance.latestRunStatus} />
                {instance.caseType && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{instance.caseType}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0">&times;</button>
          </div>
          <div className="flex gap-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-green-500 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {tab === 'info' && (
            <dl className="mt-3">
              <Field label="Case Title" value={instance.caseTitle} />
              <Field label="Case Type" value={instance.caseType} />
              <Field label="Instance ID" value={instance.instanceId} />
              <Field label="Started By" value={instance.startedByUser} />
              <Field label="Started" value={formatTime(instance.startedTime)} />
              <Field label="Completed" value={formatTime(instance.completedTime)} />
              <Field label="Process Key" value={instance.processKey} />
              <Field label="Package" value={`${instance.packageId}@${instance.packageVersion}`} />
              <Field label="Source" value={instance.source} />
              <Field label="Folder Key" value={instance.folderKey} />
            </dl>
          )}

          {tab === 'stages' && (
            <div className="mt-3">
              {loadingStages && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              )}
              {stagesError && <p className="text-sm text-red-600">{stagesError}</p>}
              {!loadingStages && !stagesError && stages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No stages found</p>
              )}
              {stages.map((stage) => (
                <div key={stage.id} className="py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                    <StatusBadge status={stage.status} />
                  </div>
                  {stage.tasks.flat().map((task) => (
                    <div key={task.id} className="ml-3 mt-2 py-1.5 border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700">{task.name}</p>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{task.type}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab === 'history' && (
            <div className="mt-3">
              {loadingHistory && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              )}
              {historyError && <p className="text-sm text-red-600">{historyError}</p>}
              {!loadingHistory && !historyError && history.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No execution history</p>
              )}
              {history.map((item, i) => (
                <div key={i} className="py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-400">
                      {item.startedTime ? new Date(item.startedTime).toLocaleTimeString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
