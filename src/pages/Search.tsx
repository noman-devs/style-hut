import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/products/ProductCard';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { Search as SearchIcon } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const results = await getProducts({ search: query });
        setProducts(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    executeSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Search Header */}
      <div className="mb-8 pb-4 border-b border-brand-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark flex items-center gap-2">
          <SearchIcon className="w-6 h-6 text-brand-rose" />
          <span>Search Results for "{query}"</span>
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Found {products.length} matching products
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="aspect-[3/4] bg-brand-softPink/30 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8 max-w-md mx-auto">
          <SearchIcon className="w-12 h-12 text-brand-muted mx-auto mb-3" />
          <h2 className="font-serif text-lg font-bold text-brand-dark">No Matching Items</h2>
          <p className="text-xs text-brand-muted mt-1">
            We couldn't find any products matching your search term. Try searching for "Saree", "Kurti", "Jamdani", or "Kundan".
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 px-6 py-2 bg-brand-pink text-white text-xs font-bold rounded-full"
          >
            Browse Full Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};
