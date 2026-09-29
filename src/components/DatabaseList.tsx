import { useState, useEffect } from 'react';
import { databases, getSavedConfig } from '../lib/appwrite';
import { calculateFilterDateRange } from '../lib/dateUtils';
import { downloadJsonFile, downloadBatchJson, extractDocumentAttributes } from '../lib/downloadUtils';
import { Query, type Models } from 'appwrite';
import { Navbar } from './Navbar';
import { DocumentCard } from './DocumentCard';
import { DatabaseQueryForm } from './DatabaseQueryForm';
import { BatchPagination } from './BatchPagination';
import type { TimeFilter, DatabaseBatchLimit, NavigationProps } from '../types';
import './FilesList.css';

const DB_KEY = 'appwrite_db_id';
const COLL_KEY = 'appwrite_coll_id';

export const DatabaseList = ({ onBack, onResetConfig }: NavigationProps) => {
  const [databaseId, setDatabaseId] = useState(() => localStorage.getItem(DB_KEY) || '');
  const [collectionId, setCollectionId] = useState(() => localStorage.getItem(COLL_KEY) || '');
  const [batchLimit, setBatchLimit] = useState<DatabaseBatchLimit>(500);
  const [documents, setDocuments] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  // Time & Attribute filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [fetchAllAttributes, setFetchAllAttributes] = useState(false);

  const activeConfig = getSavedConfig();

  useEffect(() => {
    if (databaseId) localStorage.setItem(DB_KEY, databaseId);
    if (collectionId) localStorage.setItem(COLL_KEY, collectionId);
  }, [databaseId, collectionId]);

  const toggleAttribute = (key: string) => {
    setSelectedAttributes((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };

  const handleDownloadBatch = (pageNumber: number) => {
    downloadBatchJson(documents, pageNumber, PAGE_SIZE, collectionId || 'documents');
  };

  const handleDownloadAll = () => {
    downloadJsonFile(documents, `${collectionId || 'documents'}_all_${documents.length}_records`);
  };

  const fetchDocuments = async (isLoadMore: boolean = false) => {
    if (!databaseId.trim() || !collectionId.trim()) {
      setError('Please provide both Database ID and Collection ID');
      return;
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setDocuments([]);
        setLastId(undefined);
        setAvailableAttributes([]);
        setSelectedAttributes([]);
        setCurrentPage(1);
      }
      setError(null);

      const queries = [Query.limit(batchLimit), Query.orderDesc('$createdAt')];
      if (isLoadMore && lastId) queries.push(Query.cursorAfter(lastId));

      const { start, end } = calculateFilterDateRange(timeFilter, fromDate, toDate);
      if (start) queries.push(Query.greaterThanEqual('$createdAt', start.toISOString()));
      if (end) queries.push(Query.lessThanEqual('$createdAt', end.toISOString()));

      const response = await databases.listDocuments(databaseId.trim(), collectionId.trim(), queries);
      const uniqueKeys = extractDocumentAttributes(response.documents);

      if (!isLoadMore) {
        setAvailableAttributes(uniqueKeys);
        setSelectedAttributes(uniqueKeys);
        setDocuments(response.documents);
      } else {
        setAvailableAttributes((prev) => Array.from(new Set([...prev, ...uniqueKeys])));
        setDocuments((prev) => [...prev, ...response.documents]);
      }

      setHasMore(response.documents.length === batchLimit);
      if (response.documents.length > 0) {
        setLastId(response.documents[response.documents.length - 1].$id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="explorer">
      <Navbar
        title="Database Explorer"
        onBack={onBack}
        onResetConfig={onResetConfig}
        projectId={activeConfig?.projectId}
      />

      <DatabaseQueryForm
        databaseId={databaseId}
        collectionId={collectionId}
        batchLimit={batchLimit}
        loading={loading}
        timeFilter={timeFilter}
        fromDate={fromDate}
        toDate={toDate}
        availableAttributes={availableAttributes}
        selectedAttributes={selectedAttributes}
        fetchAllAttributes={fetchAllAttributes}
        onDatabaseIdChange={setDatabaseId}
        onCollectionIdChange={setCollectionId}
        onBatchLimitChange={setBatchLimit}
        onTimeFilterChange={setTimeFilter}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onToggleAllAttributes={setFetchAllAttributes}
        onToggleAttribute={toggleAttribute}
        onSubmit={() => fetchDocuments(false)}
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
          <p className="state-box__text">Fetching up to {batchLimit} documents...</p>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <>
          <BatchPagination
            totalItems={documents.length}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            entityName="documents"
            onPageChange={setCurrentPage}
            onDownloadBatch={handleDownloadBatch}
            onDownloadAll={handleDownloadAll}
          />

          <div className="data-grid">
            {documents
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((doc) => (
                <DocumentCard
                  key={doc.$id}
                  document={doc}
                  selectedAttributes={selectedAttributes}
                  fetchAllAttributes={fetchAllAttributes}
                />
              ))}
          </div>

          {hasMore && (
            <div className="pagination-section">
              <button
                type="button"
                onClick={() => fetchDocuments(true)}
                disabled={loadingMore}
                className="btn-load-more"
              >
                {loadingMore ? 'Loading Batch...' : `Load Next ${batchLimit} Documents`}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && documents.length === 0 && databaseId && collectionId && !error && (
        <div className="state-box">
          <p className="state-box__text">No documents matched your query criteria.</p>
        </div>
      )}
    </div>
  );
};