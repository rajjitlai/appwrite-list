import type { StorageBatchTarget } from '../types';

interface StorageQueryFormProps {
  bucketId: string;
  targetCount: StorageBatchTarget;
  fromDate: string;
  toDate: string;
  loading: boolean;
  onBucketIdChange: (val: string) => void;
  onTargetCountChange: (val: StorageBatchTarget) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onSubmit: () => void;
}

export const StorageQueryForm = ({
  bucketId,
  targetCount,
  fromDate,
  toDate,
  loading,
  onBucketIdChange,
  onTargetCountChange,
  onFromDateChange,
  onToDateChange,
  onSubmit,
}: StorageQueryFormProps) => {
  return (
    <section className="control-panel">
      <header className="control-panel__header">
        <h1 className="control-panel__title">
          <span className="control-panel__title-dot" />
          Storage Bucket Files
        </h1>
      </header>

      <div className="control-panel__form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="bucket-id-input" className="form-label">Bucket ID</label>
            <input
              id="bucket-id-input"
              type="text"
              value={bucketId}
              onChange={(e) => onBucketIdChange(e.target.value)}
              placeholder="e.g. user-uploads"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-field form-field--compact">
            <label htmlFor="fetch-target-select" className="form-label">Fetch Volume</label>
            <select
              id="fetch-target-select"
              value={targetCount}
              onChange={(e) => onTargetCountChange(Number(e.target.value) as StorageBatchTarget)}
              className="form-select"
              disabled={loading}
            >
              <option value={100}>100 files</option>
              <option value={300}>300 files</option>
              <option value={500}>500 files</option>
              <option value={1000}>1,000 files</option>
              <option value={2000}>2,000 files</option>
            </select>
          </div>

          <div className="form-field form-field--compact">
            <label htmlFor="from-date-input" className="form-label">From</label>
            <input
              id="from-date-input"
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field form-field--compact">
            <label htmlFor="to-date-input" className="form-label">To</label>
            <input
              id="to-date-input"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !bucketId.trim()}
            className="btn-accent"
          >
            {loading ? 'Fetching...' : `Fetch (Up to ${targetCount})`}
          </button>
        </div>
      </div>
    </section>
  );
};
