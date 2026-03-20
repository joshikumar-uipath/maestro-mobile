import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProcessInstances } from '@uipath/uipath-typescript/maestro-processes';
import type { ProcessInstanceGetResponse, ProcessInstanceExecutionHistoryResponse } from '@uipath/uipath-typescript/maestro-processes';
import { StatusBadge } from './StatusBadge';

interface InstanceDetailProps {
  instance: ProcessInstanceGetResponse;
  onClose: () => void;
}

type Tab = 'maestro' | 'info' | 'history' | 'variables';

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

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

/** Convert API base URL (staging.api.uipath.com) → web UI URL (staging.uipath.com) */
function toWebBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace('://staging.api.', '://staging.').replace('://cloud.api.', '://cloud.').replace('://alpha.api.', '://alpha.');
}

export function InstanceDetail({ instance, onClose }: InstanceDetailProps) {
  const { sdk } = useAuth();
  const processInstances = useMemo(() => new ProcessInstances(sdk), [sdk]);
  const [tab, setTab] = useState<Tab>('maestro');
  const [history, setHistory] = useState<ProcessInstanceExecutionHistoryResponse[]>([]);
  const [variables, setVariables] = useState<{ name: string; value: unknown; type: string; source: string }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingVars, setLoadingVars] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [varsError, setVarsError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'history' && history.length === 0 && !loadingHistory) {
      setLoadingHistory(true);
      setHistoryError(null);
      processInstances.getExecutionHistory(instance.instanceId)
        .then(h => setHistory(h))
        .catch(err => setHistoryError(err instanceof Error ? err.message : 'Failed to load history'))
        .finally(() => setLoadingHistory(false));
    }
  }, [tab, instance.instanceId, history.length, loadingHistory, processInstances]);

  useEffect(() => {
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
  const maestroUrl = useMemo(() => {
    const webBase = toWebBaseUrl(sdk.config.baseUrl);
    const org = sdk.config.orgName;
    const tenant = sdk.config.tenantName;
    const { processKey, instanceId, folderKey } = instance;
    return `${webBase}/${org}/${tenant}/maestro_/processes/${processKey}/instances/${instanceId}?folderKey=${folderKey}`;
  }, [sdk, instance]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'maestro',   label: 'Maestro' },
    { id: 'info',      label: 'Info' },
    { id: 'history',   label: 'History' },
    { id: 'variables', label: 'Variables' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-0 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-2 pb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {instance.instanceDisplayName || instance.instanceId}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={instance.latestRunStatus} />
                {instance.source && (
                  <span className="text-xs text-gray-400">{instance.source}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0">&times;</button>
          </div>

          <div className="flex gap-0 overflow-x-auto">
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

        {/* Body — scrollable tabs */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {tab === 'maestro' && (
            <div className="mt-3">
              {/* Status card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={instance.latestRunStatus} />
                </div>
                {instance.source && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Trigger</p>
                    <p className="text-xs font-medium text-gray-700">{instance.source}</p>
                  </div>
                )}
              </div>

              {/* Key fields */}
              <dl className="mb-4">
                <Field label="Started By" value={instance.startedByUser} />
                <Field label="Started" value={formatTime(instance.startedTime)} />
                <Field label="Completed" value={formatTime(instance.completedTime)} />
                <Field label="Process Key" value={instance.processKey} />
                <Field label="Folder Key" value={instance.folderKey} />
              </dl>

              {/* Open in Maestro button */}
              <a
                href={maestroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Maestro
              </a>
            </div>
          )}

          {tab === 'info' && (
            <dl className="mt-3">
              <Field label="Instance ID" value={instance.instanceId} />
              <Field label="Started By" value={instance.startedByUser} />
              <Field label="Started" value={formatTime(instance.startedTime)} />
              <Field label="Completed" value={formatTime(instance.completedTime)} />
              <Field label="Process Key" value={instance.processKey} />
              <Field label="Package" value={`${instance.packageId}@${instance.packageVersion}`} />
              <Field label="Latest Run ID" value={instance.latestRunId} />
              <Field label="Folder Key" value={instance.folderKey} />
              <Field label="User ID" value={instance.userId} />
              <Field label="Source" value={instance.source} />
            </dl>
          )}

          {tab === 'history' && (
            <div className="mt-3">
              {loadingHistory && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                </div>
              )}
              {historyError && <p className="text-sm text-red-600">{historyError}</p>}
              {!loadingHistory && !historyError && history.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No execution history</p>
              )}
              {history.map((span) => (
                <div key={span.id} className="py-2 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 flex-1">{span.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(span.startedTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {span.endTime && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      End: {new Date(span.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'variables' && (
            <div className="mt-3">
              {loadingVars && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                </div>
              )}
              {varsError && <p className="text-sm text-red-600">{varsError}</p>}
              {!loadingVars && !varsError && variables.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No variables</p>
              )}
              {variables.map((v, i) => (
                <div key={`${v.name}-${i}`} className="py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{v.type}</span>
                  </div>
                  {v.source && <p className="text-xs text-gray-400 mt-0.5">from: {v.source}</p>}
                  <pre className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                    {renderValue(v.value)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
