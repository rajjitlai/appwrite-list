import { useState, useEffect } from 'react';
import FilesList from './components/FilesList';
import DatabaseList from './components/DatabaseList';
import Setup from './components/Setup';
import { getSavedConfig, APPWRITE_CONFIG_KEY } from './lib/appwrite';
import './App.css';

type View = 'setup' | 'menu' | 'storage' | 'database';

function App() {
  const [view, setView] = useState<View>('setup');

  useEffect(() => {
    const config = getSavedConfig();
    if (config) {
      setView('menu');
    }
  }, []);

  const handleSetupComplete = () => {
    setView('menu');
  };

  const handleResetConfig = () => {
    localStorage.removeItem(APPWRITE_CONFIG_KEY);
    setView('setup');
  };

  if (view === 'setup') {
    return <Setup onComplete={handleSetupComplete} />;
  }

  if (view === 'storage') {
    return <FilesList onBack={() => setView('menu')} />;
  }

  if (view === 'database') {
    return <DatabaseList onBack={() => setView('menu')} />;
  }

  return (
    <div className="container">
      <h1>Appwrite Browser</h1>
      <div className="menu-grid">
        <button 
          className="menu-card"
          onClick={() => setView('storage')}
        >
          <h2>Storage</h2>
          <p>Browse and manage files</p>
        </button>
        
        <button 
          className="menu-card"
          onClick={() => setView('database')}
        >
          <h2>Database</h2>
          <p>Browse documents</p>
        </button>
      </div>
      
      <button 
        onClick={handleResetConfig} 
        className="refresh-btn"
        style={{ marginTop: '2rem' }}
      >
        Change Configuration
      </button>
    </div>
  );
}

export default App;