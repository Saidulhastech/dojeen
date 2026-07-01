// ============================================================
//  Product GraphQL operations (Storefront API 2026-04)
// ============================================================
import {
  MONEY_FRAGMENT,
  IMAGE_FRAGMENT,
  VARIANT_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  CARD_FRAGMENTS,
} from './fragments';

/** Paginated, sortable, filterable product list (bidirectional cursors). */
export const PRODUCTS_QUERY = /* GraphQL */ `
  ${CARD_FRAGMENTS}
  query ProductList(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductSortKeys = BEST_SELLING
    $reverse: Boolean = false
    $query: String
  ) {
    products(
      first: $first
      last: $last
      after: $after
      before: $before
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      edges {
        cursor
        node {
          ...ProductCard
        }
      }
    }
  }
`;

/** Single product by handle — full detail for the PDP. */
export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      productType
      vendor
      tags
      availableForSale
      featuredImage {
        ...ImageFields
      }
      images(first: 20) {
        edges {
          node {
            ...ImageFields
          }
        }
      }
      priceRange {
        minVariantPrice {
          ...Money
        }
        maxVariantPrice {
          ...Money
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          ...Money
        }
      }
      collections(first: 1) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      options {
        id
        name
        optionValues {
          id
          name
        }
      }
      variants(first: 100) {
        edges {
          node {
            ...VariantFields
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
`;

/** Recommendations for the PDP. `intent` is RELATED (similar) or COMPLEMENTARY
    ("complete the look" cross-sell); defaults to RELATED server-side if omitted. */
export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  ${CARD_FRAGMENTS}
  query ProductRecommendations($productId: ID!, $intent: ProductRecommendationIntent) {
    productRecommendations(productId: $productId, intent: $intent) {
      ...ProductCard
    }
  }
`;

/** All product handles — for static params / sitemaps if needed. */
export const PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query ProductHandles($first: Int = 250, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
        }
      }
    }
  }
`;
