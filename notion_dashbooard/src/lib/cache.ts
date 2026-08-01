type CacheEntry = {
  value: unknown;
  expires: number;
};

const store = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 45_000;

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheInvalidate(key: string): void {
  store.delete(key);
}

export function cacheInvalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function cacheInvalidateAll(): void {
  store.clear();
}

export function detailCacheKey(dataSourceId: string, allPages: boolean): string {
  return `ds:${dataSourceId}:detail:${allPages ? "all" : "page"}`;
}

export function invalidateDataSource(dataSourceId: string): void {
  cacheInvalidatePrefix(`ds:${dataSourceId}:`);
  cacheInvalidate("list:datasources");
}
