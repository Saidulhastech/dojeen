// GET /account/authorize — OAuth redirect target: validate state, exchange code.
// (Callback path kept as /account/authorize to match the other themes.)
import type { APIRoute } from 'astro';
import { exchangeCodeForToken } from '@/lib/customer/oauth';
import { publicOrigin } from '@/lib/customer/config';
import { consumeLoginState, saveSession } from '@/lib/customer/session';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  const { verifier, state: savedState, returnTo } = consumeLoginState(cookies);

  if (oauthError) {
    return redirect(`/auth/login?error=${encodeURIComponent(oauthError)}`, 302);
  }
  // CSRF: the returned state must match the one we issued.
  if (!code || !state || !verifier || state !== savedState) {
    return redirect('/auth/login?error=invalid_state', 302);
  }

  try {
    const tokens = await exchangeCodeForToken({
      origin: publicOrigin(request, url),
      code,
      codeVerifier: verifier,
    });
    saveSession(cookies, tokens);
    const dest = returnTo && returnTo.startsWith('/') ? returnTo : '/account';
    return redirect(dest, 302);
  } catch {
    return redirect('/auth/login?error=token_exchange', 302);
  }
};
