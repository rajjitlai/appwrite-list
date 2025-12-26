import { Client, Storage, Databases } from 'appwrite';

export const APPWRITE_CONFIG_KEY = 'appwrite_config';

interface AppwriteConfig {
    endpoint: string;
    projectId: string;
}

export const getSavedConfig = (): AppwriteConfig | null => {
    const saved = localStorage.getItem(APPWRITE_CONFIG_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    }
    return null;
};

export const client = new Client();
export const storage = new Storage(client);
export const databases = new Databases(client);

// Initialize if config exists
const savedConfig = getSavedConfig();
if (savedConfig) {
    client
        .setEndpoint(savedConfig.endpoint)
        .setProject(savedConfig.projectId);
}

export const updateAppwriteConfig = (endpoint: string, projectId: string) => {
    client
        .setEndpoint(endpoint)
        .setProject(projectId);
    
    localStorage.setItem(APPWRITE_CONFIG_KEY, JSON.stringify({ endpoint, projectId }));
};
