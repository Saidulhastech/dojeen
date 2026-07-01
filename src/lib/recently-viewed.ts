// ============================================================
//  Recently Viewed — client-side, localStorage-backed product
//  history for the PDP. Stores a compact snapshot per product
//  (no sensitive data) so the section renders without a server
//  round-trip. Cards mirror ProductCard.astro's markup so they
//  inherit the same Webflow styling + hover image-swap.
// ============================================================
import { formatMoney } from '@/lib/money';

export interface RecentProduct {
  slug: string;
  name: string;
  price: number;
  currencyCode?: string;
  isOnSale?: boolean;
  comparePrice?: number | null;
  discount?: number;
  thumbnail: string;
  thumbnailHover?: string;
}

const KEY = 'dojeen_recently_viewed';
const MAX_STORED = 12;

function read(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((p) => p && p.slug) : [];
  } catch {
    return [];
  }
}

function write(list: RecentProduct[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_STORED)));
  } catch {
    /* private mode / quota — recently-viewed is non-critical, fail silently */
  }
}

/** Push (or move) a product to the front of the history. */
export function recordRecent(p: RecentProduct): void {
  if (!p || !p.slug) return;
  const list = read().filter((x) => x.slug !== p.slug);
  list.unshift(p);
  write(list);
}

/** History minus an optional slug, newest first. */
export function getRecent(excludeSlug?: string): RecentProduct[] {
  const list = read();
  return excludeSlug ? list.filter((p) => p.slug !== excludeSlug) : list;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardHtml(p: RecentProduct): string {
  const href = `/products/${encodeURIComponent(p.slug)}`;
  const name = esc(p.name);
  const thumb = esc(p.thumbnail);
  const hover = esc(p.thumbnailHover || p.thumbnail);

  const badges = [
    p.isOnSale ? '<div class="sale-badge">Sale</div>' : '',
    (p.discount ?? 0) > 0 ? `<div class="discount-badge">-${p.discount}%</div>` : '',
  ].join('');

  const pricing = p.isOnSale
    ? `<div class="product-card-sale-price">${esc(formatMoney(p.price, p.currencyCode))}</div>` +
      `<div class="product-carrd-compare-price">${esc(formatMoney(p.comparePrice ?? p.price, p.currencyCode))}</div>`
    : `<div class="product-card-discount-price">${esc(formatMoney(p.price, p.currencyCode))}</div>`;

  return `
    <div class="product-card-block">
      <div class="product-tab-wrapper">
        <div class="prouct-card-tab w-tabs">
          <div class="product-tab-content w-tab-content">
            <div class="product-tab-pane w-tab-pane w--tab-active" data-tab="1">
              <a href="${href}" class="product-thumbnail-block w-inline-block">
                <img loading="lazy" src="${thumb}" alt="${name}" class="product-main-thumbnail" />
                <img loading="lazy" src="${hover}" alt="${name}" class="product-secondary-thumbnail" />
              </a>
            </div>
          </div>
        </div>
        <div class="product-badge-wrapper">${badges}</div>
      </div>
      <div class="product-card-info-block">
        <a href="${href}" class="product-link-block w-inline-block">
          <h3 class="product-name">${name}</h3>
        </a>
        <div class="product-card-pricing-block">${pricing}</div>
      </div>
    </div>`;
}

interface RenderOpts {
  section: HTMLElement;
  mount: HTMLElement | null;
  excludeSlug?: string;
  limit?: number;
}

/** Render the history into `mount` and reveal `section` if anything remains. */
export function renderRecentlyViewed({ section, mount, excludeSlug, limit = 4 }: RenderOpts): void {
  if (!mount) return;
  const items = getRecent(excludeSlug).slice(0, limit);
  if (!items.length) return;
  mount.innerHTML = items.map(cardHtml).join('');
  section.hidden = false;
}
