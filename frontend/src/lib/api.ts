import { Cart, Category, Order, ParsedFilter, PaymentIntentResponse, Product, SearchResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Generate or retrieve persistent local cart UUID
export function getOrCreateCartId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let cartId = localStorage.getItem('shopstream_cart_id');
  if (!cartId) {
    cartId = 'cart_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('shopstream_cart_id', cartId);
  }
  return cartId;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Cart-Id': getOrCreateCartId(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorBody || response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Products
  async getProducts(page = 0, size = 12, sortBy = 'createdAt', direction = 'DESC') {
    return fetchJson<{ content: Product[]; totalPages: number; totalElements: number }>(
      `/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return fetchJson<Product[]>('/products/featured');
  },

  async getProductBySlug(slug: string): Promise<Product> {
    return fetchJson<Product>(`/products/slug/${slug}`);
  },

  async getCategories(): Promise<Category[]> {
    return fetchJson<Category[]>('/products/categories');
  },

  // Search
  async search(params: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    sortBy?: string;
    aiMode?: boolean;
    page?: number;
    size?: number;
  }): Promise<SearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', params.category);
    if (params.brand) query.set('brand', params.brand);
    if (params.minPrice != null) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null) query.set('maxPrice', params.maxPrice.toString());
    if (params.minRating != null) query.set('minRating', params.minRating.toString());
    if (params.inStock != null) query.set('inStock', params.inStock.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.aiMode) query.set('aiMode', 'true');
    if (params.page != null) query.set('page', params.page.toString());
    if (params.size != null) query.set('size', params.size.toString());

    return fetchJson<SearchResponse>(`/search?${query.toString()}`);
  },

  async aiParseQuery(query: string): Promise<ParsedFilter> {
    return fetchJson<ParsedFilter>('/search/ai-parse', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // Cart
  async getCart(): Promise<Cart> {
    return fetchJson<Cart>('/cart');
  },

  async addToCart(productId: number, quantity = 1): Promise<Cart> {
    return fetchJson<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartQuantity(productId: number, quantity: number): Promise<Cart> {
    return fetchJson<Cart>('/cart/items', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async removeFromCart(productId: number): Promise<Cart> {
    return fetchJson<Cart>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  async clearCart(): Promise<void> {
    const url = `${API_BASE}/cart`;
    await fetch(url, {
      method: 'DELETE',
      headers: { 'X-Cart-Id': getOrCreateCartId() },
    });
  },

  // Orders & Payments
  async createOrder(orderData: {
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    shippingAddress: string;
    billingAddress?: string;
    items: { productId: number; quantity: number }[];
    idempotencyKey?: string;
  }): Promise<Order> {
    const key = orderData.idempotencyKey || `ord-key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return fetchJson<Order>('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ ...orderData, idempotencyKey: key }),
    });
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return fetchJson<Order>(`/orders/${orderNumber}`);
  },

  async createPaymentIntent(orderNumber: string, amount: number, idempotencyKey?: string): Promise<PaymentIntentResponse> {
    const key = idempotencyKey || `pi-key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return fetchJson<PaymentIntentResponse>('/payments/create-intent', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ orderNumber, amount, idempotencyKey: key }),
    });
  },

  async simulatePaymentSuccess(orderNumber: string, idempotencyKey?: string): Promise<Order> {
    const key = idempotencyKey || `sim-key-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return fetchJson<Order>('/payments/simulate-success', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ orderNumber, idempotencyKey: key }),
    });
  },

  async triggerReindex(): Promise<{ status: string; indexedProducts: number }> {
    return fetchJson<{ status: string; indexedProducts: number }>('/search/reindex', {
      method: 'POST',
    });
  },
};
