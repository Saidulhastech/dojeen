// ============================================================
//  Customer Account API — OAuth 2.0 (Authorization Code + PKCE).
//  Public client (Client ID only, no secret) → PKCE is required.
// ============================================================
import { customerConfig, endpoints, SCOPES, redirectUri } from './config';

function base64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe random token (state, nonce, PKCE verifier). */
export function randomToken(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return base64url(a);
}

/** S256 PKCE challenge from a verifier. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export function buildAuthorizeUrl(opts: {
  origin: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const u = new URL(endpoints.authorize);
  u.searchParams.set('scope', SCOPES);
  u.searchParams.set('client_id', customerConfig.clientId!);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('redirect_uri', redirectUri(opts.origin));
  u.searchParams.set('state', opts.state);
  u.searchParams.set('nonce', opts.nonce);
  u.searchParams.set('code_challenge', opts.codeChallenge);
  u.searchParams.set('code_challenge_method', 'S256');
  return u.toString();
}

export interface TokenSet {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
}

async function postToken(origin: string, body: URLSearchParams): Promise<TokenSet> {
  const res = await fetch(endpoints.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Public clients must send Origin (must match a registered JavaScript origin).
      Origin: origin,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token request failed (HTTP ${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as TokenSet;
}

export function exchangeCodeForToken(opts: {
  origin: string;
  code: string;
  codeVerifier: string;
}): Promise<TokenSet> {
  return postToken(
    opts.origin,
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: customerConfig.clientId!,
      redirect_uri: redirectUri(opts.origin),
      code: opts.code,
      code_verifier: opts.codeVerifier,
    }),
  );
}

export function refreshAccessToken(opts: { origin: string; refreshToken: string }): Promise<TokenSet> {
  return postToken(
    opts.origin,
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: customerConfig.clientId!,
      refresh_token: opts.refreshToken,
    }),
  );
}

export function buildLogoutUrl(opts: { idToken: string; postLogoutRedirectUri: string }): string {
  const u = new URL(endpoints.logout);
  u.searchParams.set('id_token_hint', opts.idToken);
  u.searchParams.set('post_logout_redirect_uri', opts.postLogoutRedirectUri);
  return u.toString();
}
