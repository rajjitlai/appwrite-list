import { useState } from 'react';
import type { Models } from 'appwrite';
import { formatDate } from '../lib/appwrite';

interface DocumentCardProps {
  document: Models.Document;
  selectedAttributes: string[];
  fetchAllAttributes: boolean;
}

export const DocumentCard = ({
  document: doc,
  selectedAttributes,
  fetchAllAttributes,
}: DocumentCardProps) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(doc.$id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback or ignore clipboard denial
    }
  };

  // Filter display attributes
  const displayEntries = Object.entries(doc).filter(([key]) => {
    if (key.startsWith('$')) return false;
    return fetchAllAttributes || selectedAttributes.includes(key);
  });

  return (
    <article className="doc-card animate-fade-in">
      <header className="doc-card__header">
        <span className="doc-card__id" title={doc.$id}>
          {doc.$id}
        </span>
        <button
          type="button"
          onClick={handleCopyId}
          className="btn-ghost-sm"
          title="Copy Document ID"
        >
          {copied ? '✓ Copied' : 'Copy ID'}
        </button>
      </header>

      <div className="doc-card__meta">
        Created: {formatDate(doc.$createdAt)}
      </div>

      <div className="doc-card__content">
        {showRaw ? (
          <pre className="doc-card__raw">
            {JSON.stringify(doc, null, 2)}
          </pre>
        ) : (
          <div className="doc-card__attrs">
            {displayEntries.length === 0 ? (
              <span className="state-box__text">No attributes matched filter</span>
            ) : (
              displayEntries.map(([key, value]) => (
                <div key={key} className="doc-attr">
                  <span className="doc-attr__key">{key}</span>
                  <span className="doc-attr__val">
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? 'null')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <footer className="doc-card__footer">
        <span className="app-navbar__badge">
          {displayEntries.length} field{displayEntries.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="btn-ghost-sm"
        >
          {showRaw ? 'Clean View' : 'Raw JSON'}
        </button>
      </footer>
    </article>
  );
};
