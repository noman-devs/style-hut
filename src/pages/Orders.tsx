import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminOrders } from '../services/api';
import { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { Package, ArrowRight, Eye, ShoppingBag } from 'lucide-react';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      setLoading(true);
      try {
        const all = await getAdminOrders();
        // If authenticated, show user's orders or recent orders
        if (user) {
          setOrders(all.filter(o => o.email === user.email || !o.user_id));
        } else {
          setOrders(all.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUserOrders();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Track and review your past purchases with Style Hut
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

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(n => (
            <div key={n} className="h-32 bg-white rounded-3xl border border-brand-border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-brand-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-brand-dark">No Orders Placed Yet</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Once you complete a purchase, your order history and tracking updates will appear here.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-full text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-rose" />
                    <span className="font-mono font-bold text-sm text-brand-dark">{order.order_number}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.order_status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-brand-softPink text-brand-rose'
                  }`}>
                    {order.order_status}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    order.payment_status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {order.payment_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="divide-y divide-gray-50">
                {order.order_items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <span className="font-medium text-brand-dark">{item.product_name}</span>
                      {item.variant_description && (
                        <span className="text-[11px] text-brand-muted ml-2">({item.variant_description})</span>
                      )}
                      <span className="text-brand-muted ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-dark">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-muted">Total: </span>
                  <span className="font-serif font-bold text-brand-rose text-base">{formatPrice(order.total)}</span>
                </div>

                <Link
                  to={`/track-order?order=${order.order_number}&phone=${encodeURIComponent(order.phone)}`}
                  className="px-4 py-1.5 rounded-full border border-brand-border hover:bg-brand-softPink/50 text-brand-dark text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Live</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
