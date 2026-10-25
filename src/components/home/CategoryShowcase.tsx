import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { ArrowRight } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  const { categories } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-rose">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="mt-2 sm:mt-0 text-xs sm:text-sm font-semibold text-brand-rose hover:text-brand-pink transition-colors flex items-center gap-1.5"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-white border border-brand-border/60 shadow-soft hover:shadow-card transition-all duration-300"
            >
              {/* Image */}
              <img
                src={category.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

              {/* Text Info */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white flex flex-col justify-end">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-[11px] sm:text-xs text-gray-200 line-clamp-1 mt-0.5 opacity-90 font-light">
                    {category.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-gold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>Explore Now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
