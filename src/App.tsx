import { useState, useEffect } from 'react';
import { FilesList } from './components/FilesList';
import { DatabaseList } from './components/DatabaseList';
import { Setup } from './components/Setup';
import { getSavedConfig } from './lib/appwrite';
import type { ViewMode } from './types';
import './App.css';

export const App = () => {
  const [view, setView] = useState<ViewMode>('setup');

  useEffect(() => {
    const config = getSavedConfig();
    if (config?.endpoint && config?.projectId) {
      setView('menu');
    }
  }, []);

  const handleSetupComplete = () => {
    setView('menu');
  };

  const handleOpenSettings = () => {
    setView('setup');
  };

  const activeConfig = getSavedConfig();

  if (view === 'setup') {
    return (
      <Setup
        onComplete={handleSetupComplete}
        onCancel={activeConfig?.endpoint && activeConfig?.projectId ? () => setView('menu') : undefined}
      />
    );
  }

  if (view === 'storage') {
    return (
      <FilesList
        onBack={() => setView('menu')}
        onResetConfig={handleOpenSettings}
      />
    );
  }

  if (view === 'database') {
    return (
      <DatabaseList
        onBack={() => setView('menu')}
        onResetConfig={handleOpenSettings}
      />
    );
  }

  return (
    <main className="app-main">
      <header className="app-header">
        <div className="app-badge">
          <span className="app-badge__dot" />
          Appwrite Explorer
        </div>
        <h1 className="app-title">
          Unified <span className="app-title--highlight">Appwrite</span> Console
        </h1>
        <p className="app-subtitle">
          High-throughput data & file browser with real-time inspection
        </p>
      </header>

      <section className="menu-grid">
        <button
          type="button"
          className="menu-card"
          onClick={() => setView('storage')}
        >
          <div className="menu-card__icon">📁</div>
          <h2 className="menu-card__title">Storage Bucket</h2>
          <p className="menu-card__desc">
            Explore buckets, download assets, and batch-stream hundreds of files with cursor pagination.
          </p>
        </button>

        <button
          type="button"
          className="menu-card"
          onClick={() => setView('database')}
        >
          <div className="menu-card__icon">⚡</div>
          <h2 className="menu-card__title">Database Collections</h2>
          <p className="menu-card__desc">
            Query collections, filter time horizons, select custom attributes, and load up to 5,000 documents.
          </p>
        </button>
      </section>

      <div className="app-actions">
        <button
          type="button"
          onClick={handleOpenSettings}
          className="btn-secondary"
        >
          Change Connection Settings
        </button>
      </div>
    </main>
  );
};

export default App;