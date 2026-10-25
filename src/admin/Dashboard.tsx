import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders, getProducts } from '../services/api';
import { Order, Product } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [ordList, prodList] = await Promise.all([
          getAdminOrders(),
          getProducts(),
        ]);
        setOrders(ordList);
        setProducts(prodList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  // Compute valid sales policy: orders that are not cancelled
  const totalSales = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockThreshold = 10;
  const lowStockCount = products.filter(p => {
    if (p.product_type === 'variable' && p.variants) {
      return p.variants.some(v => v.stock_quantity <= lowStockThreshold);
    }
    return p.stock_quantity <= lowStockThreshold;
  }).length;

  const outOfStockCount = products.filter(p => {
    if (p.product_type === 'variable' && p.variants) {
      return p.variants.every(v => v.stock_quantity <= 0);
    }
    return p.stock_quantity <= 0;
  }).length;

  return (
    <div className="space-y-8">
      
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Store Overview & Analytics
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time sales, order fulfillment, and inventory tracking for Style Hut
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 border border-brand-border bg-white hover:bg-brand-softPink/40 text-brand-dark text-xs font-semibold rounded-full transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 bg-brand-softPink text-brand-rose rounded-xl">
              <span className="font-serif font-bold text-sm">৳</span>
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-brand-dark">
              {formatPrice(totalSales)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> From non-cancelled orders
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-brand-dark">
              {totalOrders}
            </div>
            <p className="text-[11px] text-brand-muted mt-1">
              {pendingOrders} awaiting fulfillment
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-amber-700">
              {pendingOrders}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Requires confirmation & dispatch
            </p>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-rose-700">
              {lowStockCount}
            </div>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {outOfStockCount} completely sold out
            </p>
          </div>
        </div>

      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-brand-dark">
              Recent Orders
            </h2>
            <p className="text-xs text-brand-muted">Latest checkout submissions across Bangladesh</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-rose hover:text-brand-pink flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Order No</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-brand-softPink/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-dark">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-dark">{order.customer_name}</div>
                    <div className="text-[11px] text-brand-muted">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-brand-muted">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="uppercase font-bold text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      {order.payment_method}
                    </span>
                    <span className={`ml-2 text-[10px] font-semibold ${
                      order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {order.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      order.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.order_status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-brand-softPink text-brand-rose'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-serif font-bold text-brand-rose text-sm">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/orders?view=${order.id}`}
                      className="p-1.5 text-brand-dark hover:text-brand-rose inline-block"
                      title="Inspect Order"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
