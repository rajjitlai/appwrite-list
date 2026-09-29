import type { TimeFilter } from '../types';

export interface DateFilterRange {
  start: Date | null;
  end: Date | null;
}

export const calculateFilterDateRange = (
  timeFilter: TimeFilter,
  fromDate: string,
  toDate: string
): DateFilterRange => {
  if (timeFilter === 'all') return { start: null, end: null };

  if (timeFilter === 'custom') {
    const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    return { start, end };
  }

  const daysMap: Record<string, number> = { '2d': 2, '7d': 7, '15d': 15, '30d': 30 };
  const days = daysMap[timeFilter] ?? 0;
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return { start, end: null };
};
