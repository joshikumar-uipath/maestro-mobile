interface StatusBadgeProps {
  status: string;
}

type StatusConfig = {
  dot: string;
  bg: string;
  text: string;
  pulse?: boolean;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  Running:   { dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700',  pulse: true },
  Successful:{ dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700' },
  Completed: { dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700' },
  Faulted:   { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700' },
  Failed:    { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700' },
  Stopped:   { dot: 'bg-gray-400',    bg: 'bg-gray-100',   text: 'text-gray-600' },
  Cancelled: { dot: 'bg-gray-400',    bg: 'bg-gray-100',   text: 'text-gray-600' },
  Pending:   { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  Paused:    { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  Suspended: { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  Open:      { dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700' },
  Closed:    { dot: 'bg-gray-400',    bg: 'bg-gray-100',   text: 'text-gray-600' },
};

const DEFAULT_CONFIG: StatusConfig = {
  dot: 'bg-gray-400',
  bg: 'bg-gray-100',
  text: 'text-gray-500',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? DEFAULT_CONFIG;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
