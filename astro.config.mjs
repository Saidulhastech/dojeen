import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// SSR on Cloudflare Workers so the Shopify Storefront private token stays
// on the server and the server cart (httpOnly cookie + /api/cart/*) works.
export default defineConfig({
  site: 'https://dojeen.com',
  output: 'server',
  // This app authenticates via httpOnly cookies and never uses Astro sessions.
  // The Cloudflare adapter otherwise defaults sessions to a KV-backed driver,
  // which would force a SESSION KV namespace binding at deploy time. Point it at
  // an in-memory driver instead so no KV namespace is required. (It stays
  // dormant — nothing reads/writes Astro.session.)
  session: { driver: 'memory' },
  adapter: cloudflare({
    // No runtime Sharp on Workers — leave remote (Shopify CDN) images untouched.
    imageService: 'passthrough',
  }),
  integrations: [sitemap()],
  compressHTML: true,
  build: { format: 'directory' },
  // Shopify CDN images are served from cdn.shopify.com.
  image: { domains: ['cdn.shopify.com'] },
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: true, minify: true },
    // Allow tunneling the dev server through ngrok (e.g. to test the OAuth
    // callback over HTTPS). A leading dot matches any subdomain, so the
    // rotating free ngrok URL works without editing this each run.
    server: { allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.ngrok.app'] },
  },
});
