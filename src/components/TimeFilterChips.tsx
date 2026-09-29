import type { TimeFilter } from '../types';

interface TimeFilterChipsProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

const FILTER_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: '2d', label: 'Last 2d' },
  { id: '7d', label: 'Last 7d' },
  { id: '15d', label: 'Last 15d' },
  { id: '30d', label: 'Last 30d' },
  { id: 'custom', label: 'Custom' },
];

export const TimeFilterChips = ({
  timeFilter,
  onTimeFilterChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: TimeFilterChipsProps) => {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Timeframe</span>
      <div className="filter-chips">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onTimeFilterChange(opt.id)}
            className={`filter-chip ${timeFilter === opt.id ? 'filter-chip--active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {timeFilter === 'custom' && (
        <div className="form-row animate-fade-in">
          <div className="form-field">
            <label htmlFor="time-filter-from" className="form-label">From Date</label>
            <input
              id="time-filter-from"
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="time-filter-to" className="form-label">To Date</label>
            <input
              id="time-filter-to"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      )}
    </div>
  );
};
