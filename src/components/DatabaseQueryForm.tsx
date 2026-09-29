import { TimeFilterChips } from './TimeFilterChips';
import { AttributeChips } from './AttributeChips';
import type { TimeFilter, DatabaseBatchLimit } from '../types';

interface DatabaseQueryFormProps {
  databaseId: string;
  collectionId: string;
  batchLimit: DatabaseBatchLimit;
  loading: boolean;
  timeFilter: TimeFilter;
  fromDate: string;
  toDate: string;
  availableAttributes: string[];
  selectedAttributes: string[];
  fetchAllAttributes: boolean;
  onDatabaseIdChange: (val: string) => void;
  onCollectionIdChange: (val: string) => void;
  onBatchLimitChange: (val: DatabaseBatchLimit) => void;
  onTimeFilterChange: (val: TimeFilter) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onToggleAllAttributes: (checked: boolean) => void;
  onToggleAttribute: (key: string) => void;
  onSubmit: () => void;
}

export const DatabaseQueryForm = ({
  databaseId,
  collectionId,
  batchLimit,
  loading,
  timeFilter,
  fromDate,
  toDate,
  availableAttributes,
  selectedAttributes,
  fetchAllAttributes,
  onDatabaseIdChange,
  onCollectionIdChange,
  onBatchLimitChange,
  onTimeFilterChange,
  onFromDateChange,
  onToDateChange,
  onToggleAllAttributes,
  onToggleAttribute,
  onSubmit,
}: DatabaseQueryFormProps) => {
  return (
    <section className="control-panel">
      <header className="control-panel__header">
        <h1 className="control-panel__title">
          <span className="control-panel__title-dot" />
          Query Documents
        </h1>
      </header>

      <div className="control-panel__form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="db-id-input" className="form-label">Database ID</label>
            <input
              id="db-id-input"
              type="text"
              value={databaseId}
              onChange={(e) => onDatabaseIdChange(e.target.value)}
              placeholder="e.g. main-db"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="coll-id-input" className="form-label">Collection ID</label>
            <input
              id="coll-id-input"
              type="text"
              value={collectionId}
              onChange={(e) => onCollectionIdChange(e.target.value)}
              placeholder="e.g. users"
              className="form-input"
            />
          </div>

          <div className="form-field form-field--compact">
            <label htmlFor="batch-limit-select" className="form-label">Batch Size</label>
            <select
              id="batch-limit-select"
              value={batchLimit}
              onChange={(e) => onBatchLimitChange(Number(e.target.value) as DatabaseBatchLimit)}
              className="form-select"
            >
              <option value={100}>100 docs</option>
              <option value={500}>500 docs</option>
              <option value={1000}>1,000 docs</option>
              <option value={2500}>2,500 docs</option>
              <option value={5000}>5,000 docs</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !databaseId.trim() || !collectionId.trim()}
            className="btn-accent"
          >
            {loading ? 'Fetching...' : `Fetch (Up to ${batchLimit})`}
          </button>
        </div>

        <TimeFilterChips
          timeFilter={timeFilter}
          onTimeFilterChange={onTimeFilterChange}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
        />

        <AttributeChips
          availableAttributes={availableAttributes}
          selectedAttributes={selectedAttributes}
          fetchAllAttributes={fetchAllAttributes}
          onToggleAll={onToggleAllAttributes}
          onToggleAttribute={onToggleAttribute}
        />
      </div>
    </section>
  );
};
