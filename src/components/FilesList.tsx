import { useState, useEffect } from 'react';
import type { Models } from 'appwrite';
import { storage } from '../lib/appwrite';
import { Query } from 'appwrite';
import './FilesList.css';

const STORAGE_KEY = 'appwrite_bucket_id';

interface FilesListProps {
    onBack: () => void;
}

const FilesList = ({ onBack }: FilesListProps) => {
    const [bucketId, setBucketId] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || '';
    });
    const [files, setFiles] = useState<Models.File[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [lastFileId, setLastFileId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Save bucket ID to localStorage whenever it changes
    useEffect(() => {
        if (bucketId) {
            localStorage.setItem(STORAGE_KEY, bucketId);
        }
    }, [bucketId]);

    const fetchFiles = async (isLoadMore: boolean = false) => {
        if (!bucketId.trim()) {
            setError('Please enter a bucket ID');
            return;
        }

        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setFiles([]);
                setLastFileId(undefined);
                setHasMore(true);
            }
            setError(null);

            const limit = 100; // Fetch 100 files per request
            const queries: string[] = [
                Query.limit(limit),
                Query.orderDesc('$createdAt')
            ];

            if (fromDate) {
                queries.push(Query.greaterThanEqual('$createdAt', new Date(fromDate).toISOString()));
            }
            if (toDate) {
                // Add one day to include the end date fully
                const end = new Date(toDate);
                end.setDate(end.getDate() + 1);
                queries.push(Query.lessThan('$createdAt', end.toISOString()));
            }

            // Use queries array for cursor pagination
            if (isLoadMore && lastFileId) {
                queries.push(Query.cursorAfter(lastFileId));
            }

            const response = await storage.listFiles(
                bucketId,
                queries
            );

            if (isLoadMore) {
                setFiles(prev => [...prev, ...response.files]);
            } else {
                setFiles(response.files);
            }

            // Check if there are more files to load
            if (response.files.length < limit) {
                setHasMore(false);
            } else {
                setLastFileId(response.files[response.files.length - 1].$id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch files');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreFiles = () => {
        fetchFiles(true);
    };

    const downloadFile = async (fileId: string, fileName: string) => {
        try {
            setDownloading(fileId);

            // Get the file download URL
            const result = storage.getFileDownload(bucketId, fileId);

            // Create a temporary anchor element and trigger download
            const link = document.createElement('a');
            link.href = result.toString();
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
            alert(`Failed to download ${fileName}`);
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="container">
            <button onClick={onBack} className="refresh-btn" style={{ marginBottom: '1rem' }}>
                ← Back
            </button>
            <div className="bucket-input-section">
                <h1>Storage Files</h1>
                <div className="input-group">
                    <input
                        type="text"
                        value={bucketId}
                        onChange={(e) => setBucketId(e.target.value)}
                        placeholder="Enter Bucket ID"
                        className="bucket-input"
                        disabled={loading}
                    />
                </div>
                <div className="input-group" style={{ marginTop: '10px' }}>
                     <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="bucket-input"
                        placeholder="From Date"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bucket-input"
                        placeholder="To Date"
                    />
                    <button
                        onClick={() => fetchFiles(false)}
                        disabled={loading || !bucketId.trim()}
                        className="fetch-btn"
                    >
                        {loading ? 'Loading...' : 'Fetch Files'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error">
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading files...</p>
                </div>
            )}

            {!loading && files.length > 0 && (
                <>
                    <div className="stats-bar">
                        <span className="count">{files.length} files{hasMore ? '+' : ''}</span>
                        <button onClick={() => fetchFiles(false)} className="refresh-btn">
                            Refresh
                        </button>
                    </div>

                    <div className="files-grid">
                        {files.map((file) => (
                            <div key={file.$id} className="file-card">
                                <div className="file-info">
                                    <h3 className="file-name" title={file.name}>
                                        {file.name}
                                    </h3>
                                    <div className="file-meta">
                                        <span className="file-size">{formatFileSize(file.sizeOriginal)}</span>
                                        <span className="file-date">{formatDate(file.$createdAt)}</span>
                                    </div>
                                    <div className="file-type">
                                        {file.mimeType}
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadFile(file.$id, file.name)}
                                    disabled={downloading === file.$id}
                                    className="download-btn"
                                >
                                    {downloading === file.$id ? 'Downloading...' : 'Download'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="load-more-section">
                            <button
                                onClick={loadMoreFiles}
                                disabled={loadingMore}
                                className="load-more-btn"
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {!loading && files.length === 0 && bucketId && (
                <div className="empty">
                    <p>No files found in this bucket</p>
                </div>
            )}
        </div>
    );
};

export default FilesList;
