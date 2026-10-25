import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-brand-softPink rounded-full flex items-center justify-center mx-auto text-brand-rose">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">Your Wishlist is Empty</h1>
        <p className="text-sm text-brand-muted max-w-sm mx-auto">
          Save your favorite sarees, festive kurtis and jewellery to review or buy later.
        </p>
        <Link
          to="/products"
          className="inline-block px-8 py-3 bg-brand-pink hover:bg-brand-rose text-white text-sm font-bold rounded-full shadow-md transition-colors"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Handpicked fashion pieces saved for your wardrobe
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs sm:text-sm font-semibold text-brand-rose hover:text-brand-pink flex items-center gap-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};
