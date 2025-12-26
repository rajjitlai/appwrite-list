import { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import type { Models } from 'appwrite';
import './FilesList.css'; 

const DB_STORAGE_KEY = 'appwrite_db_id';
const COLL_STORAGE_KEY = 'appwrite_coll_id';

interface DatabaseListProps {
    onBack: () => void;
}

type TimeFilter = 'all' | '2d' | '7d' | '15d' | '30d' | 'custom';

const DatabaseList = ({ onBack }: DatabaseListProps) => {
    const [databaseId, setDatabaseId] = useState(() => localStorage.getItem(DB_STORAGE_KEY) || '');
    const [collectionId, setCollectionId] = useState(() => localStorage.getItem(COLL_STORAGE_KEY) || '');
    const [documents, setDocuments] = useState<Models.Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination
    const [lastId, setLastId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(false);
    
    // Filters
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Attributes
    const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [fetchAllAttributes, setFetchAllAttributes] = useState(false);

    useEffect(() => {
        if (databaseId) localStorage.setItem(DB_STORAGE_KEY, databaseId);
        if (collectionId) localStorage.setItem(COLL_STORAGE_KEY, collectionId);
    }, [databaseId, collectionId]);

    const toggleAttribute = (key: string) => {
        setSelectedAttributes(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const getQueryDates = () => {
        if (timeFilter === 'all') return { start: null, end: null };
        if (timeFilter === 'custom') {
            return {
                start: fromDate ? new Date(fromDate) : null,
                end: toDate ? new Date(toDate) : null
            };
        }

        const now = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        switch (timeFilter) {
            case '2d': start.setDate(now.getDate() - 2); break;
            case '7d': start.setDate(now.getDate() - 7); break;
            case '15d': start.setDate(now.getDate() - 15); break;
            case '30d': start.setDate(now.getDate() - 30); break;
        }
        
        return { start, end: null }; // End is effectively "now"
    };


    const fetchDocuments = async (isLoadMore: boolean = false) => {
        if (!databaseId || !collectionId) {
            setError('Please enter both Database ID and Collection ID');
            return;
        }

        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setDocuments([]);
                setLastId(undefined);
            }
            setError(null);
            
            const limit = 100;
            const queries = [
                Query.limit(limit),
                Query.orderDesc('$createdAt')
            ];
            
            // Cursor Pagination
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            // Date Filtering
            const { start, end } = getQueryDates();

            if (start) {
                queries.push(Query.greaterThanEqual('$createdAt', start.toISOString()));
            }
            if (end) {
                const searchEnd = new Date(end);
                searchEnd.setDate(searchEnd.getDate() + 1);
                queries.push(Query.lessThan('$createdAt', searchEnd.toISOString()));
            }

            const response = await databases.listDocuments(
                databaseId,
                collectionId,
                queries
            );

            // Infer keys from the first fetched document if available
            if (response.documents.length > 0 && !isLoadMore) {
                const doc = response.documents[0];
                const keys = Object.keys(doc).filter(key => !key.startsWith('$'));
                setAvailableAttributes(keys);
                
                // If no attributes selected yet, select all by default
                if (selectedAttributes.length === 0) {
                    setSelectedAttributes(keys);
                }
            }

            if (isLoadMore) {
                setDocuments(prev => [...prev, ...response.documents]);
            } else {
                setDocuments(response.documents);
            }

            // Update Pagination State
            if (response.documents.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch documents');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleInitialFetch = () => {
        fetchDocuments(false);
    };

    const handleLoadMore = () => {
        fetchDocuments(true);
    };

    return (
        <div className="container">
            <button onClick={onBack} className="refresh-btn" style={{ marginBottom: '1rem' }}>
                ← Back
            </button>
            <div className="bucket-input-section">
                <h1>Database Documents</h1>
                
                <div className="input-group" style={{ flexDirection: 'column', gap: '1.5rem' }}>
                    {/* IDs */}
                    <div className="input-group">
                        <input
                            type="text"
                            value={databaseId}
                            onChange={(e) => setDatabaseId(e.target.value)}
                            placeholder="Database ID"
                            className="bucket-input"
                        />
                        <input
                            type="text"
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            placeholder="Collection ID"
                            className="bucket-input"
                        />
                    </div>

                    {/* Attribute Selection Area */}
                    <div className="attributes-section">
                        {availableAttributes.length > 0 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label className="checkbox-label" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={fetchAllAttributes} 
                                            onChange={(e) => setFetchAllAttributes(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
                                        />
                                        Show All Attributes
                                    </label>
                                </div>

                                {!fetchAllAttributes && (
                                    <div className="filter-chips animate-fade-in" style={{ marginBottom: '1rem' }}>
                                        {availableAttributes.map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => toggleAttribute(key)}
                                                className={`filter-chip ${selectedAttributes.includes(key) ? 'active' : ''}`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        
                         {availableAttributes.length === 0 && documents.length === 0 && (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                Attributes will appear here after fetching documents.
                            </p>
                        )}
                    </div>

                    {/* Time Filters */}
                    <div className="filter-section">
                        <div className="filter-chips">
                            {(['all', '2d', '7d', '15d', '30d', 'custom'] as TimeFilter[]).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTimeFilter(filter)}
                                    className={`filter-chip ${timeFilter === filter ? 'active' : ''}`}
                                >
                                    {filter === 'all' ? 'All Time' : filter === 'custom' ? 'Custom' : `Last ${filter}`}
                                </button>
                            ))}
                        </div>

                        {timeFilter === 'custom' && (
                            <div className="custom-date-inputs animate-fade-in" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="bucket-input"
                                />
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="bucket-input"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleInitialFetch}
                        disabled={loading || !databaseId || !collectionId}
                        className="fetch-btn"
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Loading...' : 'Fetch Documents'}
                    </button>
                </div>
            </div>

            {error && <div className="error"><p>{error}</p></div>}

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading documents...</p>
                </div>
            )}

            {!loading && documents.length > 0 && (
                <>
                    <div className="stats-bar">
                        <span className="count">
                            Showing {documents.length} documents
                            {hasMore ? ' (more available)' : ''}
                        </span>
                        <button onClick={handleInitialFetch} className="refresh-btn">
                            Refresh
                        </button>
                    </div>

                    <div className="files-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {documents.map((doc) => {
                            // Filter document to only show selected attributes if not fetching all
                            const displayData = fetchAllAttributes 
                                ? doc 
                                : Object.fromEntries(
                                    Object.entries(doc).filter(([key]) => 
                                        selectedAttributes.includes(key) || key === '$id'
                                    )
                                  );

                            return (
                                <div key={doc.$id} className="file-card">
                                    <div className="file-info">
                                        <h3 className="file-name">{doc.$id}</h3>
                                        <pre className="file-meta">
                                            {JSON.stringify(displayData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="load-more-section">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="load-more-btn"
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
            
            {!loading && documents.length === 0 && (databaseId || collectionId) && !error && (
                 <div className="empty">
                    <p>No documents found</p>
                </div>
            )}
        </div>
    );
};

export default DatabaseList;