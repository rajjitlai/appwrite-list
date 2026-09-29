import { Client, Storage, Databases } from 'appwrite';
import type { AppwriteConfig } from '../types';

export const APPWRITE_CONFIG_KEY = 'appwrite_config';

export const getSavedConfig = (): AppwriteConfig | null => {
  const saved = localStorage.getItem(APPWRITE_CONFIG_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as AppwriteConfig;
  } catch {
    return null;
  }
};

export const client = new Client();
export const storage = new Storage(client);
export const databases = new Databases(client);

// Initialize with stored credentials if available
const initialConfig = getSavedConfig();
if (initialConfig?.endpoint && initialConfig?.projectId) {
  client.setEndpoint(initialConfig.endpoint).setProject(initialConfig.projectId);
}

export const updateAppwriteConfig = (endpoint: string, projectId: string): void => {
  client.setEndpoint(endpoint).setProject(projectId);
  localStorage.setItem(APPWRITE_CONFIG_KEY, JSON.stringify({ endpoint, projectId }));
};

export const resetAppwriteConfig = (): void => {
  localStorage.removeItem(APPWRITE_CONFIG_KEY);
  try {
    client.setEndpoint('https://cloud.appwrite.io/v1').setProject('');
  } catch {
    // Fallback in case of client error
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = Math.round((bytes / Math.pow(k, i)) * 100) / 100;
  return `${formatted} ${sizes[i]}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
