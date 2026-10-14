'use client';

import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  categories: { name: string; count?: number }[];
  brands: { name: string; count?: number }[];
  selectedCategory?: string;
  selectedBrand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  onSelectCategory: (category: string | undefined) => void;
  onSelectBrand: (brand: string | undefined) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onRatingChange: (rating?: number) => void;
  onInStockChange: (inStock: boolean) => void;
  onReset: () => void;
}

export default function ProductFilterSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  minRating,
  inStockOnly,
  onSelectCategory,
  onSelectBrand,
  onPriceChange,
  onRatingChange,
  onInStockChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Title & Clear */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
          <Filter className="h-4 w-4 text-emerald-600" />
          <span>Catalog Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* In-Stock Toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
            In-Stock Items Only
          </span>
          <input
            type="checkbox"
            checked={!!inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
              !selectedCategory
                ? 'bg-emerald-50 font-bold text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="h-3 w-3" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(selectedCategory === cat.name ? undefined : cat.name)}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-emerald-50 font-bold text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.count != null && (
                <span className="ml-2 text-[10px] text-slate-400">({cat.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Price Range ($)
        </h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice ?? ''}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : undefined, maxPrice)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ''}
            onChange={(e) => onPriceChange(minPrice, e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Brands
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <button
                key={brand.name}
                onClick={() => onSelectBrand(selectedBrand === brand.name ? undefined : brand.name)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                  selectedBrand === brand.name
                    ? 'bg-emerald-50 font-bold text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{brand.name}</span>
                {brand.count != null && (
                  <span className="ml-2 text-[10px] text-slate-400">({brand.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Minimum Rating
        </h4>
        <div className="grid grid-cols-4 gap-1 text-xs">
          {[4.5, 4.0, 3.5, 3.0].map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(minRating === r ? undefined : r)}
              className={`rounded-lg py-1 text-center font-medium border transition-colors ${
                minRating === r
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
