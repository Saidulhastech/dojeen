// Resolve an image reference for use in <img src>.
// Absolute URLs (Shopify CDN, protocol-relative) pass through unchanged;
// bare filenames are served from the local /images/ folder. This lets the
// same templates work with both Shopify data and legacy local assets.
export function img(src?: string | null): string {
  if (!src) return '';
  return /^(https?:)?\/\//.test(src) ? src : `/images/${src}`;
}

/** A Shopify CDN image URL — resizable via the `width` query param. */
function isShopifyImage(url: string): boolean {
  return /cdn\.shopify\.com|\/cdn\/shop\//.test(url);
}

/**
 * Resolve an image and, for Shopify CDN URLs, request a specific render width.
 * Shopify resizes server-side and auto-negotiates WebP/AVIF, so cards/thumbs
 * stop downloading full-resolution originals. Local/relative URLs are returned
 * unchanged (Webflow already ships responsive variants for those).
 */
export function sizedImg(src: string | null | undefined, width: number): string {
  const url = img(src);
  if (!url || !isShopifyImage(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${Math.round(width)}`;
}

/**
 * Build a responsive `srcset` for a Shopify CDN image at the given widths.
 * Returns '' for non-Shopify URLs so callers can fall back to plain `src`
 * (use `srcSet(...) || undefined` to omit the attribute entirely).
 */
export function srcSet(src: string | null | undefined, widths: number[]): string {
  const url = img(src);
  if (!url || !isShopifyImage(url)) return '';
  return widths.map((w) => `${sizedImg(url, w)} ${w}w`).join(', ');
}
