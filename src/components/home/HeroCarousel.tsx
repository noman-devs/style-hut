import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export const HeroCarousel: React.FC = () => {
  const { banners } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter only active banners
  const activeBanners = banners.filter(b => b.is_active);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-brand-charcoal text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeBanners.map((banner, index) => (
          <div key={banner.id || index} className="min-w-full relative aspect-[16/9] sm:aspect-[21/9] max-h-[640px] flex items-center">
            
            {/* Background Image */}
            <img
              src={banner.image_url}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.72]"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content Box */}
            <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-12 sm:py-20">
              <div className="max-w-xl space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/30 border border-brand-pink/40 text-brand-softPink text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Exclusive Festive Collection</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                  {banner.title}
                </h1>

                {banner.subtitle && (
                  <p className="text-xs sm:text-base md:text-lg text-gray-200 line-clamp-2 max-w-md font-light">
                    {banner.subtitle}
                  </p>
                )}

                <div className="pt-2 sm:pt-4">
                  <Link
                    to={banner.target_url || '/products'}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs sm:text-sm font-bold tracking-wide shadow-elevated hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                  >
                    <span>{banner.button_text || 'Shop Now'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-brand-pink/80 text-white backdrop-blur-sm transition-all focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-brand-pink/80 text-white backdrop-blur-sm transition-all focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicators (Dots) */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {activeBanners.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => setCurrentSlide(dotIndex)}
                className={`transition-all duration-300 rounded-full ${
                  dotIndex === currentSlide
                    ? 'w-7 sm:w-8 h-2 bg-brand-pink'
                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};
