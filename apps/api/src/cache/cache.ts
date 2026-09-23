/**
 * The cache seam.
 *
 * Two operations are enough for what this project actually does: read a
 * normalized result, or store one. There is no delete and no invalidation API,
 * because entries expire on their own and the upstream dataset is archival.
 *
 * The interface exists because the project genuinely runs in two modes that
 * already exist in the repository: the standard Docker mode without Firebase,
 * and the explicit Firebase mode. It is not a generic storage platform.
 */
export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

/** The subset of the Fastify logger the cache path needs. */
export interface CacheLogger {
  warn(context: Record<string, unknown>, message: string): void;
}

/**
 * Reads through the cache, falling back to the loader.
 *
 * A cache is an optimization, never the source of truth, so a failing cache
 * must not take the product down while the upstream source can still answer.
 * Both failure paths are logged with context and then ignored.
 */
export type CacheReader = <T>(key: string, load: () => Promise<T>) => Promise<T>;

/*
 * A cache that hangs would be worse than a cache that fails, because the
 * request would wait on an optimization. Every cache operation is bounded, and
 * a timeout is handled on exactly the same path as an error.
 *
 * The bound is generous compared to a healthy lookup, which is single digit
 * milliseconds in process and tens of milliseconds against Firestore.
 */
const OPERATION_TIMEOUT_MS = 1000;

async function withTimeout<T>(operation: Promise<T>, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error(`cache ${label} exceeded ${OPERATION_TIMEOUT_MS}ms`)),
          OPERATION_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

export function createCacheReader(cache: Cache, logger: CacheLogger): CacheReader {
  return async function read<T>(key: string, load: () => Promise<T>): Promise<T> {
    try {
      const hit = await withTimeout(cache.get<T>(key), "read");

      if (hit !== undefined) {
        return hit;
      }
    } catch (error) {
      logger.warn({ err: error, key }, "cache read failed, falling back to the upstream source");
    }

    const value = await load();

    try {
      await withTimeout(cache.set(key, value), "write");
    } catch (error) {
      logger.warn({ err: error, key }, "cache write failed, returning the upstream result");
    }

    return value;
  };
}

/** Used when no cache is configured, such as in unit tests. */
export const passThroughCacheReader: CacheReader = (_key, load) => load();

/*
 * Cache keys.
 *
 * The prefix carries a schema version. If a normalized shape ever changes, the
 * prefix changes with it and old entries are simply never read again, which is
 * all the invalidation this project needs.
 */
const KEY_PREFIX = "v1";

export const cacheKeys = {
  episodeCatalog: () => `${KEY_PREFIX}:episodes:all`,
  episode: (episodeId: number) => `${KEY_PREFIX}:episode:${episodeId}`,
  episodeCharacters: (episodeId: number) => `${KEY_PREFIX}:episode:${episodeId}:characters`,
  character: (characterId: number) => `${KEY_PREFIX}:character:${characterId}`,
};
