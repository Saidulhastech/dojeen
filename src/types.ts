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
  sku: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  careInstructions?: string;
  sizeGuide?: string;
  shippingInfo?: string;
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
