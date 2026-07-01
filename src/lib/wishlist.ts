// ============================================================
//  Wishlist — client-side, localStorage-backed favourites.
//  Non-sensitive UI state (the Customer Account API is out of
//  scope), mirroring the recently-viewed pattern. Broadcasts a
//  `wishlist:updated` CustomEvent so the header badge and every
//  heart button on the page stay in sync, and listens to the
//  native `storage` event for cross-tab sync.
// ============================================================
import { formatMoney } from '@/lib/money';

export interface WishItem {
  slug: string;
  name: string;
  price: number;
  currencyCode?: string;
  isOnSale?: boolean;
  comparePrice?: number | null;
  discount?: number;
  thumbnail: string;
  thumbnailHover?: string;
  variantId?: string;
  inStock?: boolean;
}

const KEY = 'dojeen_wishlist';

function read(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((p) => p && p.slug) : [];
  } catch {
    return [];
  }
}

function write(list: WishItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota — wishlist is non-critical, fail silently */
  }
  broadcast(list);
}

function broadcast(list: WishItem[]): void {
  try {
    window.dispatchEvent(
      new CustomEvent('wishlist:updated', {
        detail: { count: list.length, slugs: list.map((p) => p.slug) },
      }),
    );
  } catch {
    /* SSR / no window */
  }
}

export function getWishlist(): WishItem[] {
  return read();
}
export function wishlistCount(): number {
  return read().length;
}
export function isWished(slug: string): boolean {
  return read().some((p) => p.slug === slug);
}

/** Toggle an item; returns the new state (true = now wished). */
export function toggleWishlist(item: WishItem): boolean {
  if (!item || !item.slug) return false;
  const list = read();
  const idx = list.findIndex((p) => p.slug === item.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(list);
    return false;
  }
  list.unshift(item);
  write(list);
  return true;
}

export function removeFromWishlist(slug: string): void {
  write(read().filter((p) => p.slug !== slug));
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Heart icon — fill/stroke is toggled by CSS via the `.is-wished` class. */
export const HEART_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

/** Heart toggle button markup for JS-built cards (the .astro card mirrors this). */
export function heartButtonHtml(item: WishItem): string {
  return `<button class="wishlist-heart-btn" type="button" data-slug="${esc(item.slug)}" data-wishlist="${esc(JSON.stringify(item))}" aria-label="Add to wishlist" aria-pressed="false">${HEART_SVG}</button>`;
}

function priceHtml(item: WishItem): string {
  return item.isOnSale
    ? `<div class="product-card-sale-price">${esc(formatMoney(item.price, item.currencyCode))}</div>` +
        `<div class="product-carrd-compare-price">${esc(formatMoney(item.comparePrice ?? item.price, item.currencyCode))}</div>`
    : `<div class="product-card-discount-price">${esc(formatMoney(item.price, item.currencyCode))}</div>`;
}

function cardHtml(item: WishItem): string {
  const href = `/products/${encodeURIComponent(item.slug)}`;
  const name = esc(item.name);
  const thumb = esc(item.thumbnail);
  const hover = esc(item.thumbnailHover || item.thumbnail);
  const badges = [
    item.isOnSale ? '<div class="sale-badge">Sale</div>' : '',
    (item.discount ?? 0) > 0 ? `<div class="discount-badge">-${item.discount}%</div>` : '',
  ].join('');
  const atc = item.variantId
    ? `<button class="wishlist-atc" type="button" data-variant-id="${esc(item.variantId)}"${item.inStock === false ? ' disabled' : ''}>${item.inStock === false ? 'Sold Out' : 'Add to Cart'}</button>`
    : '';
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
        ${heartButtonHtml(item)}
      </div>
      <div class="product-card-info-block">
        <a href="${href}" class="product-link-block w-inline-block">
          <h3 class="product-name">${name}</h3>
        </a>
        <div class="product-card-pricing-block">${priceHtml(item)}</div>
        ${atc}
      </div>
    </div>`;
}

interface RenderOpts {
  grid: HTMLElement | null;
  empty: HTMLElement | null;
}

/** Render the wishlist into `grid`, toggling the empty-state element. */
export function renderWishlist({ grid, empty }: RenderOpts): void {
  if (!grid) return;
  const items = read();
  grid.innerHTML = items.map(cardHtml).join('');
  grid.hidden = items.length === 0;
  if (empty) empty.hidden = items.length !== 0;
}

/** Re-sync every heart button + the header badge to the stored state. */
export function syncWishlistUI(): void {
  const wished = new Set(read().map((p) => p.slug));
  document.querySelectorAll<HTMLElement>('.wishlist-heart-btn').forEach((btn) => {
    const slug = btn.getAttribute('data-slug') || '';
    const on = wished.has(slug);
    btn.classList.toggle('is-wished', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    const label = btn.querySelector('.wishlist-label');
    if (label) label.textContent = on ? 'In Wishlist' : 'Add to Wishlist';
  });
  const badge = document.getElementById('headerWishlistCount');
  if (badge) {
    badge.textContent = String(wished.size);
    (badge as HTMLElement).hidden = wished.size === 0;
  }
}

let wired = false;
/** One-time global init: delegated heart toggling + badge/state sync. */
export function initWishlistUI(): void {
  if (wired) return;
  wired = true;

  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.wishlist-heart-btn');
    if (!btn) return;
    e.preventDefault();
    let item: WishItem | null = null;
    try {
      item = JSON.parse(btn.getAttribute('data-wishlist') || 'null');
    } catch {
      item = null;
    }
    if (item && item.slug) toggleWishlist(item);
  });

  window.addEventListener('wishlist:updated', syncWishlistUI);
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) syncWishlistUI();
  });
  // Let other scripts (AJAX grid swaps) re-sync freshly-inserted hearts.
  (window as any).__dojeenSyncWishlist = syncWishlistUI;

  syncWishlistUI();
}
