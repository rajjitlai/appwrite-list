import type { Models } from 'appwrite';
import { formatFileSize, formatDate } from '../lib/appwrite';

interface FileCardProps {
  file: Models.File;
  isDownloading: boolean;
  onDownload: (fileId: string, fileName: string) => void;
}

export const FileCard = ({ file, isDownloading, onDownload }: FileCardProps) => {
  return (
    <article className="file-card animate-fade-in">
      <h3 className="file-card__name" title={file.name}>
        {file.name}
      </h3>

      <div className="file-card__meta">
        <span>{formatFileSize(file.sizeOriginal)}</span>
        <span>•</span>
        <span>{formatDate(file.$createdAt)}</span>
      </div>

      <span className="file-card__type" title={file.mimeType}>
        {file.mimeType || 'unknown/binary'}
      </span>

      <div className="file-card__action">
        <button
          type="button"
          onClick={() => onDownload(file.$id, file.name)}
          disabled={isDownloading}
          className="btn-download"
        >
          {isDownloading ? 'Downloading...' : '↓ Download'}
        </button>
      </div>
    </article>
  );
};
