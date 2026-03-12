import type { CacheEntry } from "./types";

/** Cache TTL in milliseconds (5 minutes) */
const TTL_MS = 5 * 60 * 1000;

/** In-memory cache store */
const store = new Map<string, CacheEntry<unknown>>();

/**
 * Retrieve a cached value by key.
 * Returns undefined if the key is missing or the entry has expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > TTL_MS) {
    store.delete(key);
    return undefined;
  }
  return entry.data;
}

/**
 * Store a value in the cache with the current timestamp.
 */
export function cacheSet<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

/**
 * Remove a specific key from the cache.
 */
export function cacheInvalidate(key: string): void {
  store.delete(key);
}

/**
 * Clear all entries from the cache.
 */
export function cacheClear(): void {
  store.clear();
}

/**
 * Return the number of entries currently in the cache.
 */
export function cacheSize(): number {
  return store.size;
}
