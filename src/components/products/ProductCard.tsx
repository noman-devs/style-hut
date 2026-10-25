import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { calculateDiscountPercentage, formatPrice } from '../../lib/utils';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const isWished = isInWishlist(product.id);
  const discountPct = calculateDiscountPercentage(product.regular_price, product.sale_price);
  
  // Primary image
  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const isVariable = product.product_type === 'variable' && product.variants && product.variants.length > 0;
  const isOutOfStock = product.stock_quantity <= 0 && (!isVariable || product.variants?.every(v => v.stock_quantity <= 0));

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWished) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVariable) {
      // Direct user to select size/color on details page
      navigate(`/product/${product.slug}`);
    } else {
      addToCart(product, undefined, 1);
      showToast(`Added ${product.name} to cart`, 'success');
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-brand-border/60 hover:border-brand-pink/40 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-ivory/50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPct && (
            <span className="px-2.5 py-1 bg-brand-rose text-white text-[11px] font-bold rounded-full shadow-sm tracking-tight">
              -{discountPct}% OFF
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 bg-brand-gold text-brand-dark text-[10px] font-bold rounded-full shadow-sm">
              Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 bg-gray-800 text-white text-[10px] font-bold rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 shadow-sm ${
            isWished
              ? 'bg-brand-rose text-white'
              : 'bg-white/90 backdrop-blur-sm text-brand-dark hover:text-brand-rose hover:bg-white'
          }`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-white' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay (Desktop) */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-brand-pink text-brand-dark hover:text-white rounded-xl text-xs font-bold shadow-elevated transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isVariable ? 'Select Options' : 'Add to Cart'}
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="p-2 bg-white/95 hover:bg-brand-softPink text-brand-dark rounded-xl text-xs shadow-elevated transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Variant Indicator */}
          <div className="flex items-center justify-between text-[11px] text-brand-muted mb-1 font-medium">
            <span className="uppercase tracking-wider">
              {product.category?.name || (isVariable ? 'Multi-Variant' : 'Ready to Wear')}
            </span>
            {isVariable && (
              <span className="text-[10px] text-brand-rose font-semibold bg-brand-softPink/60 px-1.5 py-0.5 rounded">
                Sizes & Colors
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-brand-pink transition-colors">
            <h3 className="font-medium text-sm text-brand-dark line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Stock info */}
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-rose font-serif">
              {formatPrice(product.sale_price ?? product.regular_price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden p-2 rounded-full bg-brand-softPink text-brand-rose hover:bg-brand-pink hover:text-white transition-colors disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
