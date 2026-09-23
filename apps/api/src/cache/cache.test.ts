import { describe, expect, it, vi } from "vitest";

import { cacheKeys, createCacheReader, passThroughCacheReader, type Cache } from "./cache.js";
import { createMemoryCache } from "./memory-cache.js";

function silentLogger() {
  return { warn: vi.fn() };
}

describe("createMemoryCache", () => {
  it("answers a miss for an unknown key", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });

    await expect(cache.get("absent")).resolves.toBeUndefined();
  });

  it("returns a stored value before it expires", async () => {
    let clock = 0;
    const cache = createMemoryCache({ ttlMs: 1000, now: () => clock });

    await cache.set("key", { id: 1 });
    clock = 999;

    await expect(cache.get("key")).resolves.toEqual({ id: 1 });
  });

  it("treats an entry past its lifetime as a miss", async () => {
    let clock = 0;
    const cache = createMemoryCache({ ttlMs: 1000, now: () => clock });

    await cache.set("key", { id: 1 });
    clock = 1000;

    await expect(cache.get("key")).resolves.toBeUndefined();
  });

  it("stores a falsy value without confusing it with a miss", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });

    await cache.set("empty", []);

    await expect(cache.get("empty")).resolves.toEqual([]);
  });
});

describe("createCacheReader", () => {
  it("loads and stores on a miss", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });
    const load = vi.fn().mockResolvedValue({ id: 1 });
    const cached = createCacheReader(cache, silentLogger());

    await expect(cached("key", load)).resolves.toEqual({ id: 1 });
    expect(load).toHaveBeenCalledTimes(1);
    await expect(cache.get("key")).resolves.toEqual({ id: 1 });
  });

  it("serves a second read from the cache without calling the loader again", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });
    const load = vi.fn().mockResolvedValue({ id: 1 });
    const cached = createCacheReader(cache, silentLogger());

    await cached("key", load);
    await expect(cached("key", load)).resolves.toEqual({ id: 1 });

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("loads again once the entry has expired", async () => {
    let clock = 0;
    const cache = createMemoryCache({ ttlMs: 1000, now: () => clock });
    const load = vi.fn().mockResolvedValue({ id: 1 });
    const cached = createCacheReader(cache, silentLogger());

    await cached("key", load);
    clock = 1000;
    await cached("key", load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("falls back to the loader when the cache cannot be read", async () => {
    const logger = silentLogger();
    const failing: Cache = {
      get: vi.fn().mockRejectedValue(new Error("firestore unavailable")),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const cached = createCacheReader(failing, logger);

    await expect(cached("key", async () => ({ id: 1 }))).resolves.toEqual({ id: 1 });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("still returns the upstream result when the cache cannot be written", async () => {
    const logger = silentLogger();
    const failing: Cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockRejectedValue(new Error("firestore write rejected")),
    };
    const cached = createCacheReader(failing, logger);

    await expect(cached("key", async () => ({ id: 1 }))).resolves.toEqual({ id: 1 });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("treats a hanging cache read as a failure instead of waiting on it", async () => {
    const logger = silentLogger();
    const hanging: Cache = {
      get: vi.fn().mockReturnValue(new Promise(() => {})),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const cached = createCacheReader(hanging, logger);

    await expect(cached("key", async () => ({ id: 1 }))).resolves.toEqual({ id: 1 });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  }, 10_000);

  it("does not let a hanging cache write block the response", async () => {
    const logger = silentLogger();
    const hanging: Cache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockReturnValue(new Promise(() => {})),
    };
    const cached = createCacheReader(hanging, logger);

    await expect(cached("key", async () => ({ id: 1 }))).resolves.toEqual({ id: 1 });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  }, 10_000);

  it("does not hide a genuine upstream failure behind the cache", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });
    const cached = createCacheReader(cache, silentLogger());

    await expect(
      cached("key", async () => {
        throw new Error("upstream is down");
      }),
    ).rejects.toThrow("upstream is down");
  });

  it("does not store a failed load", async () => {
    const cache = createMemoryCache({ ttlMs: 1000 });
    const cached = createCacheReader(cache, silentLogger());

    await expect(
      cached("key", async () => {
        throw new Error("upstream is down");
      }),
    ).rejects.toThrow();
    await expect(cache.get("key")).resolves.toBeUndefined();
  });
});

describe("passThroughCacheReader", () => {
  it("always calls the loader", async () => {
    const load = vi.fn().mockResolvedValue("value");

    await expect(passThroughCacheReader("key", load)).resolves.toBe("value");
    await expect(passThroughCacheReader("key", load)).resolves.toBe("value");
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe("cacheKeys", () => {
  it("separates every cached concept and carries a schema version", () => {
    expect(cacheKeys.episodeCatalog()).toBe("v1:episodes:all");
    expect(cacheKeys.episode(3)).toBe("v1:episode:3");
    expect(cacheKeys.episodeCharacters(3)).toBe("v1:episode:3:characters");
    expect(cacheKeys.character(3)).toBe("v1:character:3");
  });

  it("keeps keys usable as document ids", () => {
    const keys = [
      cacheKeys.episodeCatalog(),
      cacheKeys.episode(1),
      cacheKeys.episodeCharacters(1),
      cacheKeys.character(1),
    ];

    for (const key of keys) {
      expect(key).not.toContain("/");
    }
  });
});
