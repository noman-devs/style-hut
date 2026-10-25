import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  Database
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { getProducts } from '../../services/api';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, profile, isAdmin, logout, toggleDemoAdmin } = useAuth();
  const { settings, categories, isSupabaseLive } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Live search debouncer
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await getProducts({ search: searchQuery.trim(), limit: 5 });
      setSearchResults(results);
      setShowSearchDropdown(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border/60 shadow-soft">
      {/* 1. TOP ANNOUNCEMENT STRIP */}
      <div className="bg-gradient-to-r from-brand-rose via-brand-pink to-brand-rose text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span className="font-medium tracking-wide">
              Festive Season Offer: Free Delivery inside Dhaka on orders above ৳3,000!
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 opacity-90">
              <Phone className="w-3 h-3" /> {settings.phone}
            </span>
            <div className="h-3 w-px bg-white/30" />
            
            {/* Database indicator */}
            <div className="flex items-center gap-1.5" title={isSupabaseLive ? 'Connected to live Supabase database' : 'Running in local reactive mode (Connect Supabase in .env)'}>
              <Database className="w-3 h-3 text-brand-gold" />
              <span className="text-[11px] bg-black/25 px-2 py-0.5 rounded-full font-mono">
                {isSupabaseLive ? 'Supabase: Live' : 'Supabase: Setup Mode'}
              </span>
            </div>

            {/* Quick Demo Admin Switcher */}
            <button
              onClick={toggleDemoAdmin}
              className="text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-brand-gold" />
              {isAdmin ? 'Admin Mode: ON' : 'Switch to Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Search, Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-brand-dark hover:text-brand-pink transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-start select-none group">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-dark group-hover:text-brand-pink transition-colors">
                STYLE <span className="text-brand-pink">HUT</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-brand-muted uppercase font-semibold">
              Be Your Own Style
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Sarees, Salwar Kameez, Kurtis, Jewellery..."
                className="w-full pl-11 pr-24 py-2.5 bg-brand-ivory/60 hover:bg-brand-ivory border border-brand-border focus:border-brand-pink focus:bg-white rounded-full text-sm text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-medium rounded-full transition-colors shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Live Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-brand-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                <div className="p-2 border-b border-gray-100 text-xs font-semibold text-brand-muted uppercase tracking-wider px-3">
                  Matching Products ({searchResults.length})
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {searchResults.map(prod => (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.slug}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center gap-3 p-3 hover:bg-brand-softPink/30 transition-colors"
                    >
                      <img
                        src={prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                        alt={prod.name}
                        className="w-12 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-brand-dark truncate">{prod.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-brand-rose">
                            {formatPrice(prod.sale_price ?? prod.regular_price)}
                          </span>
                          {prod.sale_price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(prod.regular_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSearchDropdown(false)}
                  className="block text-center py-2.5 bg-brand-ivory hover:bg-brand-softPink text-xs font-semibold text-brand-rose transition-colors"
                >
                  View all results for "{searchQuery}" →
                </Link>
              </div>
            )}
          </div>

          {/* Action Icons (Wishlist, Cart, Account) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-brand-dark hover:text-brand-pink transition-colors rounded-full hover:bg-brand-softPink/50"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalWishlist > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-rose text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-brand-dark hover:text-brand-pink transition-colors rounded-full hover:bg-brand-softPink/50"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 text-brand-dark hover:text-brand-pink transition-colors rounded-full hover:bg-brand-softPink/50 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center font-bold text-xs border border-brand-border">
                  {user ? (profile?.full_name?.charAt(0).toUpperCase() || 'U') : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-brand-muted hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-brand-muted">Signed in as</p>
                        <p className="text-sm font-semibold text-brand-dark truncate">
                          {profile?.full_name || user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] bg-brand-softPink text-brand-rose px-2 py-0.5 rounded-full font-bold">
                            Administrator
                          </span>
                        )}
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                      >
                        My Account & Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                      >
                        Order History
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                      >
                        Track Order Status
                      </Link>

                      {isAdmin && (
                        <div className="border-t border-gray-100 my-1 pt-1">
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-rose hover:bg-brand-softPink/60"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-brand-muted">Welcome to Style Hut</p>
                        <p className="text-sm font-medium text-brand-dark">Sign in to track orders</p>
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40 font-medium"
                      >
                        Customer Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                      >
                        Create New Account
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                      >
                        Track Guest Order
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-rose hover:bg-brand-softPink/50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fashion, sarees, kurtis..."
              className="w-full pl-10 pr-20 py-2 bg-brand-ivory border border-brand-border focus:border-brand-pink rounded-full text-xs text-brand-dark placeholder-brand-muted focus:outline-none"
            />
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-pink text-white text-[11px] font-medium rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. CATEGORY NAVIGATION BAR */}
      <nav className="bg-brand-ivory/80 border-t border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-6 overflow-x-auto py-2.5 scrollbar-none text-xs sm:text-sm font-medium">
            <Link
              to="/products"
              className="whitespace-nowrap px-3 py-1 rounded-full text-brand-dark hover:text-brand-pink hover:bg-white transition-all font-semibold"
            >
              All Products
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="whitespace-nowrap px-3 py-1 rounded-full text-brand-dark hover:text-brand-pink hover:bg-white transition-all"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products?featured=true"
              className="whitespace-nowrap px-3 py-1 rounded-full text-brand-rose bg-brand-softPink/60 hover:bg-brand-softPink transition-all font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Special Offers
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE SLIDE-OUT MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <span className="font-serif text-xl font-bold text-brand-dark">
                STYLE <span className="text-brand-pink">HUT</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-brand-dark"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold rounded-lg text-brand-dark hover:bg-brand-softPink/40"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold rounded-lg text-brand-dark hover:bg-brand-softPink/40"
              >
                All Products
              </Link>
              <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                Categories
              </div>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm rounded-lg text-brand-dark hover:bg-brand-softPink/40 pl-5"
                >
                  {cat.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-brand-border">
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-brand-dark hover:bg-brand-softPink/40"
                >
                  Track Order
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-brand-rose hover:bg-brand-softPink/40"
                >
                  Admin Portal
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border text-xs text-brand-muted space-y-1">
              <p>Hotline: {settings.phone}</p>
              <p>Email: {settings.email}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
