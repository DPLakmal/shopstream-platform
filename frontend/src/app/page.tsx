'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, RefreshCw, Cpu, Headphones, Watch, Shirt, Home } from 'lucide-react';
import AISearchBar from '@/components/search/AISearchBar';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { api } from '@/lib/api';

const CATEGORIES = [
  { name: 'Audio & Sound', slug: 'audio-sound', icon: Headphones, count: '3 items', desc: 'Active noise cancelling & true wireless' },
  { name: 'Electronics', slug: 'electronics', icon: Cpu, count: '3 items', desc: 'Computing, gaming & accessories' },
  { name: 'Wearables', slug: 'wearables', icon: Watch, count: '2 items', desc: 'GPS multisport & biometric tracking' },
  { name: 'Apparel & Footwear', slug: 'apparel-footwear', icon: Shirt, count: '3 items', desc: 'Waterproof trail shoes & wool hoodies' },
  { name: 'Home & Smart Living', slug: 'home-smart-living', icon: Home, count: '2 items', desc: 'Barista dual-boiler & smart purifiers' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const products = await api.getFeaturedProducts();
        if (products && products.length > 0) {
          setFeaturedProducts(products);
        } else {
          // If empty, fetch general catalog
          const res = await api.getProducts(0, 8);
          setFeaturedProducts(res.content || []);
        }
      } catch (err) {
        console.warn('Backend not yet reachable on localhost:8080, using local preview catalog:', err);
        // Fallback preview products so the page always renders nicely
        setFeaturedProducts([
          {
            id: 1,
            sku: 'AUD-APM-01',
            title: 'AeroPulse Max Wireless Noise-Cancelling Headphones',
            slug: 'aeropulse-max-wireless-headphones',
            description: 'Hybrid active noise cancellation with 40mm graphene drivers.',
            categoryId: 2,
            categoryName: 'Audio & Sound',
            categorySlug: 'audio-sound',
            brand: 'SoundFlow',
            basePrice: 199.99,
            salePrice: 169.99,
            effectivePrice: 169.99,
            stockQuantity: 45,
            rating: 4.85,
            reviewCount: 230,
            isActive: true,
            isFeatured: true,
            tags: ['wireless', 'headphones', 'noise-cancelling'],
            images: [{ imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', isPrimary: true }],
            primaryImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          },
          {
            id: 4,
            sku: 'ELE-MBX-04',
            title: 'ApexBook Pro 16 Ultra Laptop',
            slug: 'apexbook-pro-16-ultra-laptop',
            description: '12-core silicon processor, 32GB RAM, 1TB NVMe Gen4 SSD.',
            categoryId: 1,
            categoryName: 'Electronics',
            categorySlug: 'electronics',
            brand: 'ApexTech',
            basePrice: 1899.99,
            salePrice: 1749.99,
            effectivePrice: 1749.99,
            stockQuantity: 25,
            rating: 4.92,
            reviewCount: 78,
            isActive: true,
            isFeatured: true,
            tags: ['laptop', 'computer', 'pro'],
            images: [{ imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', isPrimary: true }],
            primaryImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
          },
          {
            id: 9,
            sku: 'APP-TRX-09',
            title: 'TerraStride Waterproof Trail Running Shoes',
            slug: 'terrastride-waterproof-trail-running-shoes',
            description: 'Gore-Tex waterproof membrane paired with Vibram Megagrip lugged outsoles.',
            categoryId: 4,
            categoryName: 'Apparel & Footwear',
            categorySlug: 'apparel-footwear',
            brand: 'TerraGear',
            basePrice: 149.99,
            salePrice: 119.99,
            effectivePrice: 119.99,
            stockQuantity: 70,
            rating: 4.82,
            reviewCount: 180,
            isActive: true,
            isFeatured: true,
            tags: ['shoes', 'running', 'trail', 'waterproof'],
            images: [{ imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', isPrimary: true }],
            primaryImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
          },
          {
            id: 12,
            sku: 'HOM-ESP-12',
            title: 'BaristaCraft Pro Dual-Boiler Espresso Machine',
            slug: 'baristacraft-pro-espresso-machine',
            description: 'Dual stainless steel boilers with PID temperature management and 58mm portafilter.',
            categoryId: 5,
            categoryName: 'Home & Smart Living',
            categorySlug: 'home-smart-living',
            brand: 'BaristaCraft',
            basePrice: 899.99,
            salePrice: 799.99,
            effectivePrice: 799.99,
            stockQuantity: 15,
            rating: 4.95,
            reviewCount: 62,
            isActive: true,
            isFeatured: true,
            tags: ['espresso', 'coffee', 'kitchen'],
            images: [{ imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', isPrimary: true }],
            primaryImageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-300 bg-emerald-100/60 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
            <span>AI Natural Language Search Engine</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Next-Gen E-Commerce with{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              AI Query Intelligence
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            Shop naturally with plain English queries. Our hybrid AI decomposes complex conversational
            intents into sub-millisecond Elasticsearch filters, backed by idempotent Stripe payments and Redis caching.
          </p>

          {/* Interactive AI Search Input */}
          <div className="mx-auto mt-10 max-w-3xl">
            <AISearchBar initialAiMode={true} />
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Curated Collections
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse products by hardware domain and active lifestyle categories
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">{cat.desc}</p>
                <span className="mt-3 inline-block text-[11px] font-semibold text-emerald-600">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Featured Highlights
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Top-rated gear with high inventory readiness and fast delivery
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Technical Architecture Callout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Production Architecture
            </span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl text-white">
              Built for Scale, Concurrency & Zero Data Loss
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Every checkout transaction is protected with distributed idempotency locks across Redis
              and PostgreSQL, preventing duplicate charges even under intense network retries or webhooks replay.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-800 pt-8">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Idempotent Webhooks</h4>
                <p className="text-xs text-slate-400 mt-1">Stripe events validated & locked to eliminate duplicate fulfillment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Elasticsearch Indexing</h4>
                <p className="text-xs text-slate-400 mt-1">Multi-match query boosting across titles, tags, and category attributes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Layers className="h-5 w-5 text-teal-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Redis-First Cart</h4>
                <p className="text-xs text-slate-400 mt-1">Sub-millisecond cart reads and atomic quantity modifications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
