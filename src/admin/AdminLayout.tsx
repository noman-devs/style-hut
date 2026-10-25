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
  Database 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin, toggleDemoAdmin } = useAuth();
  const { isSupabaseLive } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected route check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-card max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Admin Access Restricted</h1>
          <p className="text-xs text-brand-muted">
            You must be an authorized administrator to view this area.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => toggleDemoAdmin()}
              className="w-full py-2.5 px-4 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full transition-colors"
            >
              Activate Admin Demo Mode
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 border border-brand-border text-brand-dark hover:bg-gray-50 text-xs font-semibold rounded-full transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList className="w-4 h-4" /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Banners', path: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Payment Setup', path: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Website Settings', path: '/admin/settings', icon: <SettingsIcon className="w-4 h-4" /> },
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
            <span className="text-[9px] tracking-widest text-brand-rose font-bold uppercase">
              Admin Portal
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
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-brand-dark">
              <Database className="w-3.5 h-3.5 text-brand-rose" />
              <span>Database:</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isSupabaseLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isSupabaseLive ? 'Live PostgreSQL' : 'Local / Setup Mode'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-pink text-white shadow-sm'
                    : 'text-brand-dark/80 hover:bg-brand-softPink/50 hover:text-brand-rose'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
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
              navigate('/');
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
                <p className="font-bold text-brand-dark">{profile?.full_name || 'Administrator'}</p>
                <p className="text-[10px] text-brand-rose font-medium">Full Store Access</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-rose text-white flex items-center justify-center font-bold text-xs">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
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
