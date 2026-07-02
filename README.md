<p align="center">
<img src="public/images/brand-logo.png" alt="Dojeen Logo" width="200" />
</p>
<h1 align="center">Dojeen — Astro Fashion Theme</h1>
<p align="center">
  A modern fashion ecommerce theme built with Astro 6 (SSR) and Tailwind CSS v4, powered by <strong>headless Shopify</strong> — live products, collections, faceted search, a server-side cart, hosted checkout, and customer accounts.
</p>
<p align="center">
<a href="#features">Features</a> |
<a href="#tech-stack">Tech Stack</a> |
<a href="#getting-started">Getting Started</a> |
<a href="#shopify-setup">Shopify Setup</a> |
<a href="#architecture">Architecture</a> |
<a href="#pages--routes">Pages</a> |
<a href="#project-structure">Project Structure</a> |
<a href="#license">License</a>
</p>
<p align="center">
<img src="public/og-image.jpg" alt="Dojeen Preview" width="100%" />
</p>

---

## Features

- **Headless Shopify commerce** — products, collections, cart, and hosted checkout run live off the Shopify **Storefront API** (`2026-04`).
- **SSR by default** (`output: 'server'`, `@astrojs/node` standalone). Commerce pages render per request; static & blog pages opt into prerendering.
- **Server-side cart** via the Shopify Cart API — the cart id lives in an **httpOnly** cookie (`dojeen_cart_id`); the browser only talks to same-origin `/api/cart/*`, never to Shopify directly.
- **Hosted checkout** — checkout / Buy-now / PayPal all hand off to Shopify's secure hosted checkout (`cart.checkoutUrl`).
- **Faceted PLP** — URL-driven filters, sort, price range, and cursor pagination sourced from Shopify facets, with progressive-enhancement AJAX swaps (works with JS off).
- **Live search** — predictive header search + a full search results page backed by Shopify.
- **Product recommendations** — "Complete the Look" (complementary) and a cart upsell rail (`/api/recommendations`, complementary → related fallback).
- **Customer accounts** — login / register via the Shopify **Customer Account API** (OAuth + PKCE).
- **Conversion touches** — free-shipping progress bar, real per-variant low-stock ("Only N left"), delivery-date estimate, recently-viewed, wishlist.
- **The Storefront private token is server-only** — no `PUBLIC_` prefix, so it never reaches the browser.
- **Performance** — Shopify CDN image resizing + responsive `srcset`, CDN preconnect, hero LCP preload, 60s in-memory SSR cache.
- **Accessibility** — skip link, keyboard focus rings, labelled controls, and `prefers-reduced-motion` support throughout.
- Tailwind CSS v4 via `@tailwindcss/vite`; TypeScript strict with `@/*` path aliases; auto-generated sitemap.

---

## Tech Stack

| Dependency | Version | Purpose |
| --- | --- | --- |
| Astro | ^6.4.4 | SSR site framework |
| @astrojs/node | ^10.1.4 | Node standalone SSR adapter |
| Tailwind CSS | ^4.3.0 | Styling |
| @tailwindcss/vite | ^4.3.0 | Astro Tailwind v4 integration |
| @astrojs/sitemap | ^3.7.3 | Sitemap generation |
| @astrojs/check | ^0.9.9 | TypeScript type checking |
| Shopify Storefront API | 2026-04 | Products, collections, cart, checkout, search |
| Shopify Customer Account API | 2026-04 | Customer login / accounts (OAuth + PKCE) |

---

## Getting Started

### Prerequisites

