import type { StorageData } from '../types';

const DEFAULT_STORAGE_KEY = 'docusaurus-new-post-toast';
const SCHEMA_VERSION = 1;

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
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StorageData>;
    return {
      lastVisit: typeof parsed.lastVisit === 'string' ? parsed.lastVisit : '',
      dismissedPosts: Array.isArray(parsed.dismissedPosts) ? parsed.dismissedPosts : [],
      version: typeof parsed.version === 'number' ? parsed.version : SCHEMA_VERSION,
    };
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
      version: SCHEMA_VERSION,
    };
    const merged: StorageData = {
      ...existing,
      ...data,
      version: SCHEMA_VERSION,
    };
    localStorage.setItem(storageKey, JSON.stringify(merged));
  } catch {
    // Storage may fail (quota, private mode); if quota, try trimming dismissed list.
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...data, dismissedPosts: [], version: SCHEMA_VERSION })
      );
    } catch {
      /* give up */
    }
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

export function pruneDismissedPosts(
  knownPostIds: string[],
  storageKey: string = DEFAULT_STORAGE_KEY
): void {
  const known = new Set(knownPostIds);
  const current = getDismissedPosts(storageKey);
  const pruned = current.filter(id => known.has(id));
  if (pruned.length !== current.length) {
    setStorageData({ dismissedPosts: pruned }, storageKey);
  }
}

export function clearDismissedPosts(storageKey: string = DEFAULT_STORAGE_KEY): void {
  setStorageData({ dismissedPosts: [] }, storageKey);
}

export function clearAllData(storageKey: string = DEFAULT_STORAGE_KEY): void {
  if (!canUseLocalStorage()) return;

  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}
