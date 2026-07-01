// GET /api/recommendations?productId=<gid>&intent=COMPLEMENTARY&limit=8
// Same-origin proxy for Shopify product recommendations, used by the cart
// upsell rail (drawer + cart page). COMPLEMENTARY is merchant-curated and is
// often empty, so we fall back to RELATED (algorithmic) to always return cards.
import type { APIRoute } from 'astro';
import { getRelatedProducts, getComplementaryProducts } from '@/lib/catalog';
import { sizedImg } from '@/lib/img';
import type { Product } from '@/types';

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Trim a full Product down to what the upsell card needs. */
function toCard(p: Product) {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    currencyCode: p.currencyCode ?? '',
    image: sizedImg(p.thumbnail, 200),
    variantId: p.variantId ?? '',
    inStock: !!p.inStock,
    isOnSale: !!p.isOnSale,
    comparePrice: p.comparePrice ?? null,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const productId = url.searchParams.get('productId')?.trim() ?? '';
  const intent = (url.searchParams.get('intent') ?? 'COMPLEMENTARY').toUpperCase();
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get('limit')) || 8));

  if (!productId) return json({ products: [] });

  try {
    let products =
      intent === 'RELATED'
        ? await getRelatedProducts(productId, limit)
        : await getComplementaryProducts(productId, limit);
    // Curated complementary list is empty for most products → fall back to related.
    if (!products.length && intent !== 'RELATED') {
      products = await getRelatedProducts(productId, limit);
    }
    return json({ products: products.map(toCard) });
  } catch {
    return json({ products: [] });
  }
};
