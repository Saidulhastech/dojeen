// ============================================================
//  Tiny in-memory TTL cache for SSR Shopify reads.
//  Keeps the homepage / shop / PDP from re-querying Shopify on
//  every request. Process-local (per Node server instance);
//  cart + checkout never use this — they must always be live.
// ============================================================
interface Entry {
  value: unknown;
  expires: number;
}

const store = new Map<string, Entry>();

/** Default time-to-live for catalog reads (ms). */
export const DEFAULT_TTL = 60_000;

/**
 * Return the cached value for `key`, or compute + store it. Errors are
 * not cached, so a transient Shopify failure won't be pinned for the TTL.
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await fn();
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

/** Clear the whole cache (e.g. for a webhook-driven revalidation later). */
export function clearCache(): void {
  store.clear();
}