- Node.js >= 22.12.0
- npm, yarn, or pnpm
- A Shopify store with the **Storefront API** enabled (see [Shopify Setup](#shopify-setup))

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Shopify credentials:

```bash
cp .env.example .env
```

At minimum, set `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, and
`SHOPIFY_API_VERSION` (see [Shopify Setup](#shopify-setup)). These are **server-only**
(no `PUBLIC_` prefix), so the token is never shipped to the browser.

### 3. Develop

```bash
npm run dev          # http://localhost:4321
```

### 4. Build & preview

```bash
npm run build        # → dist/ (Node server at dist/server/entry.mjs)
npm run preview      # serve the production build
```

The production build is a standalone Node server. Run it with `node dist/server/entry.mjs`
behind your process manager / host of choice, with the same environment variables set.

---

## Shopify Setup

All Shopify calls are proxied server-side, so every credential below is kept on the server.

### Storefront API (required — products, cart, checkout)

From your Shopify admin: **Settings → Apps and sales channels → Develop apps** →
create/select an app → **Configure Storefront API scopes** → install → copy the
**Storefront API access token**.

| Variable | Description |
| --- | --- |
| `SHOPIFY_SHOP_DOMAIN` | Your `*.myshopify.com` domain |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Storefront **private** (delegate) token — sent as the `Shopify-Storefront-Private-Token` header |
| `SHOPIFY_API_VERSION` | Pinned API version (`2026-04`) |

### Customer Account API (optional — login / accounts)

From your admin: **Settings → Customer accounts → Customer Account API**. Register a
**public** client (Client ID only, no secret), and add the callback URI
`{origin}/account/authorize` and logout URI `{origin}/` to the application setup.

| Variable | Description |
| --- | --- |
| `CUSTOMER_ACCOUNT_API_CLIENT_ID` | Customer Account API Client ID |
| `SHOPIFY_SHOP_ID` | Your numeric Shop ID (shown in the Customer Account API settings) |
| `CUSTOMER_ACCOUNT_API_VERSION` | Customer Account API version (`2026-04`) |

> **Merchandising note:** the demo store uses no product tags, so featured → best-sellers,
> new arrivals → newest, and on-sale → `compareAtPrice > price`. Categories map to Shopify
> **collections** (handle = slug). Adjust the logic in `src/lib/catalog.ts` if your store
> adds dedicated collections or tags.

---

## Architecture

**Data flow:** Shopify Storefront (private token, server-only) → `src/lib/shopify/services`
→ `src/lib/shopify/adapter` (maps Shopify → Dojeen's `Product`/`Category` shapes) →
`src/lib/catalog` (60s in-memory cache) → `.astro` pages. The browser talks only to
same-origin `/api/*` routes.

**Rendering:** SSR by default. Commerce pages (`/`, `/shop`, `/shop/category/*`,
`/products/*`, `/search`, `/cart`) fetch Shopify at request time; static & blog pages set
`export const prerender = true`.

**Cart:** client controller `src/lib/cart.ts` (`initCart / addItem / updateLine /
removeLine / goToCheckout`) → same-origin `/api/cart/*` → Shopify Cart API using the private
token. The cart id is stored in an httpOnly `dojeen_cart_id` cookie. Every change dispatches
a `cart:updated` CustomEvent (`detail.cart`) that each surface (header badge, drawer, cart
page) re-renders from. `window.__dojeenOpenCart()` opens the drawer.

**Legacy data:** the `src/data/*.ts` files now back only **non-commerce** content (blog,
authors, testimonials, partners, features, footer nav). Product/category data comes from
Shopify.

---

## Pages & Routes

### Storefront

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/search` | `src/pages/search.astro` |

### Shop (Shopify-backed)

| Route | File |
| --- | --- |
| `/shop` | `src/pages/shop/index.astro` |
| `/shop/no-sidebar` | `src/pages/shop/no-sidebar.astro` |
| `/shop/category/[category]` | `src/pages/shop/category/[category].astro` |
| `/products/[slug]` | `src/pages/products/[slug].astro` |

### Cart, Checkout & Wishlist

| Route | File |
| --- | --- |
| `/cart` | `src/pages/cart.astro` |
| `/wishlist` | `src/pages/wishlist.astro` |
| `/checkout` | `src/pages/checkout.astro` (SSR redirect → Shopify hosted checkout) |
| `/paypal-checkout` | `src/pages/paypal-checkout.astro` (SSR redirect → hosted checkout) |
| `/order-confirmation` | `src/pages/order-confirmation.astro` |

### Account & Auth (Customer Account API)

| Route | File |
| --- | --- |
| `/account` | `src/pages/account/index.astro` |
| `/account/authorize` | `src/pages/account/authorize.ts` (OAuth callback) |
| `/auth/login` | `src/pages/auth/login.astro` |
| `/auth/register` | `src/pages/auth/register.astro` |
| `/auth/forgot-password` | `src/pages/auth/forgot-password.astro` |

### Blog

| Route | File |
| --- | --- |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` |
| `/blog/category/[category]` | `src/pages/blog/category/[category].astro` |
| `/blog/author/[slug]` | `src/pages/blog/author/[slug].astro` |

### API endpoints (SSR, `prerender = false`)

| Route | File | Method |
| --- | --- | --- |
| `/api/cart` | `src/pages/api/cart.ts` | GET |
| `/api/cart/add` | `src/pages/api/cart/add.ts` | POST |
| `/api/cart/update` | `src/pages/api/cart/update.ts` | POST |
| `/api/cart/remove` | `src/pages/api/cart/remove.ts` | POST |
| `/api/search` | `src/pages/api/search.ts` | GET (predictive) |
| `/api/recommendations` | `src/pages/api/recommendations.ts` | GET |
| `/api/auth/login` | `src/pages/api/auth/login.ts` | — |
| `/api/auth/logout` | `src/pages/api/auth/logout.ts` | — |

### Template Info & Utility

| Route | File |
| --- | --- |
| `/template-info/style-guide` | `src/pages/template-info/style-guide.astro` |
| `/template-info/licenses` | `src/pages/template-info/licenses.astro` |
| `/template-info/changelog` | `src/pages/template-info/changelog.astro` |
| `/template-info/instruction` | `src/pages/template-info/instruction.astro` |
| `/404` | `src/pages/404.astro` |

---

## Project Structure

```
public/
  images/                # Static theme images (favicon, og-image, UI assets)
  videos/                # Static video files
src/
  assets/
    images/              # Astro-processed images (via getImageUrl())
    videos/              # Video files
  components/
    layout/              # Header.astro, Footer.astro, CartDrawer.astro
    sections/            # ProductCard.astro, BlogCard.astro
    ui/                  # CommonHero.astro
  data/                  # Non-commerce content: blog, authors, testimonials, …
  layouts/
    BaseLayout.astro     # HTML shell, head, Open Graph, fonts, skip link
  lib/
    shopify/             # Storefront API layer (client, graphql, services,
                         #   transforms, adapter, types)
    customer/            # Customer Account API (OAuth + PKCE, session, service)
    catalog.ts           # Shopify-backed product/collection helpers (cached)
    cart.ts              # Client cart controller → /api/cart/* (cart:updated)
    cart-server.ts       # Server cart helpers (ensure cart, cookie sync)
    cart-cookie.ts       # httpOnly 'dojeen_cart_id' cookie
    cart-upsell.ts       # "You may also like" rail (drawer + cart page)
    facets.ts            # AJAX faceting for the PLP
    cache.ts             # 60s in-memory TTL cache for SSR reads
    money.ts             # formatMoney(amount, currencyCode)
    img.ts               # img() / sizedImg() / srcSet() — Shopify CDN sizing
    shipping.ts          # Free-shipping threshold + progress
    wishlist.ts, recently-viewed.ts, colors.ts, …
  pages/                 # Routes; pages/api/* are SSR endpoints
  styles/
    global.css           # @import tailwindcss + webflow.css + overrides
    webflow.css          # Design token source (CSS custom properties)
  types.ts               # Product, Post, Author, Category interfaces
astro.config.mjs         # output: 'server', @astrojs/node standalone
.env.example
package.json
tsconfig.json
```

---

## Customization

### Site URL & SEO

- Set the production domain via `site` in `astro.config.mjs`.
- Titles/descriptions live in each page's frontmatter (defaults in `BaseLayout.astro`).

### Colors & Typography

- Design tokens (colors, fonts, spacing) are CSS custom properties at the top of `src/styles/webflow.css`.
- Google Fonts are loaded asynchronously (preload + swap) in `src/layouts/BaseLayout.astro`.

### Commerce behaviour

- Merchandising rules (featured / new / on-sale) and collection mapping: `src/lib/catalog.ts`.
- Free-shipping threshold: `FREE_SHIPPING_THRESHOLD` in `src/lib/shipping.ts`.
- Low-stock threshold + delivery estimate: `src/pages/products/[slug].astro`.
- Product image sizes / `srcset`: `src/lib/img.ts` and `ProductCard.astro`.

### Non-commerce content

Edit the data files in `src/data/`:

- `blog.ts` — blog posts, excerpts, cover images
- `authors.ts` — blog author profiles
- `testimonials.ts` — customer testimonials
- `partners.ts` — brand partner logos
- `features.ts` — feature highlight cards
- `nav.ts` — footer navigation links

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the production SSR server to `dist/` |
| `npm run preview` | Preview the production build |
| `npx astro check` | Run TypeScript type checking |

---

## Deployment

This template is fully **platform-agnostic** and can be deployed to Cloudflare, Vercel, Netlify, or a self-hosted Node.js VPS.

### Option 1: VPS (Node.js) / Docker
To deploy on a VPS (like DigitalOcean, Hetzner, AWS, etc.) using Node.js:

1. **Clone the repository** to your server.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**: Create a `.env` file in the root directory and ensure you set:
   ```env
   ASTRO_ADAPTER=node
   SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
   SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_...
   ```
4. **Build the application**:
   ```bash
   npm run build:node
   ```
5. **Start the standalone Node server**:
   - For basic testing:
     ```bash
     npm run start:node
     ```
   - **Using PM2** (Recommended for production process management):
     ```bash
     npm install -g pm2
     pm2 start dist/server/entry.mjs --name "dojeen-storefront"
     pm2 save
     pm2 startup
     ```
6. **Reverse Proxy (Nginx)**: Configure your Nginx block to reverse-proxy port `4321` (or the port set in `PORT` env var) to your domain:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:4321;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 2: Cloudflare Workers
Connect the repo to a Cloudflare Worker (Workers & Pages → Import a repository) and set the **Build** configuration exactly as below:
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`

---

### Option 3: Vercel & Netlify
Deploy directly through your hosting provider's dashboard by connecting your git repository. The runtime environment is auto-detected, so you do not need to configure the `ASTRO_ADAPTER` variable. Just add the Shopify credentials to your dashboard's environment variables.

---

## License

See the `LICENSE` file. Full terms are also available at `/template-info/licenses`.
