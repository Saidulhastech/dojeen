// ============================================================
//  Free-shipping progress — single source of truth for the cart
//  drawer (mini cart) and the cart page bar.
//  Threshold is expressed in the store's major currency units
//  (the store runs in BDT). Change FREE_SHIPPING_THRESHOLD to
//  match your shop's actual free-shipping rule.
// ============================================================
export const FREE_SHIPPING_THRESHOLD = 1000;

export interface FreeShipProgress {
  /** Subtotal has reached the threshold. */
  qualified: boolean;
  /** Amount still needed to qualify (0 once qualified). */
  remaining: number;
  /** Progress toward the threshold, clamped 0–100. */
  pct: number;
}

export function freeShipProgress(subtotal: number): FreeShipProgress {
  const threshold = FREE_SHIPPING_THRESHOLD;
  if (!(threshold > 0)) return { qualified: true, remaining: 0, pct: 100 };
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.max(0, (subtotal / threshold) * 100));
  return { qualified: remaining <= 0, remaining, pct };
}
