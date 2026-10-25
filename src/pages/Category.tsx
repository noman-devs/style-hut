import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/products/ProductCard';
import { Category as CategoryType, Product } from '../types';
import { getCategories, getProducts } from '../services/api';

export const Category: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts({ categorySlug: slug }),
        ]);
        const found = cats.find(c => c.slug === slug);
        setCategory(found || null);
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Category Banner Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-brand-charcoal text-white p-8 sm:p-12 shadow-elevated">
        {category?.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45]"
          />
        )}
        <div className="relative z-10 max-w-xl">
          <div className="text-xs uppercase tracking-widest text-brand-gold font-bold mb-1">
            Category Collection
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p className="mt-2 text-xs sm:text-sm text-gray-200 font-light">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="aspect-[3/4] bg-brand-softPink/30 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8">
          <p className="font-serif text-lg font-bold text-brand-dark">No Products in this Category</p>
          <p className="text-xs text-brand-muted mt-1">
            New items are being crafted and added regularly.
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 px-6 py-2 bg-brand-pink text-white text-xs font-bold rounded-full"
          >
            Explore All Products
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
