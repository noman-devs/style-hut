import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackOrder } from '../services/api';
import { Order } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  AlertCircle,
  CreditCard 
} from 'lucide-react';

export const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('phone')) {
      handleSearch(new Event('submit') as any);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    if (e.preventDefault) e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await trackOrder(orderNumber.trim(), phone.trim());
      setOrder(res);
    } catch (err) {
      console.error(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>;
      case 'processing':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">Processing in Boutique</span>;
      case 'shipped':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">Shipped with Courier</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">Delivered</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">Pending Review</span>;
    }
  };

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid':
        return <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-bold border border-emerald-200">Payment Verified</span>;
      case 'awaiting_verification':
        return <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded font-bold border border-amber-200">Awaiting Admin Verification</span>;
      case 'rejected':
        return <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded font-bold border border-rose-200">Payment Rejected</span>;
      default:
        return <span className="text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded font-medium">Unpaid (COD)</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted">
          Enter your order number and phone number to see real-time preparation and delivery progress.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="e.g. SH-261025-A109B"
              className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-mono uppercase text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Billing Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-3 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <span>Searching records...</span> : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {searched && !loading && (
        <div>
          {order ? (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-soft space-y-6 animate-in fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
                <div>
                  <div className="text-xs text-brand-muted">Order Details</div>
                  <h2 className="font-mono text-xl font-bold text-brand-dark">{order.order_number}</h2>
                  <p className="text-xs text-brand-muted mt-0.5">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                  {getStatusBadge(order.order_status)}
                  <div className="text-xs">{getPaymentStatusBadge(order.payment_status)}</div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-4">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold block text-[11px]">Placed</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                      ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.order_status)
                        ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold block text-[11px]">Confirmed</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                      ['shipped', 'delivered'].includes(order.order_status)
                        ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="font-semibold block text-[11px]">Shipped</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                      order.order_status === 'delivered'
                        ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="font-semibold block text-[11px]">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-brand-border pt-4 space-y-3">
                <h3 className="font-serif text-sm font-bold text-brand-dark">Ordered Items</h3>
                <div className="divide-y divide-gray-100">
                  {order.order_items?.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-brand-dark">{item.product_name}</p>
                        {item.variant_description && (
                          <p className="text-[11px] text-brand-muted">{item.variant_description}</p>
                        )}
                        <p className="text-brand-rose font-bold">{formatPrice(item.unit_price)} × {item.quantity}</p>
                      </div>
                      <span className="font-bold text-brand-dark">{formatPrice(item.line_total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-border pt-4 text-xs">
                <div>
                  <h4 className="font-bold text-brand-dark flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-rose" /> Delivery Address
                  </h4>
                  <p className="text-brand-muted leading-relaxed">{order.shipping_address}</p>
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Delivery:</span>
                    <span>{formatPrice(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-brand-rose pt-1 border-t border-gray-100">
                    <span>Grand Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl border border-brand-border text-brand-muted space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-serif text-base font-bold text-brand-dark">No Order Found</h3>
              <p className="text-xs max-w-sm mx-auto">
                No matching order was found for order number <strong>{orderNumber}</strong> and phone <strong>{phone}</strong>. Please double check the details sent in your confirmation SMS or email.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
