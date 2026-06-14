import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dojeen.com',
  output: 'static',
  integrations: [sitemap()],
  compressHTML: true,
  build: { format: 'directory' },
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: true, minify: true },
  },
});
