'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Check, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  const hasDiscount = product.salePrice != null && product.salePrice < product.basePrice;
  const primaryImg = product.primaryImageUrl || (product.images && product.images[0]?.imageUrl) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      {/* Product Image & Badges */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-slate-100 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImg}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            SALE
          </span>
        )}

        {/* Featured Badge */}
        {product.isFeatured && !hasDiscount && (
          <span className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            <Zap className="h-3 w-3" />
            <span>FEATURED</span>
          </span>
        )}

        {/* Stock warning */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute bottom-3 left-3 rounded-md bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            Only {product.stockQuantity} left!
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-semibold text-emerald-600 uppercase tracking-wider text-[11px]">
            {product.brand}
          </span>
          <span className="truncate max-w-[120px] text-slate-400">
            {product.categoryName}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-600">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="font-semibold text-slate-800">{Number(product.rating).toFixed(1)}</span>
          <span className="text-slate-400">({product.reviewCount})</span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-slate-900">
              ${Number(product.effectivePrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ${Number(product.basePrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.stockQuantity === 0}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : product.stockQuantity === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-sm hover:shadow'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added!</span>
              </>
            ) : product.stockQuantity === 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
