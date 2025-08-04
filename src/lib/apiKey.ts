import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const storage = Capacitor.isNativePlatform() ? SecureStoragePlugin : null;
const LEGACY_KEY = 'gemini_api_key'; // For web/PWA fallback

export const setApiKey = async (key: string): Promise<void> => {
  if (storage) {
    await storage.set({ key: 'gemini_api_key', value: key });
  } else {
    // Fallback for web
    localStorage.setItem(LEGACY_KEY, key);
  }
};

export const getApiKey = async (): Promise<string | null> => {
  if (storage) {
    const { value } = await storage.get({ key: 'gemini_api_key' });
    return value;
  } else {
    // Fallback for web
    return localStorage.getItem(LEGACY_KEY);
  }
};

export const removeApiKey = async (): Promise<void> => {
    if (storage) {
        await storage.remove({ key: 'gemini_api_key' });
    } else {
        localStorage.removeItem(LEGACY_KEY);
    }
}
