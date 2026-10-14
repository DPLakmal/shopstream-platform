'use client';

import React from 'react';
import { Sparkles, Clock, X } from 'lucide-react';
import { ParsedFilter } from '@/types';

interface ParsedFilterBannerProps {
  filter: ParsedFilter;
  latencyMs: number;
  onClear: () => void;
}

export default function ParsedFilterBanner({
  filter,
  latencyMs,
  onClear,
}: ParsedFilterBannerProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 text-xs text-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-emerald-900 text-sm">
            AI Search Applied: &ldquo;{filter.originalQuery}&rdquo;
          </span>
        </div>

        <div className="flex items-center space-x-3 text-emerald-800 font-medium">
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{latencyMs}ms latency</span>
          </span>
          <button
            onClick={onClear}
            className="flex items-center space-x-1 rounded-md bg-white border border-emerald-300 px-2 py-0.5 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Reset AI Filters</span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-emerald-950">Structured Filters:</span>
        {filter.category && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Category: <strong className="text-emerald-700">{filter.category}</strong>
          </span>
        )}
        {filter.brand && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Brand: <strong className="text-emerald-700">{filter.brand}</strong>
          </span>
        )}
        {filter.maxPrice != null && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Max Price: <strong className="text-emerald-700">${filter.maxPrice}</strong>
          </span>
        )}
        {filter.minPrice != null && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Min Price: <strong className="text-emerald-700">${filter.minPrice}</strong>
          </span>
        )}
        {filter.minRating != null && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Rating: <strong className="text-emerald-700">&ge; {filter.minRating} ★</strong>
          </span>
        )}
        {filter.inStockOnly && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            📦 In Stock
          </span>
        )}
        {filter.tags && filter.tags.length > 0 && (
          <span className="rounded-lg bg-white/90 border border-emerald-300 px-2.5 py-1 font-medium text-emerald-900 shadow-2xs">
            Tags: <strong className="text-emerald-700">{filter.tags.join(', ')}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
