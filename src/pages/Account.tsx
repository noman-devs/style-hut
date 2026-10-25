import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, Heart, LogOut, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 text-brand-muted mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Account Sign In</h2>
        <p className="text-xs text-brand-muted">Please sign in to view your orders and personal profile.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-full text-xs font-bold">
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-soft flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-brand-softPink text-brand-rose border border-brand-border flex items-center justify-center font-serif font-bold text-2xl">
          {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-brand-dark">
              {profile?.full_name || 'Valued Customer'}
            </h1>
            {isAdmin && (
              <span className="inline-block text-[11px] bg-brand-softPink text-brand-rose font-bold px-2.5 py-0.5 rounded-full border border-brand-rose/20">
                Administrator
              </span>
            )}
          </div>
          <p className="text-xs text-brand-muted flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {user.email}
          </p>
          {profile?.phone && (
            <p className="text-xs text-brand-muted flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {profile.phone}
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-brand-border hover:bg-gray-50 text-brand-dark rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="p-5 bg-white rounded-2xl border border-brand-border hover:border-brand-pink shadow-soft transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-brand-softPink/60 group-hover:bg-brand-softPink text-brand-rose rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-brand-dark">My Orders</h3>
            <p className="text-[11px] text-brand-muted">View order history & invoices</p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-5 bg-white rounded-2xl border border-brand-border hover:border-brand-pink shadow-soft transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-brand-softPink/60 group-hover:bg-brand-softPink text-brand-rose rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-brand-dark">My Wishlist</h3>
            <p className="text-[11px] text-brand-muted">Saved fashion favorites</p>
          </div>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="p-5 bg-brand-softPink/30 rounded-2xl border border-brand-rose/30 hover:border-brand-rose shadow-soft transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-brand-rose text-white rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-rose">Admin Panel</h3>
              <p className="text-[11px] text-brand-muted">Store management & orders</p>
            </div>
          </Link>
        )}
      </div>

    </div>
  );
};
