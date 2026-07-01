// ============================================================
//  Build human-readable "active filter" chips for the faceted PLP.
//  Each chip shows the selected facet value (e.g. "Color: Black") and a
//  remove URL that drops just that one selection (keeping the others).
//  Shared by /shop and /shop/category/[category].
// ============================================================
import { formatMoney } from '@/lib/money';
import type { CollectionFilter } from '@/lib/shopify/types';

export interface FacetChip {
  label: string;
  removeUrl: string;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Resolve a ProductFilter input JSON string to a "Facet: Value" label. */
function labelFor(raw: string, facets: CollectionFilter[]): string {
  for (const f of facets) {
    for (const v of f.values) {
      if (v.input === raw) return `${f.label}: ${v.label}`;
    }
  }
  // Fallback: derive a label from the raw ProductFilter shape.
  try {
    const o = JSON.parse(raw);
    if (o.available !== undefined) return `Availability: ${o.available ? 'In stock' : 'Out of stock'}`;
    if (o.variantOption) return `${capitalize(o.variantOption.name)}: ${o.variantOption.value}`;
    if (o.productVendor) return `Brand: ${o.productVendor}`;
    if (o.productType) return `Type: ${o.productType}`;
    if (o.tag) return `Tag: ${o.tag}`;
    if (o.productMetafield?.value) return String(o.productMetafield.value);
  } catch {
    /* not JSON — fall through */
  }
  return 'Filter';
}

export interface ChipOpts {
  facets: CollectionFilter[];
  selectedFilterInputs: string[];
  priceMin: string | null;
  priceMax: string | null;
  currencyCode?: string;
  pathname: string;
  /** Astro.url.search — the current query string (with leading '?'). */
  search: string;
}

export function buildFacetChips(opts: ChipOpts): FacetChip[] {
  const { facets, selectedFilterInputs, priceMin, priceMax, currencyCode, pathname, search } = opts;
  const chips: FacetChip[] = [];

  const urlWithout = (mutate: (sp: URLSearchParams) => void): string => {
    const sp = new URLSearchParams(search);
    sp.delete('after');
    sp.delete('before');
    mutate(sp);
    const qs = sp.toString();
    return pathname + (qs ? `?${qs}` : '');
  };

  for (const raw of selectedFilterInputs) {
    chips.push({
      label: labelFor(raw, facets),
      removeUrl: urlWithout((sp) => {
        const keep = selectedFilterInputs.filter((x) => x !== raw);
        sp.delete('filter');
        for (const k of keep) sp.append('filter', k);
      }),
    });
  }

  if (priceMin || priceMax) {
    const fmt = (n: string) => (currencyCode ? formatMoney(Number(n), currencyCode) : n);
    let label: string;
    if (priceMin && priceMax) label = `Price: ${fmt(priceMin)} – ${fmt(priceMax)}`;
    else if (priceMin) label = `Price: from ${fmt(priceMin)}`;
    else label = `Price: up to ${fmt(priceMax as string)}`;
    chips.push({
      label,
      removeUrl: urlWithout((sp) => {
        sp.delete('price_min');
        sp.delete('price_max');
      }),
    });
  }

  return chips;
}
