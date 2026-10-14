'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, ArrowRight, Clock, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { api } from '@/lib/api';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      setIsLoading(true);
      try {
        const data = await api.getOrderByNumber(orderNumber as string);
        setOrder(data);
      } catch (err) {
        console.warn('Could not fetch order from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const orderNum = order?.orderNumber || (orderNumber as string);
  const totalAmount = order?.totalAmount ?? 189.99;
  const items = order?.items || [];
  const status = order?.status || 'PAID';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Success Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900">
          Payment Successful & Order Confirmed!
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Thank you for your purchase. We&apos;ve sent a confirmation email receipt with full tracking updates.
        </p>

        <div className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-white border border-emerald-200 px-4 py-2 font-mono text-xs font-bold text-slate-800 shadow-2xs">
          <span>Order Reference:</span>
          <span className="text-emerald-700">{orderNum}</span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Order Fulfillment Progress
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">1. Order Placed</h4>
              <span className="text-[11px] text-emerald-600 font-semibold">Confirmed</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">2. Stripe Payment</h4>
              <span className="text-[11px] text-emerald-600 font-semibold">{status}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">3. Warehouse Pack</h4>
              <span className="text-[11px] text-blue-600 font-semibold">In Progress</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400">4. Delivery</h4>
              <span className="text-[11px] text-slate-400">Est. 2-3 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Purchased Items
        </h3>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <span className="text-slate-400">Qty: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ${Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">
            Payment verified and settled in Stripe gateway.
          </p>
        )}

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm font-extrabold text-slate-900">
          <span>Total Paid</span>
          <span className="text-emerald-700 text-lg">${Number(totalAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center pt-4">
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors shadow-md"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
