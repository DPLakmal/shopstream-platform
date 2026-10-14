export interface ProductImage {
  id?: number;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface Product {
  id: number;
  sku: string;
  title: string;
  slug: string;
  description: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brand: string;
  basePrice: number;
  salePrice?: number;
  effectivePrice: number;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  attributes?: string;
  images: ProductImage[];
  primaryImageUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
}

export interface CartItem {
  productId: number;
  sku: string;
  title: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  grandTotal: number;
}

export interface ParsedFilter {
  originalQuery?: string;
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: string;
  tags?: string[];
  detectedIntent?: string;
  confidence?: number;
  parserType?: 'LLM' | 'HYBRID_NLP';
}

export interface SearchResponse {
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  searchLatencyMs: number;
  appliedFilters?: ParsedFilter;
  categoryFacets: Record<string, number>;
  brandFacets: Record<string, number>;
  minCatalogPrice?: number;
  maxCatalogPrice?: number;
}

export interface OrderItem {
  productId: number;
  sku: string;
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  status: 'PENDING' | 'PAYMENT_PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: string;
  billingAddress: string;
  items: OrderItem[];
  createdAt: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: string;
  mock: boolean;
}
