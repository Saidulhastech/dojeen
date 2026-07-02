# Deploying Dojeen to Cloudflare Workers

This template runs as an **SSR app on Cloudflare Workers** using the
`@astrojs/cloudflare` adapter. SSR is required so the Shopify Storefront
**private token** stays server-side and the httpOnly cart/customer cookies work.

---

## 1. Prerequisites

- A Cloudflare account.
- Node `>=22.12`.
- Wrangler is already a dev dependency — run it via `npx wrangler` (no global install needed).
- Authenticate once:

  ```bash
  npx wrangler login
  ```

---

## 2. Create the SESSION KV namespace (one time)

The Astro adapter enables sessions backed by a KV namespace bound as `SESSION`.
This app authenticates via httpOnly cookies (not Astro sessions), so the
namespace stays effectively empty — it only satisfies the binding.

```bash
npx wrangler kv namespace create SESSION
```

Copy the printed `id` into **wrangler.jsonc**, replacing
`REPLACE_WITH_KV_NAMESPACE_ID`:

```jsonc
"kv_namespaces": [{ "binding": "SESSION", "id": "<the-id-you-got>" }]
```

---

## 3. Set production secrets

These are **secrets** (never commit them). Set each once per Worker:

```bash
npx wrangler secret put SHOPIFY_SHOP_DOMAIN
npx wrangler secret put SHOPIFY_STOREFRONT_PRIVATE_TOKEN
npx wrangler secret put SHOPIFY_API_VERSION
npx wrangler secret put CUSTOMER_ACCOUNT_API_CLIENT_ID
npx wrangler secret put SHOPIFY_SHOP_ID
npx wrangler secret put CUSTOMER_ACCOUNT_API_VERSION
```

Each command prompts for the value. See `.env.example` for what each one is.
(You can also set them in the dashboard: Workers & Pages → your Worker →
Settings → Variables and Secrets.)

> The adapter bridges these into `process.env` at request time, which is what
> the Shopify client and Customer Account config read.

---

## 4. Deploy

```bash
npm run deploy
```

This runs `astro build` then `wrangler deploy -c dist/server/wrangler.json`
(the adapter generates that config with the correct `main` and `assets`).

Your Worker goes live at `https://dojeen.<your-subdomain>.workers.dev`.
Add a custom domain under the Worker's **Settings → Domains & Routes**.

---

## 5. Point Shopify at the live URL

After the first deploy, update the OAuth redirect/logout URIs in the Shopify
admin (Settings → Customer accounts → Customer Account API) to your live origin:

- Callback URI: `https://<your-domain>/account/authorize`
- Logout URI:   `https://<your-domain>/`

Also update `site` in `astro.config.mjs` to your final domain (currently
`https://dojeen.com`) so the sitemap uses the right host, then redeploy.

---

## Local development

- `npm run dev` — Astro dev server. Reads secrets from a local `.env`
  (copy `.env.example` → `.env`). Fastest inner loop.
- `npm run preview` — full production build served by the local Workers
  runtime (`wrangler dev`). Reads local values from `.dev.vars`
  (copy `.dev.vars.example` → `.dev.vars`).

Both `.env` and `.dev.vars` are gitignored.

---

## Notes / gotchas

- **No `main`/`assets` in `wrangler.jsonc`.** The adapter injects them into
  `dist/server/wrangler.json` at build time. Adding them to the root config
  breaks the build (it tries to resolve a `dist` file that doesn't exist yet).
- **Images:** `imageService: 'passthrough'` — remote Shopify CDN images are
  served as-is (no Sharp on Workers). Switch to Cloudflare Images later if you
  want on-the-fly resizing.
- **In-memory catalog cache** (`src/lib/cache.ts`) is per-isolate on Workers —
  it still helps, just with a lower hit rate than a single long-lived Node
  process. Cart/checkout never use it.
- **`nodejs_compat`** is enabled in `wrangler.jsonc`; the app itself only needs
  Web Crypto + `process.env`, both covered by it.
