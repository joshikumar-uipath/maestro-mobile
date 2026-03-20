export const TIME_PERIODS = [
  { key: 'all',      label: 'All'           },
  { key: 'lastHour', label: 'Last hour'     },
  { key: 'today',    label: 'Today'         },
  { key: 'last24h',  label: 'Last 24 hours' },
  { key: 'last7d',   label: 'Last 7 days'   },
  { key: 'last2w',   label: 'Last 2 weeks'  },
  { key: 'last30d',  label: 'Last 30 days'  },
  { key: 'last6m',   label: 'Last 6 months' },
] as const;

export type TimePeriod = typeof TIME_PERIODS[number]['key'];

export function getStartDate(period: TimePeriod): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  switch (period) {
    case 'lastHour': return new Date(now.getTime() - 60 * 60 * 1000);
    case 'today':    { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case 'last24h':  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'last7d':   return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'last2w':   return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case 'last30d':  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'last6m':   return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  }
}
