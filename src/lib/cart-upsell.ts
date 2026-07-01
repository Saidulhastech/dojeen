// ============================================================
//  Cart upsell ("You may also like") — shared rail for the cart
//  drawer (mini cart) and the cart page. Fetches recommendations
//  for the first cart line's product via /api/recommendations,
//  hides items already in the cart, and renders quick-add cards.
//  Both surfaces call renderUpsell() from their cart:updated handler.
// ============================================================
import { addItem } from '@/lib/cart';
import { formatMoney } from '@/lib/money';
import type { Cart } from '@/lib/shopify/types';

interface UpsellProduct {
  slug: string;
  name: string;
  price: number;
  currencyCode: string;
  image: string;
  variantId: string;
  inStock: boolean;
  isOnSale: boolean;
  comparePrice: number | null;
}

export interface UpsellOptions {
  /** Max cards to render. */
  limit?: number;
  /** Section heading. */
  heading?: string;
  /** Recommendation intent (falls back to RELATED server-side). */
  intent?: 'COMPLEMENTARY' | 'RELATED';
}

const esc = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

// Cache the fetched recommendations keyed by source product so unrelated cart
// re-renders (qty change, free-ship recompute) don't trigger extra round-trips.
let cacheKey = '';
let cacheItems: UpsellProduct[] = [];
let inflight: Promise<void> | null = null;

async function loadFor(sourceId: string, intent: string, limit: number): Promise<void> {
  if (sourceId === cacheKey) return;
  if (inflight) await inflight; // coalesce concurrent renders
  if (sourceId === cacheKey) return;
  cacheKey = sourceId;
  inflight = (async () => {
    try {
      const res = await fetch(
        `/api/recommendations?productId=${encodeURIComponent(sourceId)}&intent=${intent}&limit=${limit}`,
        { headers: { accept: 'application/json' } },
      );
      const data = await res.json();
      cacheItems = Array.isArray(data?.products) ? (data.products as UpsellProduct[]) : [];
    } catch {
      cacheItems = [];
    }
  })();
  await inflight;
  inflight = null;
}

export async function renderUpsell(
  container: HTMLElement | null,
  cart: Cart | null,
  opts: UpsellOptions = {},
): Promise<void> {
  if (!container) return;
  const limit = opts.limit ?? 3;
  const heading = opts.heading ?? 'You may also like';
  const intent = opts.intent ?? 'COMPLEMENTARY';

  const lines = cart?.lines ?? [];
  if (!cart || lines.length === 0) {
    container.hidden = true;
    container.innerHTML = '';
    cacheKey = '';
    cacheItems = [];
    return;
  }

  const sourceId = lines[0].merchandise.product?.id || '';
  if (!sourceId) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  // Over-fetch a little so we still have cards after filtering out cart items.
  await loadFor(sourceId, intent, Math.max(limit + 4, 8));

  const inCart = new Set(lines.map((l) => l.merchandise.product?.handle).filter(Boolean));
  const items = cacheItems
    .filter((p) => p.variantId && p.inStock && !inCart.has(p.slug))
    .slice(0, limit);

  if (!items.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML =
    '<div class="upsell-heading">' +
    esc(heading) +
    '</div>' +
    '<div class="upsell-list">' +
    items
      .map((p) => {
        const href = '/products/' + esc(p.slug);
        const price = formatMoney(p.price, p.currencyCode);
        const compare =
          p.isOnSale && p.comparePrice != null
            ? '<span class="upsell-compare">' + formatMoney(p.comparePrice, p.currencyCode) + '</span>'
            : '';
        return (
          '<article class="upsell-card">' +
          '<a class="upsell-thumb-link" href="' +
          href +
          '" aria-label="' +
          esc(p.name) +
          '">' +
          '<img class="upsell-thumb" src="' +
          esc(p.image) +
          '" alt="' +
          esc(p.name) +
          '" loading="lazy" />' +
          '</a>' +
          '<div class="upsell-body">' +
          '<a class="upsell-name" href="' +
          href +
          '">' +
          esc(p.name) +
          '</a>' +
          '<div class="upsell-price">' +
          price +
          compare +
          '</div>' +
          '</div>' +
          '<button type="button" class="upsell-add" data-variant="' +
          esc(p.variantId) +
          '" aria-label="Add ' +
          esc(p.name) +
          ' to cart">Add</button>' +
          '</article>'
        );
      })
      .join('') +
    '</div>';

  container.querySelectorAll<HTMLButtonElement>('.upsell-add').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const variantId = btn.getAttribute('data-variant') || '';
      if (!variantId) return;
      btn.disabled = true;
      btn.textContent = 'Adding…';
      const { cart: updated } = await addItem(variantId, 1, { open: false });
      if (!updated) {
        // Add failed — restore the button (success re-renders the rail via cart:updated).
        btn.disabled = false;
        btn.textContent = 'Add';
      }
    });
  });
}
