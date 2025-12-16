import type { StorageData } from '../types';

const DEFAULT_STORAGE_KEY = 'docusaurus-new-post-toast';

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getStorageData(storageKey: string = DEFAULT_STORAGE_KEY): StorageData | null {
  if (!canUseLocalStorage()) return null;

  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StorageData) : null;
  } catch {
    return null;
  }
}

export function setStorageData(
  data: Partial<StorageData>,
  storageKey: string = DEFAULT_STORAGE_KEY
): void {
  if (!canUseLocalStorage()) return;

  try {
    const existing = getStorageData(storageKey) || {
      lastVisit: '',
      dismissedPosts: [],
      version: 1,
    };
    const merged: StorageData = {
      ...existing,
      ...data,
      version: 1,
    };
    localStorage.setItem(storageKey, JSON.stringify(merged));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

export function getLastVisit(storageKey: string = DEFAULT_STORAGE_KEY): string | null {
  const data = getStorageData(storageKey);
  return data?.lastVisit || null;
}

export function updateLastVisit(storageKey: string = DEFAULT_STORAGE_KEY): void {
  setStorageData({ lastVisit: new Date().toISOString() }, storageKey);
}

export function getDismissedPosts(storageKey: string = DEFAULT_STORAGE_KEY): string[] {
  const data = getStorageData(storageKey);
  return data?.dismissedPosts ?? [];
}

export function addDismissedPost(postId: string, storageKey: string = DEFAULT_STORAGE_KEY): void {
  const dismissed = new Set(getDismissedPosts(storageKey));
  dismissed.add(postId);
  setStorageData({ dismissedPosts: Array.from(dismissed) }, storageKey);
}

export function clearDismissedPosts(storageKey: string = DEFAULT_STORAGE_KEY): void {
  setStorageData({ dismissedPosts: [] }, storageKey);
}

export function clearAllData(storageKey: string = DEFAULT_STORAGE_KEY): void {
  if (!canUseLocalStorage()) return;

  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore errors
  }
}
