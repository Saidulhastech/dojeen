// ============================================================
//  Customer Account API — configuration & endpoints.
//  Server-only (no PUBLIC_ prefix): the client never sees these.
//  Auth/token/logout live under shopify.com/authentication/{shopId};
//  the GraphQL API under shopify.com/{shopId}/account/customer/api.
// ============================================================
function env(key: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[key];
  if (meta) return meta;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

const clientId = () => env('CUSTOMER_ACCOUNT_API_CLIENT_ID');
const shopId = () => env('SHOPIFY_SHOP_ID');
// 2025-01 is NOT a valid Customer Account API version; default to a supported one.
const version = () => env('CUSTOMER_ACCOUNT_API_VERSION') || '2026-04';

/** Lazy getters — env resolved on access so Workers' per-request env applies. */
export const customerConfig = {
  get clientId() {
    return clientId();
  },
  get shopId() {
    return shopId();
  },
  get version() {
    return version();
  },
  get isConfigured() {
    return Boolean(clientId() && shopId());
  },
};

/** openid + email get profile basics; customer-account-api:full enables the GraphQL API. */
export const SCOPES = 'openid email customer-account-api:full';

export const endpoints = {
  get authorize() {
    return `https://shopify.com/authentication/${shopId()}/oauth/authorize`;
  },
  get token() {
    return `https://shopify.com/authentication/${shopId()}/oauth/token`;
  },
  get logout() {
    return `https://shopify.com/authentication/${shopId()}/logout`;
  },
  get graphql() {
    return `https://shopify.com/${shopId()}/account/customer/api/${version()}/graphql`;
  },
};

/** OAuth callback — must match a Callback URI registered in the admin. */
export function redirectUri(origin: string): string {
  return `${origin}/account/authorize`;
}

/**
 * Public origin of the request, honoring proxy headers (ngrok, prod load
 * balancers) so the OAuth redirect_uri/Origin use the real HTTPS host the
 * browser sees — not the dev server's internal http://localhost.
 */
export function publicOrigin(request: Request, fallback: URL): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || fallback.host;
  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ||
    fallback.protocol.replace(':', '');
  return `${proto}://${host}`;
}
