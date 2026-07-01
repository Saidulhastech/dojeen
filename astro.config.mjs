import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// SSR so the Shopify Storefront private token stays on the server
// and the server cart (httpOnly cookie + /api/cart/*) works.
export default defineConfig({
  site: 'https://dojeen.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
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
