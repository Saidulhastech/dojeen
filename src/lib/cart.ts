// ============================================================
//  Client cart controller — talks to same-origin /api/cart/*
//  (server-side Shopify Cart API with the private token). The
//  Shopify cart id lives in an httpOnly cookie, never in JS.
//
//  Single source of truth for every cart UI on the page (header
//  badge, drawer, cart page, PDP, bundle button). State changes
//  are broadcast via the `cart:updated` CustomEvent so each
//  surface re-renders from event.detail.cart.
// ============================================================
import type { Cart, CartLine } from '@/lib/shopify/types';

export type { Cart, CartLine };

declare global {
  interface Window {
    __dojeenOpenCart?: () => void;
  }
}

let currentCart: Cart | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

interface CartResponse {
  cart: Cart | null;
  userErrors?: { message: string }[];
  error?: string;
}

function emit(): void {
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: currentCart } }));
}

/** The cart as last known to the client (no network). */
export function getCurrentCart(): Cart | null {
  return currentCart;
}

/** Total item quantity for the header badge. */
export function getCartCount(): number {
  return currentCart?.totalQuantity ?? 0;
}

async function request(url: string, body?: unknown): Promise<CartResponse> {
  const init: RequestInit =
    body === undefined
      ? { headers: { accept: 'application/json' } }
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        };
  const res = await fetch(url, init);
  return (await res.json()) as CartResponse;
}

function apply(data: CartResponse): CartResponse {
  if (!data.error) currentCart = data.cart ?? null;
  emit();
  return data;
}

/**
 * Hydrate the cart once. Idempotent: the first call fetches; later
 * calls just re-emit the current state so late-mounting listeners
 * (drawer, cart page) get the data they missed.
 */
export function initCart(): Promise<void> {
  if (initialized) {
    emit();
    return Promise.resolve();
  }
  initialized = true;
  initPromise = (async () => {
    try {
      const data = await request('/api/cart');
      currentCart = data.cart ?? null;
    } catch {
      currentCart = null;
    }
    emit();
  })();
  return initPromise;
}

/** Add a variant to the cart; opens the drawer on success by default. */
export async function addItem(
  merchandiseId: string,
  quantity = 1,
  options: { open?: boolean } = {},
): Promise<CartResponse> {
  const { open = true } = options;
  const data = apply(await request('/api/cart/add', { merchandiseId, quantity }));
  if (open && data.cart && typeof window.__dojeenOpenCart === 'function') {
    window.__dojeenOpenCart();
  }
  return data;
}

/** Set a line's quantity (0 removes it). */
export async function updateLine(lineId: string, quantity: number): Promise<CartResponse> {
  return apply(await request('/api/cart/update', { lineId, quantity }));
}

/** Remove a line entirely. */
export async function removeLine(lineId: string): Promise<CartResponse> {
  return apply(await request('/api/cart/remove', { lineId }));
}

/** Redirect to Shopify's hosted checkout for the current cart. */
export function goToCheckout(): void {
  const url = currentCart?.checkoutUrl;
  if (url) window.location.href = url;
}
