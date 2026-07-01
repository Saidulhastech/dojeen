// ============================================================
//  Catalog — Shopify-backed replacements for the legacy
//  src/data/products.ts helpers. All async (SSR data fetching).
//  Templates consume Dojeen's Product/Category shapes; the adapter
//  bridges from Shopify.
// ============================================================
import {
  getProducts,
  getProduct,
  getCollection,
  getAllCollections,
  getProductRecommendations,
  searchProducts,
} from '@/lib/shopify';
import type { CollectionFilter, CollectionWithProducts, PageInfo } from '@/lib/shopify/types';
import { adaptCard, adaptProduct, adaptCategory } from '@/lib/shopify/adapter';
import { cached } from '@/lib/cache';
import type { Product, Category } from '@/types';

/** A page of products plus the facets/pagination that produced it. */
export interface FacetedProducts {
  items: Product[];
  filters: CollectionFilter[];
  pageInfo: PageInfo;
  totalCount: number;
}

/** All products (best-selling order), capped at `limit`. */
export async function getAllProducts(limit = 24): Promise<Product[]> {
  return cached(`all:${limit}`, async () => {
    const { items } = await getProducts({ pageSize: limit, sortKey: 'BEST_SELLING' });
    return items.map(adaptCard);
  });
}

/** Best sellers — native BEST_SELLING sort. */
export async function getBestSellers(limit = 8): Promise<Product[]> {
  return cached(`best:${limit}`, async () => {
    const { items } = await getProducts({ pageSize: limit, sortKey: 'BEST_SELLING' });
    return items.map(adaptCard);
  });
}

/**
 * Featured products. The Storefront API has no native "featured" flag, so we
 * surface best sellers. Swap to a dedicated "featured" collection if desired.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getBestSellers(limit);
}

/** Newest products — CREATED_AT desc. */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return cached(`new:${limit}`, async () => {
    const { items } = await getProducts({ pageSize: limit, sortKey: 'CREATED_AT', reverse: true });
    return items.map(adaptCard);
  });
}

/**
 * On-sale products. Shopify can't filter by "on sale" server-side, so we pull
 * a window and keep those whose compare-at price exceeds the current price.
 */
export async function getSaleProducts(limit = 12): Promise<Product[]> {
  return cached(`sale:${limit}`, async () => {
    const { items } = await getProducts({ pageSize: 100, sortKey: 'BEST_SELLING' });
    return items.map(adaptCard).filter((p) => p.isOnSale).slice(0, limit);
  });
}

/** Full product detail by handle (PDP). Null if not found. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return cached(`product:${slug}`, async () => {
    const p = await getProduct(slug);
    return p ? adaptProduct(p) : null;
  });
}

export interface CategoryCollectionOpts {
  limit?: number;
  sortKey?: string;
  reverse?: boolean;
  /** Shopify ProductFilter inputs (availability, price, variantOption, …). */
  filters?: unknown[];
  after?: string | null;
  before?: string | null;
}

/**
 * The raw Shopify collection (+ one page of its products, sorted/filtered) by
 * handle. Null if not found. The cache key includes sort/filter/cursor so
 * different facet selections don't collide.
 */
export async function getCategoryCollection(
  handle: string,
  opts: CategoryCollectionOpts = {},
): Promise<CollectionWithProducts | null> {
  const {
    limit = 24,
    sortKey = 'COLLECTION_DEFAULT',
    reverse = false,
    filters,
    after = null,
    before = null,
  } = opts;
  const key = `collection:${handle}:${limit}:${sortKey}:${reverse}:${after ?? ''}:${before ?? ''}:${JSON.stringify(filters ?? null)}`;
  return cached(key, () =>
    getCollection({
      handle,
      pageSize: limit,
      sortKey,
      reverse,
      filters: filters as unknown[] | undefined,
      after,
      before,
    }),
  );
}

export interface FacetedQueryOpts {
  limit?: number;
  sortKey?: string;
  reverse?: boolean;
  filters?: unknown[];
  after?: string | null;
  before?: string | null;
}

/**
 * All products with Shopify facets (Availability, Price, Color, Size, …) for the
 * faceted /shop page. Backed by the storefront `search` query with an empty
 * query string — the only all-catalog source that also returns `productFilters`.
 * Search sort keys are limited to RELEVANCE + PRICE.
 */
export async function getShopProducts(opts: FacetedQueryOpts = {}): Promise<FacetedProducts> {
  const { limit = 24, sortKey = 'RELEVANCE', reverse = false, filters, after = null, before = null } = opts;
  const key = `shop:${limit}:${sortKey}:${reverse}:${after ?? ''}:${before ?? ''}:${JSON.stringify(filters ?? null)}`;
  return cached(key, async () => {
    const res = await searchProducts({
      query: '',
      pageSize: limit,
      sortKey,
      reverse,
      filters: filters?.length ? filters : undefined,
      after,
      before,
    });
    return {
      items: res.items.map(adaptCard),
      filters: res.filters,
      pageInfo: res.pageInfo,
      totalCount: res.totalCount,
    };
  });
}

/** One collection's products with its facets — same shape as getShopProducts. */
export async function getCategoryFaceted(
  handle: string,
  opts: FacetedQueryOpts = {},
): Promise<FacetedProducts | null> {
  const col = await getCategoryCollection(handle, {
    limit: opts.limit,
    sortKey: opts.sortKey,
    reverse: opts.reverse,
    filters: opts.filters,
    after: opts.after,
    before: opts.before,
  });
  if (!col) return null;
  return {
    items: col.products.items.map(adaptCard),
    filters: col.filters ?? [],
    pageInfo: col.products.pageInfo,
    totalCount: col.products.items.length,
  };
}

/** Products in a collection (category page). */
export async function getProductsByCategory(handle: string, limit = 24): Promise<Product[]> {
  return cached(`catProducts:${handle}:${limit}`, async () => {
    const col = await getCollection({ handle, pageSize: limit });
    return col ? col.products.items.map(adaptCard) : [];
  });
}

/** Every collection mapped to Dojeen's Category shape (nav / category list). */
export async function getCategories(): Promise<Category[]> {
  return cached('categories', async () => {
    const cols = await getAllCollections(20);
    return cols.map((c, i) => adaptCategory(c, i));
  });
}

/** Related products (similar items) for a PDP via Shopify recommendations. */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  return cached(`recs:${productId}:${limit}`, async () => {
    const recs = await getProductRecommendations(productId, limit, 'RELATED');
    return recs.map(adaptCard);
  });
}

/** "Complete the Look" — complementary cross-sell products for a PDP. */
export async function getComplementaryProducts(productId: string, limit = 4): Promise<Product[]> {
  return cached(`recs-comp:${productId}:${limit}`, async () => {
    const recs = await getProductRecommendations(productId, limit, 'COMPLEMENTARY');
    return recs.map(adaptCard);
  });
}
