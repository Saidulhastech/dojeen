export interface Product {
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  discount?: number;
  isOnSale?: boolean;
  category: string;
  categorySlug: string;
  thumbnail: string;
  thumbnailHover: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  sizes: string[];
  colors: string[];
  /** Per-color variant image URL, parallel to colors[]. Falls back to thumbnail when a variant has no image. */
  colorImages: string[];
  sku: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  careInstructions?: string;
  sizeGuide?: string;
  shippingInfo?: string;
  // ── Shopify-backed optional fields (populated by the adapter) ──
  /** Default ProductVariant gid for add-to-cart (gid://shopify/ProductVariant/…). */
  variantId?: string;
  /** Product gid (gid://shopify/Product/…) — used for recommendations. */
  shopifyId?: string;
  /** ISO currency code from Shopify (e.g. USD, BDT) for price formatting. */
  currencyCode?: string;
  /** Rich-text product description from Shopify (PDP). */
  descriptionHtml?: string;
  /** All variants for client-side (size/color) → variant resolution on the PDP. */
  variantMatrix?: ProductVariantOption[];
}

export interface ProductVariantOption {
  id: string;
  available: boolean;
  /** Units in stock for this variant, or null if the store doesn't expose inventory. */
  quantity?: number | null;
  /** Lowercased option name → value, e.g. { size: 'M', color: 'Blue' }. */
  options: Record<string, string>;
}

export interface Category {
  slug: string;
  name: string;
  productCount: number;
  thumbnail: string;
  serialNumber: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  authorSlug: string;
  thumbnail: string;
  featured?: boolean;
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface Testimonial {
  id: number;
  name: string;
  designation: string;
  quote: string;
  rating: number;
  image: string;
  productThumbnail: string;
  productName: string;
  productPrice: number;
  productSlug: string;
}

export interface Partner {
  id: number;
  title: string;
  description: string;
  logos: string[];
  activeLogo: number;
}

export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export interface BadgeItem {
  icon: string;
  text: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isGroup?: boolean;
  groupTitle?: string;
}

export interface Location {
  name: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
}
