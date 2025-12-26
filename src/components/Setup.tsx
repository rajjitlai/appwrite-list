import { useState } from 'react';
import { updateAppwriteConfig } from '../lib/appwrite';

interface SetupProps {
    onComplete: () => void;
}

const Setup = ({ onComplete }: SetupProps) => {
    const [endpoint, setEndpoint] = useState('https://cloud.appwrite.io/v1');
    const [projectId, setProjectId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (endpoint && projectId) {
            updateAppwriteConfig(endpoint, projectId);
            onComplete();
        }
    };

    return (
        <div className="container">
            <h1>Appwrite Setup</h1>
            <form onSubmit={handleSubmit} className="setup-form">
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Endpoint</label>
                    <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://cloud.appwrite.io/v1"
                        className="bucket-input"
                        required
                    />
                </div>
                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project ID</label>
                    <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="Enter Project ID"
                        className="bucket-input"
                        required
                    />
                </div>
                <button type="submit" className="fetch-btn" style={{ marginTop: '1rem' }}>
                    Save & Continue
                </button>
            </form>
        </div>
    );
};

export default Setup;
