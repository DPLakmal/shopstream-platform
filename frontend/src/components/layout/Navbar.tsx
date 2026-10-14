'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Search, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    if (aiMode) params.set('aiMode', 'true');
    router.push(`/products?${params.toString()}`);
  };

  const totalItems = cart?.totalItems || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                ShopStream
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                AI Powered
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link href="/products" className="hover:text-emerald-600 transition-colors">
              Explore All
            </Link>
            <Link href="/products?category=Audio+%26+Sound" className="hover:text-emerald-600 transition-colors">
              Audio
            </Link>
            <Link href="/products?category=Electronics" className="hover:text-emerald-600 transition-colors">
              Tech
            </Link>
            <Link href="/products?category=Apparel+%26+Footwear" className="hover:text-emerald-600 transition-colors">
              Apparel
            </Link>
          </nav>
        </div>

        {/* Global Compact Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={aiMode ? "Try: 'waterproof shoes under $130 size 10'..." : "Search products, brands, tags..."}
              className={`w-full rounded-full border py-2 pl-10 pr-24 text-sm focus:outline-none transition-all ${
                aiMode
                  ? 'border-emerald-500 bg-emerald-50/30 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-400 focus:bg-white'
              }`}
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            
            {/* AI Toggle Pill */}
            <button
              type="button"
              onClick={() => setAiMode(!aiMode)}
              className={`absolute right-1.5 top-1.5 flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                aiMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              title="Toggle AI Natural Language Query Parser"
            >
              <Sparkles className="h-3 w-3" />
              <span>AI Mode</span>
            </button>
          </form>
        </div>

        {/* Right Actions: Admin & Cart */}
        <div className="flex items-center space-x-3">
          <Link
            href="/admin"
            className="hidden sm:flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Admin</span>
          </Link>

          <button
            onClick={toggleCart}
            className="relative flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center h-10 w-10 rounded-full text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or ask AI..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-20 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setAiMode(!aiMode)}
              className={`absolute right-1 top-1 rounded-full px-2 py-1 text-xs font-semibold ${
                aiMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              AI: {aiMode ? 'ON' : 'OFF'}
            </button>
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 pt-2">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link href="/products?category=Audio+%26+Sound" onClick={() => setMobileMenuOpen(false)}>Audio & Sound</Link>
            <Link href="/products?category=Electronics" onClick={() => setMobileMenuOpen(false)}>Electronics & Tech</Link>
            <Link href="/products?category=Apparel+%26+Footwear" onClick={() => setMobileMenuOpen(false)}>Apparel & Footwear</Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Admin & System Status</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
