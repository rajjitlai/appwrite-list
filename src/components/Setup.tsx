import { useState } from 'react';
import { updateAppwriteConfig, getSavedConfig, resetAppwriteConfig } from '../lib/appwrite';

interface SetupProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const Setup = ({ onComplete, onCancel }: SetupProps) => {
  const existingConfig = getSavedConfig();
  const [endpoint, setEndpoint] = useState(existingConfig?.endpoint || 'https://cloud.appwrite.io/v1');
  const [projectId, setProjectId] = useState(existingConfig?.projectId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEndpoint = endpoint.trim();
    const cleanProjectId = projectId.trim();

    if (cleanEndpoint && cleanProjectId) {
      updateAppwriteConfig(cleanEndpoint, cleanProjectId);
      onComplete();
    }
  };

  const handleClear = () => {
    resetAppwriteConfig();
    setEndpoint('https://cloud.appwrite.io/v1');
    setProjectId('');
  };

  return (
    <main className="app-main">
      <section className="control-panel control-panel--narrow">
        <header className="control-panel__header">
          <h1 className="control-panel__title">
            <span className="control-panel__title-dot" />
            Appwrite Settings
          </h1>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </header>

        <form onSubmit={handleSubmit} className="control-panel__form">
          <div className="form-field">
            <label htmlFor="setup-endpoint" className="form-label">
              API Endpoint
            </label>
            <input
              id="setup-endpoint"
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://cloud.appwrite.io/v1"
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="setup-project-id" className="form-label">
              Project ID
            </label>
            <input
              id="setup-project-id"
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter Appwrite Project ID"
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <button type="submit" className="btn-accent">
              Save & Connect
            </button>
            {existingConfig && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
              >
                Clear Credentials
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
