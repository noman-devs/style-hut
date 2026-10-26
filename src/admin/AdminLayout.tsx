import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  ClipboardList, 
  Boxes, 
  Users, 
  Image as ImageIcon, 
  CreditCard, 
  Settings as SettingsIcon, 
  Store, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Database,
  Palette,
  UserCheck,
  Lock,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin, isSuperAdmin, login } = useAuth();
  const { isSupabaseLive } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inline Admin Login Form states if not authenticated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Invalid credentials. Access restricted to authorized administrators.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An authentication error occurred');
    } finally {
      setLoginLoading(false);
    }
  };

  // Protected route check - strictly require administrator authentication
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-card max-w-md w-full space-y-6 animate-in fade-in">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-brand-dark">Style Hut Admin Portal</h1>
            <p className="text-xs text-brand-muted">
              Please enter your authorized administrator credentials to proceed.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Admin Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="sohel229229@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
                <UserIcon className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-elevated transition-colors flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Verifying...' : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-brand-border/60">
            <Link
              to="/"
              className="text-xs text-brand-muted hover:text-brand-dark transition-colors inline-block"
            >
              ← Return to Customer Storefront
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Colours & Sizes', path: '/admin/attributes', icon: <Palette className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList className="w-4 h-4" /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Banners', path: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Payment Setup', path: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Website Settings', path: '/admin/settings', icon: <SettingsIcon className="w-4 h-4" /> },
    ...(isSuperAdmin ? [
      { name: 'Admins & Staff', path: '/admin/admins', icon: <UserCheck className="w-4 h-4" /> }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="font-serif text-xl font-bold tracking-tight text-brand-dark">
              STYLE <span className="text-brand-pink">HUT</span>
            </span>
            <span className="text-[9px] tracking-widest text-brand-rose font-bold uppercase flex items-center gap-1">
              <span>{isSuperAdmin ? 'Super Admin Portal' : 'Admin Portal'}</span>
              {isSuperAdmin && <ShieldCheck className="w-3 h-3 text-brand-gold" />}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Pill */}
        <div className="px-5 py-3 border-b border-brand-border/60 bg-brand-ivory/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-brand-gold'}`} />
            <span className="text-[11px] font-semibold text-brand-dark flex items-center gap-1">
              <Database className="w-3 h-3 text-brand-muted" />
              {isSupabaseLive ? 'Supabase PostgreSQL (Live)' : 'Local Storage Mode'}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-rose text-white shadow-soft font-bold'
                    : 'text-brand-dark hover:bg-brand-softPink/40 hover:text-brand-rose'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile & Sign Out Footer */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-dark hover:bg-brand-softPink/40 rounded-xl transition-colors"
          >
            <Store className="w-4 h-4 text-brand-pink" />
            <span>Customer Storefront</span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate('/login?admin=1');
            }}
            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-brand-border px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs font-semibold text-brand-muted">
              Dhaka Time: <span className="text-brand-dark font-mono font-bold">{new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-right">
              <div>
                <p className="font-bold text-brand-dark">{profile?.full_name || user?.email || 'Administrator'}</p>
                <div className="flex items-center justify-end gap-1">
                  {isSuperAdmin ? (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      SUPER ADMIN
                    </span>
                  ) : (
                    <span className="text-[10px] bg-brand-softPink text-brand-rose border border-brand-rose/30 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-brand-rose" />
                      REGULAR ADMIN
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                isSuperAdmin ? 'bg-brand-rose text-white shadow-sm' : 'bg-brand-softPink text-brand-rose'
              }`}>
                {(profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
