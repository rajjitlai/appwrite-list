import { useState, useEffect } from 'react';
import type { Models } from 'appwrite';
import { storage, getSavedConfig } from '../lib/appwrite';
import { calculateFilterDateRange } from '../lib/dateUtils';
import { downloadJsonFile, downloadBatchJson, triggerBrowserDownload } from '../lib/downloadUtils';
import { Query } from 'appwrite';
import { Navbar } from './Navbar';
import { FileCard } from './FileCard';
import { StorageQueryForm } from './StorageQueryForm';
import { BatchPagination } from './BatchPagination';
import type { StorageBatchTarget, NavigationProps } from '../types';
import './FilesList.css';

const STORAGE_KEY = 'appwrite_bucket_id';

export const FilesList = ({ onBack, onResetConfig }: NavigationProps) => {
  const [bucketId, setBucketId] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [targetCount, setTargetCount] = useState<StorageBatchTarget>(500);
  const [files, setFiles] = useState<Models.File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [lastFileId, setLastFileId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const activeConfig = getSavedConfig();

  useEffect(() => {
    if (bucketId) localStorage.setItem(STORAGE_KEY, bucketId);
  }, [bucketId]);

  const buildBaseQueries = () => {
    const queries = [Query.limit(100), Query.orderDesc('$createdAt')];
    const { start, end } = calculateFilterDateRange('custom', fromDate, toDate);
    if (start) queries.push(Query.greaterThanEqual('$createdAt', start.toISOString()));
    if (end) queries.push(Query.lessThanEqual('$createdAt', end.toISOString()));
    return queries;
  };

  const handleDownloadBatch = (pageNumber: number) => {
    downloadBatchJson(files, pageNumber, PAGE_SIZE, bucketId || 'files');
  };

  const handleDownloadAll = () => {
    downloadJsonFile(files, `${bucketId || 'files'}_all_${files.length}_files`);
  };

  const fetchFiles = async (isLoadMore: boolean = false) => {
    if (!bucketId.trim()) {
      setError('Please provide a valid Bucket ID');
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
        setCurrentPage(1);
      }
      setError(null);

      let currentCursor = isLoadMore ? lastFileId : undefined;
      const accumulated: Models.File[] = [];
      let reachedEnd = false;
      const CHUNK_SIZE = 100;
      const maxIterations = Math.ceil(targetCount / CHUNK_SIZE);

      // Loop in batches to fetch multi-fold more files up to the requested target
      for (let i = 0; i < maxIterations; i++) {
        const queries = buildBaseQueries();
        if (currentCursor) queries.push(Query.cursorAfter(currentCursor));

        const response = await storage.listFiles(bucketId.trim(), queries);
        accumulated.push(...response.files);

        if (response.files.length < CHUNK_SIZE) {
          reachedEnd = true;
          break;
        }
        currentCursor = response.files[response.files.length - 1].$id;
      }

      setHasMore(!reachedEnd);
      setLastFileId(currentCursor);
      setFiles((prev) => (isLoadMore ? [...prev, ...accumulated] : accumulated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage files');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const downloadFile = (fileId: string, fileName: string) => {
    try {
      setDownloading(fileId);
      const result = storage.getFileDownload(bucketId.trim(), fileId);
      triggerBrowserDownload(result.toString(), fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to download ${fileName}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="explorer">
      <Navbar
        title="Storage Explorer"
        onBack={onBack}
        onResetConfig={onResetConfig}
        projectId={activeConfig?.projectId}
      />

      <StorageQueryForm
        bucketId={bucketId}
        targetCount={targetCount}
        fromDate={fromDate}
        toDate={toDate}
        loading={loading}
        onBucketIdChange={setBucketId}
        onTargetCountChange={setTargetCount}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSubmit={() => fetchFiles(false)}
      />

      {error && (
        <div className="error-banner animate-fade-in" role="alert">
          <p className="error-banner__msg">{error}</p>
          <button type="button" onClick={() => setError(null)} className="btn-ghost-sm">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="state-box">
          <div className="state-box__spinner" />
          <p className="state-box__text">Fetching up to {targetCount} files from bucket...</p>
        </div>
      )}

      {!loading && files.length > 0 && (
        <>
          <BatchPagination
            totalItems={files.length}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            entityName="files"
            onPageChange={setCurrentPage}
            onDownloadBatch={handleDownloadBatch}
            onDownloadAll={handleDownloadAll}
          />

          <div className="data-grid">
            {files
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((file) => (
                <FileCard
                  key={file.$id}
                  file={file}
                  isDownloading={downloading === file.$id}
                  onDownload={downloadFile}
                />
              ))}
          </div>

          {hasMore && (
            <div className="pagination-section">
              <button
                type="button"
                onClick={() => fetchFiles(true)}
                disabled={loadingMore}
                className="btn-load-more"
              >
                {loadingMore ? 'Loading More Files...' : `Load Next ${targetCount} Files`}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && files.length === 0 && bucketId && !error && (
        <div className="state-box">
          <p className="state-box__text">No files found in this bucket.</p>
        </div>
      )}
    </div>
  );
};
