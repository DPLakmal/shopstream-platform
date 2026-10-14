'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Zap, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await api.getProductBySlug(slug as string);
        setProduct(data);
        const firstImg = data.primaryImageUrl || (data.images && data.images[0]?.imageUrl);
        if (firstImg) setSelectedImage(firstImg);
      } catch (err) {
        console.warn('Could not fetch product from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The product you are looking for does not exist or has been retired.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const hasDiscount = product.salePrice != null && product.salePrice < product.basePrice;

  // Parse JSON attributes
  let attributesObj: Record<string, string> = {};
  if (product.attributes) {
    try {
      attributesObj = JSON.parse(product.attributes);
    } catch (ignored) {}
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-emerald-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.categoryName)}`} className="hover:text-emerald-600">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px] text-slate-800 font-medium">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage || product.primaryImageUrl}
              alt={product.title}
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img.imageUrl ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center space-x-2 text-sm text-slate-600">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-800">{Number(product.rating).toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 border-y border-slate-100 py-4">
            <span className="text-3xl font-extrabold text-slate-900">
              ${Number(product.effectivePrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ${Number(product.basePrice).toFixed(2)}
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                  Save ${(product.basePrice - (product.salePrice || 0)).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Availability */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {product.stockQuantity > 0 ? (
              <span className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock ({product.stockQuantity} ready to ship)</span>
              </span>
            ) : (
              <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                Out of Stock
              </span>
            )}
          </div>

          {/* Add to Cart Controls */}
          <div className="flex items-center space-x-4 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stockQuantity === 0}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3.5 px-6 text-sm font-bold shadow-lg transition-all ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : product.stockQuantity === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/10 hover:shadow-emerald-600/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  <span>Add to Shopping Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Specifications Table */}
          {Object.keys(attributesObj).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Specifications & Attributes
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(attributesObj).map(([key, value]) => (
                  <div key={key} className="border-b border-slate-200/60 pb-2">
                    <dt className="text-slate-400 font-medium capitalize">{key.replace('_', ' ')}</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-6 text-center text-xs text-slate-600">
            <div className="flex flex-col items-center space-y-1">
              <Truck className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Fast Shipping</span>
              <span className="text-[10px] text-slate-400">Free over $100</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Stripe Secure</span>
              <span className="text-[10px] text-slate-400">Idempotent checkout</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Easy Returns</span>
              <span className="text-[10px] text-slate-400">30-day guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
