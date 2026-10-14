'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import AISearchBar from '@/components/search/AISearchBar';
import ProductCard from '@/components/products/ProductCard';
import ProductFilterSidebar from '@/components/products/ProductFilterSidebar';
import ParsedFilterBanner from '@/components/products/ParsedFilterBanner';
import { Product, SearchResponse, ParsedFilter } from '@/types';
import { api } from '@/lib/api';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search and filter state
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || undefined;
  const brandParam = searchParams.get('brand') || undefined;
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRatingParam = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortByParam = searchParams.get('sortBy') || 'RELEVANCE';
  const aiModeParam = searchParams.get('aiMode') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<ParsedFilter | undefined>(undefined);
  const [categoryFacets, setCategoryFacets] = useState<{ name: string; count: number }[]>([]);
  const [brandFacets, setBrandFacets] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: SearchResponse = await api.search({
        q: queryParam,
        category: categoryParam,
        brand: brandParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        minRating: minRatingParam,
        inStock: inStockParam || undefined,
        sortBy: sortByParam,
        aiMode: aiModeParam,
      });

      setProducts(res.products || []);
      setTotalElements(res.totalElements || 0);
      setLatencyMs(res.searchLatencyMs || 0);
      setAppliedFilters(res.appliedFilters);

      // Map facets
      if (res.categoryFacets) {
        setCategoryFacets(Object.entries(res.categoryFacets).map(([name, count]) => ({ name, count })));
      }
      if (res.brandFacets) {
        setBrandFacets(Object.entries(res.brandFacets).map(([name, count]) => ({ name, count })));
      }
    } catch (err) {
      console.warn('Search API fallback:', err);
      // Fallback: fetch general products
      try {
        const fallback = await api.getProducts(0, 20);
        setProducts(fallback.content || []);
        setTotalElements(fallback.totalElements || 0);
      } catch (e) {
        console.error('Failed to load catalog:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    queryParam,
    categoryParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
    minRatingParam,
    inStockParam,
    sortByParam,
    aiModeParam,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value != null && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/products');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
        <AISearchBar
          initialQuery={queryParam}
          initialAiMode={aiModeParam}
          onSearch={(q, aiMode) => {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (aiMode) params.set('aiMode', 'true');
            router.push(`/products?${params.toString()}`);
          }}
        />
      </div>

      {/* Parsed AI Banner */}
      {appliedFilters && (
        <ParsedFilterBanner
          filter={appliedFilters}
          latencyMs={latencyMs}
          onClear={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('aiMode');
            router.push(`/products?${params.toString()}`);
          }}
        />
      )}

      {/* Catalog Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <ProductFilterSidebar
            categories={categoryFacets}
            brands={brandFacets}
            selectedCategory={categoryParam}
            selectedBrand={brandParam}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
            minRating={minRatingParam}
            inStockOnly={inStockParam}
            onSelectCategory={(cat) => updateParam('category', cat)}
            onSelectBrand={(brand) => updateParam('brand', brand)}
            onPriceChange={(min, max) => {
              updateParam('minPrice', min ? min.toString() : undefined);
              updateParam('maxPrice', max ? max.toString() : undefined);
            }}
            onRatingChange={(r) => updateParam('minRating', r ? r.toString() : undefined)}
            onInStockChange={(stock) => updateParam('inStock', stock ? 'true' : undefined)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm">
            <div className="text-slate-600">
              Showing <strong className="text-slate-900">{products.length}</strong> of{' '}
              <strong className="text-slate-900">{totalElements}</strong> items
              {latencyMs > 0 && (
                <span className="ml-2 text-slate-400">({latencyMs}ms)</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              {/* Sorting Selector */}
              <div className="flex items-center space-x-1.5">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <select
                  value={sortByParam}
                  onChange={(e) => updateParam('sortBy', e.target.value)}
                  className="rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="RELEVANCE">Relevance</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="RATING_DESC">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden">
              <ProductFilterSidebar
                categories={categoryFacets}
                brands={brandFacets}
                selectedCategory={categoryParam}
                selectedBrand={brandParam}
                minPrice={minPriceParam}
                maxPrice={maxPriceParam}
                minRating={minRatingParam}
                inStockOnly={inStockParam}
                onSelectCategory={(cat) => updateParam('category', cat)}
                onSelectBrand={(brand) => updateParam('brand', brand)}
                onPriceChange={(min, max) => {
                  updateParam('minPrice', min ? min.toString() : undefined);
                  updateParam('maxPrice', max ? max.toString() : undefined);
                }}
                onRatingChange={(r) => updateParam('minRating', r ? r.toString() : undefined)}
                onInStockChange={(stock) => updateParam('inStock', stock ? 'true' : undefined)}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Grid or Empty */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm">Querying Elasticsearch catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products matched your criteria</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing some filters, or asking AI with different keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
