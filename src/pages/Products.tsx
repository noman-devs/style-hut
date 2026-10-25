import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/products/ProductCard';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { useStore } from '../contexts/StoreContext';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter params
  const categoryParam = searchParams.get('category') || '';
  const featuredParam = searchParams.get('featured') === 'true';
  const sortByParam = (searchParams.get('sortBy') as 'newest' | 'price_asc' | 'price_desc') || 'newest';
  const inStockOnly = searchParams.get('inStock') === 'true';

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const prods = await getProducts({
          categoryId: categoryParam || undefined,
          featured: featuredParam || undefined,
          sortBy: sortByParam,
        });
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [categoryParam, featuredParam, sortByParam]);

  const filteredProducts = products.filter(p => {
    if (inStockOnly && p.stock_quantity <= 0) return false;
    return true;
  });

  const handleCategorySelect = (catId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sortBy: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    setSearchParams(newParams);
  };

  const handleInStockToggle = (checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('inStock', 'true');
    } else {
      newParams.delete('inStock');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Women's Fashion Catalog
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Showing {filteredProducts.length} curated boutique items
          </p>
        </div>

        {/* Controls: Mobile filter toggle & Sort selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-brand-border rounded-full text-xs font-semibold text-brand-dark hover:bg-brand-softPink"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-muted hidden sm:block" />
            <span className="text-xs text-brand-muted hidden sm:inline">Sort:</span>
            <select
              value={sortByParam}
              onChange={e => handleSortChange(e.target.value)}
              className="px-3 py-2 bg-white border border-brand-border rounded-full text-xs font-medium text-brand-dark focus:outline-none focus:border-brand-pink"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-soft space-y-6">
            
            {/* Category Filter */}
            <div>
              <h3 className="font-serif text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !categoryParam ? 'bg-brand-pink text-white font-semibold' : 'text-brand-dark hover:bg-brand-softPink/50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      categoryParam === cat.id ? 'bg-brand-pink text-white font-semibold' : 'text-brand-dark hover:bg-brand-softPink/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="border-t border-brand-border pt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-brand-dark cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => handleInStockToggle(e.target.checked)}
                  className="rounded text-brand-pink focus:ring-brand-pink"
                />
                <span>In-Stock Only</span>
              </label>
            </div>

            {/* Reset Filters */}
            {(categoryParam || inStockOnly || featuredParam) && (
              <button
                onClick={() => setSearchParams({})}
                className="w-full py-2 text-center text-xs font-semibold text-brand-rose hover:underline"
              >
                Clear all filters
              </button>
            )}

          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="aspect-[3/4] bg-brand-softPink/30 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8">
              <p className="font-serif text-lg font-bold text-brand-dark">No Products Found</p>
              <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                We couldn't find any products matching your selected filters. Try choosing a different category or clearing filters.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 px-6 py-2 bg-brand-pink text-white text-xs font-bold rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
