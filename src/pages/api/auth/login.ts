// GET /api/auth/login — start the Customer Account API OAuth (PKCE) flow.
import type { APIRoute } from 'astro';
import { customerConfig, publicOrigin } from '@/lib/customer/config';
import { randomToken, pkceChallenge, buildAuthorizeUrl } from '@/lib/customer/oauth';
import { setLoginState } from '@/lib/customer/session';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  if (!customerConfig.isConfigured) {
    return new Response('Customer accounts are not configured.', { status: 503 });
  }

  const verifier = randomToken(32);
  const codeChallenge = await pkceChallenge(verifier);
  const state = randomToken(16);
  const nonce = randomToken(16);

  // Only allow same-site return paths.
  const requested = url.searchParams.get('returnTo') || '/account';
  const returnTo = requested.startsWith('/') ? requested : '/account';

  setLoginState(cookies, { verifier, state, returnTo });

  const origin = publicOrigin(request, url);
  return redirect(buildAuthorizeUrl({ origin, state, nonce, codeChallenge }), 302);
};
