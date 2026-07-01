// ============================================================
//  Sort options surfaced in the storefront UI
// ============================================================
import type { SortOption } from './types';

/** Sort choices for the collection PLP (ProductCollectionSortKeys). */
export const COLLECTION_SORT_OPTIONS: SortOption[] = [
  { label: 'Featured', value: 'featured', sortKey: 'COLLECTION_DEFAULT', reverse: false },
  { label: 'Best selling', value: 'best-selling', sortKey: 'BEST_SELLING', reverse: false },
  { label: 'Price: low to high', value: 'price-asc', sortKey: 'PRICE', reverse: false },
  { label: 'Price: high to low', value: 'price-desc', sortKey: 'PRICE', reverse: true },
  { label: 'Newest', value: 'newest', sortKey: 'CREATED', reverse: true },
  { label: 'Alphabetical', value: 'title-asc', sortKey: 'TITLE', reverse: false },
];

/** Sort choices for the all-products / search listing (ProductSortKeys). */
export const PRODUCT_SORT_OPTIONS: SortOption[] = [
  { label: 'Best selling', value: 'best-selling', sortKey: 'BEST_SELLING', reverse: false },
  { label: 'Price: low to high', value: 'price-asc', sortKey: 'PRICE', reverse: false },
  { label: 'Price: high to low', value: 'price-desc', sortKey: 'PRICE', reverse: true },
  { label: 'Newest', value: 'newest', sortKey: 'CREATED_AT', reverse: true },
  { label: 'Alphabetical', value: 'title-asc', sortKey: 'TITLE', reverse: false },
];

/** Sort choices for the search page (SearchSortKeys — only RELEVANCE + PRICE). */
export const SEARCH_SORT_OPTIONS: SortOption[] = [
  { label: 'Most relevant', value: 'relevance', sortKey: 'RELEVANCE', reverse: false },
  { label: 'Price: low to high', value: 'price-asc', sortKey: 'PRICE', reverse: false },
  { label: 'Price: high to low', value: 'price-desc', sortKey: 'PRICE', reverse: true },
];

/** Resolve a UI sort `value` into its Shopify sortKey + reverse pair. */
export function resolveSort(options: SortOption[], value?: string | null): SortOption {
  return options.find((o) => o.value === value) ?? options[0];
}

/**
 * Unified sort for the faceted /shop page, which switches data source between a
 * collection (ProductCollectionSortKeys) and search (SearchSortKeys). Each option
 * carries the right key for both. Search only supports RELEVANCE + PRICE, so the
 * non-price options fall back to RELEVANCE in search mode.
 */
export interface ShopSortOption {
  label: string;
  value: string;
  collection: { sortKey: string; reverse: boolean };
  search: { sortKey: string; reverse: boolean };
}

export const SHOP_SORT_OPTIONS: ShopSortOption[] = [
  { label: 'Featured', value: 'featured', collection: { sortKey: 'COLLECTION_DEFAULT', reverse: false }, search: { sortKey: 'RELEVANCE', reverse: false } },
  { label: 'Best Selling', value: 'best', collection: { sortKey: 'BEST_SELLING', reverse: false }, search: { sortKey: 'RELEVANCE', reverse: false } },
  { label: 'Price, Low to High', value: 'price-asc', collection: { sortKey: 'PRICE', reverse: false }, search: { sortKey: 'PRICE', reverse: false } },
  { label: 'Price, High to Low', value: 'price-desc', collection: { sortKey: 'PRICE', reverse: true }, search: { sortKey: 'PRICE', reverse: true } },
  { label: 'Newest', value: 'newest', collection: { sortKey: 'CREATED', reverse: true }, search: { sortKey: 'RELEVANCE', reverse: false } },
  { label: 'Alphabetical', value: 'title-asc', collection: { sortKey: 'TITLE', reverse: false }, search: { sortKey: 'RELEVANCE', reverse: false } },
];

export function resolveShopSort(value?: string | null): ShopSortOption {
  return SHOP_SORT_OPTIONS.find((o) => o.value === value) ?? SHOP_SORT_OPTIONS[0];
}
