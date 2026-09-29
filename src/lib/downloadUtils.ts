import type { Models } from 'appwrite';

export const triggerBrowserDownload = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadJsonFile = (data: unknown, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const name = filename.endsWith('.json') ? filename : `${filename}.json`;
  triggerBrowserDownload(url, name);
  URL.revokeObjectURL(url);
};

export const downloadBatchJson = (
  items: unknown[],
  batchNumber: number,
  pageSize: number,
  prefix: string
): void => {
  const start = (batchNumber - 1) * pageSize;
  const batch = items.slice(start, start + pageSize);
  const name = `${prefix}_batch_${batchNumber}_(${start + 1}-${start + batch.length})`;
  downloadJsonFile(batch, name);
};

export const extractDocumentAttributes = (documents: Models.Document[]): string[] => {
  const keysSet = new Set<string>();
  documents.forEach((doc) => {
    Object.keys(doc).forEach((k) => {
      if (!k.startsWith('$')) keysSet.add(k);
    });
  });
  return Array.from(keysSet);
};
