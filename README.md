<p align="center">
<img src="public/images/brand-logo.png" alt="Dojeen Logo" width="200" />
</p>
<h1 align="center">Dojeen — Astro Fashion Theme</h1>
<p align="center">
  A modern fashion ecommerce website template built with Astro 6, Tailwind CSS v4, and a vanilla JS cart system — covering shop, blog, checkout, and auth flows.
</p>
<p align="center">
<a href="#features">Features</a> |
<a href="#pages">Pages</a> |
<a href="#getting-started">Getting Started</a> |
<a href="#customization">Customization</a> |
<a href="#project-structure">Project Structure</a> |
<a href="#license">License</a>
</p>
<p align="center">
<img src="public/og-image.jpg" alt="Dojeen Preview" width="100%" />
</p>

---

## Features

- Astro 6 with static output — zero JS shipped by default.
- Tailwind CSS v4 via `@tailwindcss/vite` with all design tokens preserved as CSS custom properties.
- TypeScript strict mode with `@/*` path aliases throughout.
- Vanilla JS cart system using `localStorage` (`dojeen_cart` key) with a `cart:updated` CustomEvent.
- Auto-generated sitemap via `@astrojs/sitemap`.
- Scroll-reveal animations powered by IntersectionObserver with `prefers-reduced-motion` support.
- Responsive mobile off-canvas navigation with keyboard accessibility.
- 48 pages covering full ecommerce, blog, checkout, auth, and utility flows.

---

## Pages

### Main

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/search` | `src/pages/search.astro` |

### Shop

| Route | File |
| --- | --- |
| `/shop` | `src/pages/shop/index.astro` |
| `/shop/no-sidebar` | `src/pages/shop/no-sidebar.astro` |
| `/shop/category/[category]` | `src/pages/shop/category/[category].astro` |
| `/products/[slug]` | `src/pages/products/[slug].astro` |

### Blog

| Route | File |
| --- | --- |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` |
| `/blog/category/[category]` | `src/pages/blog/category/[category].astro` |
| `/blog/author/[slug]` | `src/pages/blog/author/[slug].astro` |

### Checkout

| Route | File |
| --- | --- |
| `/checkout` | `src/pages/checkout.astro` |
| `/paypal-checkout` | `src/pages/paypal-checkout.astro` |
| `/order-confirmation` | `src/pages/order-confirmation.astro` |

### Auth

| Route | File |
| --- | --- |
| `/auth/login` | `src/pages/auth/login.astro` |
| `/auth/register` | `src/pages/auth/register.astro` |
| `/auth/forgot-password` | `src/pages/auth/forgot-password.astro` |

### Template Info

| Route | File |
| --- | --- |
| `/template-info/style-guide` | `src/pages/template-info/style-guide.astro` |
| `/template-info/licenses` | `src/pages/template-info/licenses.astro` |
| `/template-info/changelog` | `src/pages/template-info/changelog.astro` |
| `/template-info/instruction` | `src/pages/template-info/instruction.astro` |

### Utility

| Route | File |
| --- | --- |
| `/404` | `src/pages/404.astro` |

---

## Getting Started

### Prerequisites

- Node.js >= 22.12.0
- npm, yarn, or pnpm

### Install

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## Customization

### Site URL and SEO Defaults

- Update the production domain in `astro.config.mjs`.
- Update page titles and descriptions in each page's frontmatter.

### Colors and Typography

- All design tokens (colors, fonts, spacing) are CSS custom properties at the top of `src/styles/webflow.css`.
- Google Fonts (Instrument Sans + Inter) are loaded async in `src/layouts/BaseLayout.astro`.

### Page Content Data

Edit the data files in `src/data/`:

- `src/data/products.ts` — product catalog, prices, categories, images
- `src/data/blog.ts` — blog posts, excerpts, cover images
- `src/data/authors.ts` — blog author profiles
- `src/data/categories.ts` — shop categories
- `src/data/testimonials.ts` — customer testimonials
- `src/data/partners.ts` — brand partner logos
- `src/data/features.ts` — feature highlight cards
- `src/data/nav.ts` — footer navigation links

### Images and Videos

- Static images served from URL: `public/images/`
- Astro-optimized images (imported via `getImageUrl()`): `src/assets/images/`
- Videos: `public/videos/` and `src/assets/videos/`

---

## Project Structure

```
public/
  images/              # Static product, blog, and UI images
  videos/              # Static video files
  favicon.png
  og-image.jpg
src/
  assets/
    images/            # 202 images (accessed via getImageUrl())
    videos/            # 8 video files
  components/
    layout/            # Header.astro, Footer.astro, CartDrawer.astro
    sections/          # ProductCard.astro, BlogCard.astro
    ui/                # CommonHero.astro
  data/                # products.ts, blog.ts, authors.ts, categories.ts, nav.ts …
  layouts/
    BaseLayout.astro   # HTML shell, head, Open Graph, fonts
  lib/
    cart.ts            # Cart CRUD + cart:updated CustomEvent
    assets.ts          # getImageUrl(), getVideoUrl() via import.meta.glob
  pages/               # 22 routes → 48 built pages
  styles/
    global.css         # @import tailwindcss + webflow.css overrides
    webflow.css        # Design token source (CSS custom properties)
  types.ts             # Product, Post, Author, Category interfaces
astro.config.mjs
package.json
tsconfig.json
```

---

## Tech Stack

| Dependency | Version | Purpose |
| --- | --- | --- |
| Astro | ^6.4.4 | Static site framework |
| Tailwind CSS | ^4.3.0 | Styling |
| @tailwindcss/vite | ^4.3.0 | Astro Tailwind v4 integration |
| @astrojs/sitemap | ^3.7.3 | Sitemap generation |
| @astrojs/check | ^0.9.9 | TypeScript type checking |

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build |
| `npx astro check` | Run TypeScript type checking |

---

## License

This project is released under the MIT License. See `LICENSE`.
