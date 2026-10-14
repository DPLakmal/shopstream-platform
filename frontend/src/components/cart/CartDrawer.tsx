'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 100;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Your Shopping Cart ({cart?.totalItems || 0})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-emerald-50/60 border-b border-emerald-100 px-6 py-3 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-semibold mb-1">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>
                {amountNeededForFreeShipping === 0
                  ? '🎉 You unlocked FREE Shipping!'
                  : `Add $${amountNeededForFreeShipping.toFixed(2)} more for FREE Shipping!`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-emerald-200/60 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  Discover our AI-curated electronics, audio gear, and outdoor apparel.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex space-x-4 border-b border-slate-100 pb-4 last:border-0"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-slate-400 hover:text-red-500 ml-2"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        ${Number(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={isLoading}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-l-lg"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isLoading}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-r-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Estimated Shipping</span>
                <span>
                  {cart?.estimatedShipping === 0 ? (
                    <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                  ) : (
                    `$${Number(cart?.estimatedShipping).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span>${Number(cart?.estimatedTax).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-emerald-700 font-extrabold text-base">
                  ${Number(cart?.grandTotal).toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
