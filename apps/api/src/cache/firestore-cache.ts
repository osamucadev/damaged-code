import type { Cache } from "./cache.js";

export interface FirestoreCacheOptions {
  projectId: string;
  ttlMs: number;
  /** Set when the target is the local emulator rather than real Firestore. */
  emulatorHost?: string | null;
  /** Collection holding cache documents. It stores nothing but cached results. */
  collection?: string;
  now?: () => number;
}

interface CacheDocument {
  value: unknown;
  expiresAt: number;
}

const DEFAULT_COLLECTION = "cache";

/**
 * Firestore backed cache for the explicit Firebase mode.
 *
 * The BFF is deployed to Cloud Functions later, where instances are ephemeral
 * and there can be several of them, so an in-process cache would mostly miss.
 * A shared cache is the natural fit there, and the Firebase emulator mode that
 * already exists in this repository is where it is developed locally.
 *
 * Expiry is enforced here rather than by a Firestore TTL policy, because a TTL
 * policy deletes lazily and the emulator does not apply one at all. A document
 * past its expiry is treated as a miss.
 *
 * Firebase is imported dynamically so the standard mode never loads the admin
 * SDK at all.
 */
export async function createFirestoreCache(options: FirestoreCacheOptions): Promise<Cache> {
  const {
    projectId,
    ttlMs,
    emulatorHost = null,
    collection = DEFAULT_COLLECTION,
    now = Date.now,
  } = options;

  /*
   * Off Google infrastructure the auth library probes the metadata server to
   * discover credentials, and that probe only fails after a multi second
   * timeout, which it charges to the first cache lookup. The emulator needs no
   * credentials at all, so the probe is disabled for that target only. Real
   * deployments keep it, because metadata is exactly how they authenticate.
   */
  if (emulatorHost !== null) {
    process.env.METADATA_SERVER_DETECTION ??= "none";
  }

  const { getApps, initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  // FIRESTORE_EMULATOR_HOST points the admin SDK at the local emulator, so no
  // credentials are needed in the Firebase development mode.
  const app = getApps().at(0) ?? initializeApp({ projectId });
  const firestore = getFirestore(app);

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const snapshot = await firestore.collection(collection).doc(key).get();

      if (!snapshot.exists) {
        return undefined;
      }

      const document = snapshot.data() as CacheDocument | undefined;

      if (document === undefined || document.expiresAt <= now()) {
        return undefined;
      }

      return document.value as T;
    },

    async set(key: string, value: unknown): Promise<void> {
      const document: CacheDocument = { value, expiresAt: now() + ttlMs };

      await firestore.collection(collection).doc(key).set(document);
    },
  };
}
