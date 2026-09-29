interface BatchPaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  entityName?: string;
  onPageChange: (page: number) => void;
  onDownloadBatch: (pageNumber: number) => void;
  onDownloadAll?: () => void;
}

export const BatchPagination = ({
  totalItems,
  pageSize,
  currentPage,
  entityName = 'records',
  onPageChange,
  onDownloadBatch,
  onDownloadAll,
}: BatchPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  // Generate page numbers to display
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="batch-pagination" aria-label="Records pagination and batch download">
      <div className="batch-pagination__toolbar">
        <div className="batch-pagination__info">
          <span className="app-navbar__badge">
            Batch {currentPage} of {totalPages}
          </span>
          <span className="batch-pagination__range">
            Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of <strong>{totalItems}</strong> {entityName}
          </span>
        </div>

        <div className="batch-pagination__actions">
          <button
            type="button"
            onClick={() => onDownloadBatch(currentPage)}
            className="btn-accent"
            title={`Download records ${startIndex}–${endIndex} as JSON`}
          >
            ↓ Download Batch {currentPage} JSON ({endIndex - startIndex + 1})
          </button>

          {onDownloadAll && totalPages > 1 && (
            <button
              type="button"
              onClick={onDownloadAll}
              className="btn-secondary"
              title={`Download all ${totalItems} loaded ${entityName} as JSON`}
            >
              Export All ({totalItems}) JSON
            </button>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="batch-pagination__nav">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary"
            aria-label="Previous batch page"
          >
            ← Prev
          </button>

          <div className="batch-pagination__pills">
            {pages.map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`batch-pagination__pill ${isActive ? 'batch-pagination__pill--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary"
            aria-label="Next batch page"
          >
            Next →
          </button>
        </div>
      )}
    </nav>
  );
};
