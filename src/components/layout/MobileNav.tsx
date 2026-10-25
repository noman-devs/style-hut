import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export const MobileNav: React.FC = () => {
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border py-2 px-4 shadow-elevated">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-dark'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-dark'
            }`
          }
        >
          <Grid className="w-5 h-5" />
          <span>Shop</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-dark'
            }`
          }
        >
          <Heart className="w-5 h-5" />
          {totalWishlist > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-rose text-white text-[9px] font-bold flex items-center justify-center">
              {totalWishlist}
            </span>
          )}
          <span>Wishlist</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-dark'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-brand-pink text-white text-[9px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span>Cart</span>
        </NavLink>

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-dark'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
};
