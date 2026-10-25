import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { BenefitsStrip } from '../components/home/BenefitsStrip';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { ProductCard } from '../components/products/ProductCard';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { useStore } from '../contexts/StoreContext';
import { ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';

export const Home: React.FC = () => {
  const { settings } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageProducts() {
      try {
        const prods = await getProducts();
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageProducts();
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = [...products].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 4);
  const specialOffers = products.filter(p => p.sale_price && p.sale_price < p.regular_price);

  return (
    <div className="space-y-4">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Benefits Service Strip */}
      <BenefitsStrip />

      {/* 3. Category Showcase */}
      <CategoryShowcase />

      {/* 4. Featured Products Section */}
      {settings.homepage_sections?.featured_products && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-rose">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                <span>Handpicked Style</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mt-1">
                Featured Collections
              </h2>
            </div>
            <Link
              to="/products?featured=true"
              className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-brand-rose hover:text-brand-pink transition-colors flex items-center gap-1.5"
            >
              <span>Explore All Featured</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] bg-brand-softPink/30 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. FESTIVE PROMO BANNER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-rose via-brand-pink to-brand-rose text-white p-8 sm:p-12 lg:p-16 shadow-elevated">
          <div className="relative z-10 max-w-lg space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-brand-ivory text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Limited Edition Artisanal Craft
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Dhakai Jamdani & Silk Heirlooms
            </h2>
            <p className="text-xs sm:text-sm text-gray-100 font-light max-w-md">
              Each piece is uniquely handcrafted by master artisans. Experience supreme comfort with timeless Bangladeshi heritage.
            </p>
            <div className="pt-2">
              <Link
                to="/category/saree"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-brand-rose hover:bg-brand-ivory text-xs sm:text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <span>Shop Authentic Sarees</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-brand-gold/20 blur-3xl" />
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      {settings.homepage_sections?.new_arrivals && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-rose">
                <Flame className="w-3.5 h-3.5 text-brand-gold" />
                <span>Fresh in Store</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/products?sortBy=newest"
              className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-brand-rose hover:text-brand-pink transition-colors flex items-center gap-1.5"
            >
              <span>View All New</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Special Offers Section */}
      {settings.homepage_sections?.special_offers && specialOffers.length > 0 && (
        <section className="py-12 sm:py-16 bg-brand-softPink/30 border-t border-brand-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-rose">
                  <Tag className="w-3.5 h-3.5 text-brand-rose" />
                  <span>Exclusive Savings</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mt-1">
                  Special Festive Offers
                </h2>
              </div>
              <Link
                to="/products"
                className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-brand-rose hover:text-brand-pink transition-colors flex items-center gap-1.5"
              >
                <span>Browse All Discounts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {specialOffers.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
