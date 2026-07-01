// ============================================================
//  Customer Account API — session (httpOnly cookies).
//  Tokens live in httpOnly cookies so client JS never sees them;
//  the browser only ever hits same-origin /account & /api/auth/*.
// ============================================================
import type { AstroCookies } from 'astro';
import type { TokenSet } from './oauth';

const C = {
  access: 'ca_at',
  refresh: 'ca_rt',
  idToken: 'ca_it',
  expires: 'ca_exp',
  // transient (one login round-trip)
  verifier: 'ca_pkce',
  state: 'ca_state',
  returnTo: 'ca_return',
};

const base = {
  httpOnly: true,
  secure: import.meta.env.PROD, // allow http on localhost in dev
  sameSite: 'lax' as const, // sent on the top-level OAuth callback redirect
  path: '/',
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (refresh-token window)
const LOGIN_MAX_AGE = 60 * 10; // 10 minutes for the in-flight login

export interface CustomerSession {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number; // epoch ms
}

export function saveSession(cookies: AstroCookies, tokens: TokenSet, prev?: CustomerSession): void {
  const expiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
  // Refresh/id tokens may be omitted on refresh — keep the previous values.
  const refresh = tokens.refresh_token || prev?.refreshToken || '';
  const idToken = tokens.id_token || prev?.idToken || '';
  cookies.set(C.access, tokens.access_token, { ...base, maxAge: SESSION_MAX_AGE });
  cookies.set(C.refresh, refresh, { ...base, maxAge: SESSION_MAX_AGE });
  if (idToken) cookies.set(C.idToken, idToken, { ...base, maxAge: SESSION_MAX_AGE });
  cookies.set(C.expires, String(expiresAt), { ...base, maxAge: SESSION_MAX_AGE });
}

export function getSession(cookies: AstroCookies): CustomerSession | null {
  const accessToken = cookies.get(C.access)?.value;
  const refreshToken = cookies.get(C.refresh)?.value;
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    idToken: cookies.get(C.idToken)?.value,
    expiresAt: Number(cookies.get(C.expires)?.value || '0'),
  };
}

export function clearSession(cookies: AstroCookies): void {
  [C.access, C.refresh, C.idToken, C.expires].forEach((n) => cookies.delete(n, { path: '/' }));
}

export function setLoginState(
  cookies: AstroCookies,
  data: { verifier: string; state: string; returnTo?: string },
): void {
  const opts = { ...base, maxAge: LOGIN_MAX_AGE };
  cookies.set(C.verifier, data.verifier, opts);
  cookies.set(C.state, data.state, opts);
  if (data.returnTo) cookies.set(C.returnTo, data.returnTo, opts);
}

export function consumeLoginState(cookies: AstroCookies): {
  verifier?: string;
  state?: string;
  returnTo?: string;
} {
  const out = {
    verifier: cookies.get(C.verifier)?.value,
    state: cookies.get(C.state)?.value,
    returnTo: cookies.get(C.returnTo)?.value,
  };
  [C.verifier, C.state, C.returnTo].forEach((n) => cookies.delete(n, { path: '/' }));
  return out;
}
