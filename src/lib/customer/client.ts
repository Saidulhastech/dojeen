// ============================================================
//  Customer Account API — authenticated GraphQL client.
//  Refreshes the access token just before/at expiry and on a 401,
//  persisting the rotated tokens back into the session cookies.
// ============================================================
import type { AstroCookies } from 'astro';
import { endpoints } from './config';
import { getSession, saveSession, clearSession, type CustomerSession } from './session';
import { refreshAccessToken } from './oauth';

async function ensureValid(
  cookies: AstroCookies,
  origin: string,
): Promise<CustomerSession | null> {
  const session = getSession(cookies);
  if (!session) return null;
  // Refresh proactively within 60s of expiry.
  if (session.expiresAt - Date.now() > 60_000) return session;
  try {
    const tokens = await refreshAccessToken({ origin, refreshToken: session.refreshToken });
    saveSession(cookies, tokens, session);
    return getSession(cookies);
  } catch {
    clearSession(cookies);
    return null;
  }
}

async function gqlCall<T>(token: string, origin: string, query: string, variables: Record<string, unknown>) {
  return fetch(endpoints.graphql, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // raw access token — NOT "Bearer ..."
      Origin: origin,
    },
    body: JSON.stringify({ query, variables }),
  });
}

/**
 * Run a Customer Account API GraphQL operation for the signed-in customer.
 * Returns `data` (or null if not authenticated / unrecoverable).
 */
export async function customerFetch<T>(
  cookies: AstroCookies,
  origin: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  const session = await ensureValid(cookies, origin);
  if (!session) return null;

  let res = await gqlCall<T>(session.accessToken, origin, query, variables);

  // One reactive refresh if the token was rejected.
  if (res.status === 401) {
    try {
      const tokens = await refreshAccessToken({ origin, refreshToken: session.refreshToken });
      saveSession(cookies, tokens, session);
      res = await gqlCall<T>(tokens.access_token, origin, query, variables);
    } catch {
      clearSession(cookies);
      return null;
    }
  }

  if (!res.ok) {
    if (res.status === 401) clearSession(cookies);
    return null;
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  return json.data ?? null;
}
