'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Search, ArrowRight, CornerDownLeft, SlidersHorizontal, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ParsedFilter } from '@/types';

const PROMPT_SUGGESTIONS = [
  'noise cancelling headphones under $150',
  'waterproof running shoes under $130',
  'top rated laptop with 32GB RAM',
  'espresso machine with dual boiler',
  'cheapest bluetooth waterproof speaker in stock',
];

export default function AISearchBar({
  initialQuery = '',
  initialAiMode = true,
  onSearch,
}: {
  initialQuery?: string;
  initialAiMode?: boolean;
  onSearch?: (query: string, aiMode: boolean) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [aiMode, setAiMode] = useState(initialAiMode);
  const [isParsing, setIsParsing] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<ParsedFilter | null>(null);
  const router = useRouter();

  const handleTestParse = async (testText: string) => {
    setQuery(testText);
    if (!aiMode) return;
    setIsParsing(true);
    try {
      const parsed = await api.aiParseQuery(testText);
      setPreviewFilter(parsed);
    } catch (err) {
      console.warn('AI parse test failed:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim(), aiMode);
    } else {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (aiMode) params.set('aiMode', 'true');
      router.push(`/products?${params.toString()}`);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center rounded-2xl border-2 p-1.5 shadow-xl transition-all duration-300 ${
          aiMode
            ? 'border-emerald-500 bg-white shadow-emerald-500/10 ring-4 ring-emerald-500/10'
            : 'border-slate-300 bg-white shadow-slate-200 focus-within:border-slate-400'
        }`}
      >
        <div className="pl-4 pr-2 text-slate-400">
          {aiMode ? (
            <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
          ) : (
            <Search className="h-6 w-6 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (previewFilter) setPreviewFilter(null);
          }}
          placeholder={
            aiMode
              ? 'Ask AI: "waterproof running shoes under $120", "top rated noise cancelling headphones"...'
              : 'Keyword search: e.g. "headphones", "ApexBook", "espresso"...'
          }
          className="w-full bg-transparent py-3 pr-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
        />

        {/* AI Mode Switcher Toggle */}
        <div className="flex items-center space-x-2 mr-2">
          <button
            type="button"
            onClick={() => setAiMode(!aiMode)}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              aiMode
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Filter Mode</span>
          </button>

          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors"
            title="Execute Search"
          >
            {isParsing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* Suggested Natural Language Prompts */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-slate-500 flex items-center space-x-1">
          <SlidersHorizontal className="h-3 w-3" />
          <span>Try AI queries:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleTestParse(suggestion)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors shadow-2xs"
          >
            &ldquo;{suggestion}&rdquo;
          </button>
        ))}
      </div>

      {/* Live Decomposed Filter Card (When user clicks a suggestion or tests query) */}
      {previewFilter && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-800 flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>AI Query Decomposed Into Structured Filters:</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
              {previewFilter.parserType}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {previewFilter.category && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                📁 Category: {previewFilter.category}
              </span>
            )}
            {previewFilter.brand && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                🏷️ Brand: {previewFilter.brand}
              </span>
            )}
            {previewFilter.maxPrice != null && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                💵 Max Price: ${previewFilter.maxPrice}
              </span>
            )}
            {previewFilter.minPrice != null && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                💵 Min Price: ${previewFilter.minPrice}
              </span>
            )}
            {previewFilter.minRating != null && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                ⭐ Rating &ge; {previewFilter.minRating}
              </span>
            )}
            {previewFilter.inStockOnly && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                📦 In Stock Only
              </span>
            )}
            {previewFilter.sortBy && previewFilter.sortBy !== 'RELEVANCE' && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                ⚡ Sort: {previewFilter.sortBy}
              </span>
            )}
            {previewFilter.tags && previewFilter.tags.length > 0 && (
              <span className="rounded-md bg-white border border-emerald-300 px-2 py-1 font-medium text-emerald-900">
                🔖 Tags: {previewFilter.tags.join(', ')}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
            <span>{previewFilter.detectedIntent}</span>
            <button
              onClick={handleSubmit}
              className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
            >
              <span>Apply & Browse Products</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
