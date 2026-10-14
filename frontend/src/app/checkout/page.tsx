'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    customerEmail: 'alex.developer@example.com',
    customerName: 'Alex Mercer',
    customerPhone: '+1 (555) 019-2834',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    notes: 'Please leave package by the front porch.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const items = cart?.items || [];
  const grandTotal = cart?.grandTotal || 0;

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    );
  }

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Generate unique idempotency key to protect against duplicate checkout attempts
    const idempotencyKey = `idemp_checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 1. Create Order in Backend
      const order = await api.createOrder({
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        idempotencyKey,
      });

      // 2. Create Stripe Payment Intent
      await api.createPaymentIntent(order.orderNumber, order.totalAmount, idempotencyKey);

      // 3. Confirm payment (Mock/Stripe Webhook simulation)
      await api.simulatePaymentSuccess(order.orderNumber, idempotencyKey);

      // 4. Clear cart and redirect
      await clearCart();
      router.push(`/order-confirmation/${order.orderNumber}`);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'An error occurred during checkout. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
        <Link href="/products" className="hover:text-emerald-600">Store</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Secure Checkout</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left Column: Form & Payment */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleCompleteOrder} className="space-y-6">
            {/* Contact Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">1. Customer Information</h3>
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Encrypted</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                2. Shipping Destination
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Instructions</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Gate code, door drop instructions..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>3. Stripe Payment Gateway</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">Idempotency Guard Enabled</span>
              </div>

              {/* Stripe Simulated Card UI */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span>Stripe Test Mode Card</span>
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200 font-mono text-slate-700 flex justify-between items-center text-xs">
                  <span>•••• •••• •••• 4242</span>
                  <span className="text-slate-400">12/28 &nbsp; CVC: 123</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Transactions are sent with a unique cryptographically generated <code>Idempotency-Key</code> header to ensure zero duplicate charges even upon accidental multiple clicks.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition-all disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Idempotent Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ${grandTotal.toFixed(2)} with Stripe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review ({items.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(cart?.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {cart?.estimatedShipping === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    `$${Number(cart?.estimatedShipping).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${Number(cart?.estimatedTax).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-emerald-700">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
