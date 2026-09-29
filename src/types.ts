export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
}

export type ViewMode = 'setup' | 'menu' | 'storage' | 'database';

export type TimeFilter = 'all' | '2d' | '7d' | '15d' | '30d' | 'custom';

export type DatabaseBatchLimit = 100 | 500 | 1000 | 2500 | 5000;

export type StorageBatchTarget = 100 | 300 | 500 | 1000 | 2000;

export interface NavigationProps {
  onBack: () => void;
  onResetConfig: () => void;
}
