// GET /api/auth/logout — clear the session, then end the Shopify session.
import type { APIRoute } from 'astro';
import { getSession, clearSession } from '@/lib/customer/session';
import { buildLogoutUrl } from '@/lib/customer/oauth';
import { publicOrigin } from '@/lib/customer/config';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const idToken = getSession(cookies)?.idToken;
  clearSession(cookies);
  // post_logout_redirect_uri must be a registered Logout URI in the admin.
  if (idToken) {
    const postLogoutRedirectUri = `${publicOrigin(request, url)}/`;
    return redirect(buildLogoutUrl({ idToken, postLogoutRedirectUri }), 302);
  }
  return redirect('/', 302);
};
