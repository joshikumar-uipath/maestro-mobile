import type { ProcessGetResponse } from '@uipath/uipath-typescript/processes';

interface ProcessDetailProps {
  process: ProcessGetResponse;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 break-all">{String(value)}</dd>
    </div>
  );
}

export function ProcessDetail({ process, onClose }: ProcessDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 truncate pr-4">{process.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          <dl className="mt-3">
            <Field label="Package Type" value={process.packageType} />
            <Field label="Package Version" value={process.packageVersion} />
            <Field label="Folder" value={process.folderName} />
            <Field label="Target Framework" value={process.targetFramework} />
            <Field label="Robot Size" value={process.robotSize} />
            <Field label="Auto Update" value={process.autoUpdate ? 'Yes' : 'No'} />
            <Field label="Package Key" value={process.packageKey} />
            <Field label="Process ID" value={process.id} />
            <Field label="Folder Key" value={process.folderKey} />
            <Field label="Created" value={process.createdTime} />
            <Field label="Last Modified" value={process.lastModifiedTime} />
            {process.description && (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-xs text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{process.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
