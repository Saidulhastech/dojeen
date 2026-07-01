// ============================================================
//  Adapter — map Shopify domain shapes onto Dojeen's existing
//  Product / Category interfaces so the legacy Webflow templates
//  render live data without markup changes.
// ============================================================
import type { Product as DojeenProduct, Category as DojeenCategory } from '@/types';
import type {
  Product as ShopifyProduct,
  ProductCard as ShopifyCard,
  ProductCardVariant,
  Collection as ShopifyCollection,
} from './types';

/** Parse a Shopify money string ("70.0") into a number; 0 on failure. */
function num(s?: string | null): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** Lowercase kebab slug, matching Dojeen's category slug convention. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const SIZE_NAMES = ['size', 'sizes'];
const COLOR_NAMES = ['color', 'colour', 'colors', 'colours'];
// Shopify's placeholder option for products with no real variants.
const DEFAULT_OPTION = 'default title';

/** Pull values from a product option whose name matches the given aliases. */
function optionValues(options: ShopifyProduct['options'], names: string[]): string[] {
  const want = names.map((n) => n.toLowerCase());
  const opt = options?.find((o) => want.includes(o.name.toLowerCase()));
  if (!opt) return [];
  return opt.optionValues
    .map((v) => v.name)
    .filter((v) => v.toLowerCase() !== DEFAULT_OPTION);
}

/**
 * Build a color-value → image-URL map from a list of variants.
 * Only the first variant image per unique color value is kept.
 */
function colorImageRecord(
  variants: Array<{ selectedOptions: Array<{ name: string; value: string }>; image?: { url: string } | null }>,
): Record<string, string> {
  const want = COLOR_NAMES;
  const map: Record<string, string> = {};
  for (const v of variants) {
    const opt = v.selectedOptions.find((o) => want.includes(o.name.toLowerCase()));
    if (opt && v.image?.url && !map[opt.value]) {
      map[opt.value] = v.image.url;
    }
  }
  return map;
}

function saleFields(price: number, compare: number) {
  const isOnSale = compare > price && compare > 0;
  return {
    isOnSale,
    comparePrice: isOnSale ? compare : undefined,
    discount: isOnSale ? Math.round(((compare - price) / compare) * 100) : undefined,
  };
}

/** Lightweight card (grids, sliders) → Dojeen Product. */
export function adaptCard(c: ShopifyCard): DojeenProduct {
  const price = num(c.priceRange?.minVariantPrice?.amount);
  const compare = num(c.compareAtPriceRange?.minVariantPrice?.amount);
  const thumb = c.featuredImage?.url ?? '';
  const colors = optionValues(c.options ?? [], COLOR_NAMES);
  const imgMap = colorImageRecord(
    (c.cardVariants ?? []) as ProductCardVariant[],
  );
  return {
    slug: c.handle,
    name: c.title,
    price,
    ...saleFields(price, compare),
    category: c.vendor ?? '',
    categorySlug: '',
    thumbnail: thumb,
    thumbnailHover: thumb,
    images: thumb ? [thumb] : [],
    rating: 5,
    reviewCount: 0,
    description: '',
    sizes: [],
    colors,
    colorImages: colors.map((name) => imgMap[name] ?? thumb),
    sku: '',
    inStock: c.availableForSale,
    currencyCode: c.priceRange?.minVariantPrice?.currencyCode,
    shopifyId: c.id,
    variantId: c.variantId,
  };
}

/** Full product (PDP) → Dojeen Product, including variant + category. */
export function adaptProduct(p: ShopifyProduct): DojeenProduct {
  const price = num(p.priceRange?.minVariantPrice?.amount);
  const compare = num(p.compareAtPriceRange?.minVariantPrice?.amount);
  const images = (p.images ?? []).map((i) => i.url).filter(Boolean);
  const thumb = p.featuredImage?.url ?? images[0] ?? '';
  const hover = images.find((u) => u !== thumb) ?? thumb;
  const collection = p.collections?.[0];
  const category = collection?.title ?? p.productType ?? '';
  const defaultVariant = p.variants?.find((v) => v.availableForSale) ?? p.variants?.[0];
  const colors = optionValues(p.options, COLOR_NAMES);
  const imgMap = colorImageRecord(p.variants ?? []);
  return {
    slug: p.handle,
    name: p.title,
    price,
    ...saleFields(price, compare),
    category,
    categorySlug: collection?.handle ?? (category ? slugify(category) : ''),
    thumbnail: thumb,
    thumbnailHover: hover,
    images,
    rating: 5,
    reviewCount: 0,
    description: p.description ?? '',
    descriptionHtml: p.descriptionHtml ?? '',
    sizes: optionValues(p.options, SIZE_NAMES),
    colors,
    colorImages: colors.map((name) => imgMap[name] ?? thumb),
    sku: '',
    inStock: p.availableForSale,
    currencyCode: p.priceRange?.minVariantPrice?.currencyCode,
    shopifyId: p.id,
    variantId: defaultVariant?.id,
    variantMatrix: (p.variants ?? []).map((v) => ({
      id: v.id,
      available: v.availableForSale,
      quantity: v.quantityAvailable ?? null,
      options: Object.fromEntries(
        (v.selectedOptions ?? []).map((o) => [o.name.toLowerCase(), o.value]),
      ),
    })),
  };
}

/** Shopify collection → Dojeen Category (for nav cards / category list). */
export function adaptCategory(c: ShopifyCollection, index = 0): DojeenCategory {
  return {
    slug: c.handle,
    name: c.title,
    productCount: 0,
    thumbnail: c.image?.url ?? '',
    serialNumber: String(index + 1).padStart(2, '0'),
  };
}
