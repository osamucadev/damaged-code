import type { Cache } from "./cache.js";

interface Entry {
  value: unknown;
  expiresAt: number;
}

export interface MemoryCacheOptions {
  ttlMs: number;
  /** Injected in tests so expiry can be exercised without waiting. */
  now?: () => number;
}

/**
 * In-process cache for the standard mode.
 *
 * The key space is bounded by the upstream dataset, a few dozen episodes and a
 * few hundred characters, so a plain Map needs no eviction policy. Expired
 * entries are dropped when they are read.
 */
export function createMemoryCache(options: MemoryCacheOptions): Cache {
  const { ttlMs, now = Date.now } = options;
  const entries = new Map<string, Entry>();

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const entry = entries.get(key);

      if (entry === undefined) {
        return undefined;
      }

      if (entry.expiresAt <= now()) {
        entries.delete(key);

        return undefined;
      }

      return entry.value as T;
    },

    async set(key: string, value: unknown): Promise<void> {
      entries.set(key, { value, expiresAt: now() + ttlMs });
    },
  };
}
