import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './contexts/ToastContext';

// Storefront Layout & Pages
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Category } from './pages/Category';
import { Search } from './pages/Search';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { TrackOrder } from './pages/TrackOrder';
import { Wishlist } from './pages/Wishlist';
import { Account } from './pages/Account';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Policies } from './pages/Policies';
import { NotFound } from './pages/NotFound';

// Admin Layout & Pages
import { AdminLayout } from './admin/AdminLayout';
import { Dashboard as AdminDashboard } from './admin/Dashboard';
import { Products as AdminProducts } from './admin/Products';
import { ProductEditor as AdminProductEditor } from './admin/ProductEditor';
import { Categories as AdminCategories } from './admin/Categories';
import { Orders as AdminOrders } from './admin/Orders';
import { Inventory as AdminInventory } from './admin/Inventory';
import { Customers as AdminCustomers } from './admin/Customers';
import { Banners as AdminBanners } from './admin/Banners';
import { Payments as AdminPayments } from './admin/Payments';
import { Settings as AdminSettings } from './admin/Settings';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Routes>
                  {/* Customer Storefront */}
                  <Route path="/" element={<RootLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="product/:slug" element={<ProductDetails />} />
                    <Route path="category/:slug" element={<Category />} />
                    <Route path="search" element={<Search />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="account" element={<Account />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="policies/:policyType" element={<Policies />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin Portal */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductEditor />} />
                    <Route path="products/edit/:id" element={<AdminProductEditor />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
