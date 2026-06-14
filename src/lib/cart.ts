export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

const CART_KEY = 'dojeen_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.id === item.id && c.size === item.size && c.color === item.color
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromCart(id: string, size?: string, color?: string): void {
  const cart = getCart().filter(
    (c) => !(c.id === id && c.size === size && c.color === color)
  );
  saveCart(cart);
}

export function updateQuantity(id: string, quantity: number, size?: string, color?: string): void {
  const cart = getCart().map((c) =>
    c.id === id && c.size === size && c.color === color ? { ...c, quantity } : c
  );
  saveCart(cart);
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, c) => sum + c.price * c.quantity, 0);
}
