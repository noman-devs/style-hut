import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getAdminOrders, 
  updateOrderStatus, 
  updateOrderPaymentStatus, 
  cancelAndRestockOrder 
} from '../services/api';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { formatPrice, formatDate } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  AlertCircle, 
  X, 
  CreditCard,
  MapPin,
  RefreshCw,
  Phone
} from 'lucide-react';

export const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data);

      // Check if view query param was passed
      const viewId = searchParams.get('view');
      if (viewId) {
        const found = data.find(o => o.id === viewId);
        if (found) setSelectedOrder(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}`, 'success');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: status } : null);
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, status: PaymentStatus) => {
    try {
      await updateOrderPaymentStatus(orderId, status);
      showToast(`Payment status updated to ${status}`, 'success');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: status } : null);
      }
    } catch (e) {
      showToast('Error updating payment status', 'error');
    }
  };

  const handleCancelAndRestock = async (orderId: string) => {
    if (!window.confirm('Cancel this order and automatically restore stock into the warehouse?')) return;
    try {
      await cancelAndRestockOrder(orderId, 'Admin cancelled from dashboard');
      showToast('Order cancelled and inventory restored successfully', 'success');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: 'cancelled' } : null);
      }
    } catch (e: any) {
      showToast(e.message || 'Error restocking order', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.phone.includes(searchQuery) ||
                          (o.transaction_id && o.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Order Fulfillment & Verification
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Review customer orders, verify mobile banking payments, and manage shipment dispatch
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, customer name, phone, or TrxID..."
            className="w-full pl-9 pr-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-semibold text-brand-dark focus:bg-white focus:outline-none"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Order No</th>
                <th className="px-6 py-3.5">Customer & Phone</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Total (৳)</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-brand-softPink/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-dark">
                    {order.order_number}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-dark">{order.customer_name}</div>
                    <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-brand-rose" /> {order.phone}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-brand-muted">
                    {formatDate(order.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="uppercase font-bold text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded w-max">
                        {order.payment_method}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        order.payment_status === 'paid'
                          ? 'text-emerald-700'
                          : order.payment_status === 'awaiting_verification'
                          ? 'text-amber-700'
                          : order.payment_status === 'rejected'
                          ? 'text-rose-700'
                          : 'text-gray-600'
                      }`}>
                        {order.payment_status.replace('_', ' ')}
                      </span>
                      {order.transaction_id && (
                        <span className="text-[10px] font-mono text-brand-muted">
                          Trx: {order.transaction_id}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={order.order_status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border focus:outline-none ${
                        order.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : order.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-brand-softPink text-brand-rose border-brand-rose/30'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 font-serif font-bold text-brand-rose text-sm">
                    {formatPrice(order.total)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-brand-softPink text-brand-rose hover:bg-brand-pink hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & VERIFICATION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-rose">
                  Order Inspection
                </span>
                <h3 className="font-mono text-xl font-bold text-brand-dark">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-brand-ivory/50 rounded-2xl border border-brand-border/60 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-brand-dark">Customer Info:</span>
                <p className="text-sm font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-brand-muted">Phone: <span className="font-mono font-bold text-brand-dark">{selectedOrder.phone}</span></p>
                {selectedOrder.email && <p className="text-brand-muted">Email: {selectedOrder.email}</p>}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-brand-dark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-rose" /> Shipping Destination:
                </span>
                <p className="text-brand-dark leading-relaxed">{selectedOrder.shipping_address}</p>
                <p className="text-brand-muted">
                  {selectedOrder.area && `${selectedOrder.area}, `}
                  {selectedOrder.district && `${selectedOrder.district}, `}
                  {selectedOrder.division}
                </p>
              </div>
            </div>

            {/* Payment Verification Box */}
            <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-brand-dark flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-rose" /> Payment Verification
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                  selectedOrder.payment_status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedOrder.payment_status === 'awaiting_verification'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {selectedOrder.payment_status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p>Method: <strong className="uppercase">{selectedOrder.payment_method}</strong></p>
                {selectedOrder.transaction_id && (
                  <p>
                    Transaction ID (TrxID): <strong className="font-mono text-brand-rose text-sm bg-brand-softPink/60 px-2 py-0.5 rounded">{selectedOrder.transaction_id}</strong>
                  </p>
                )}
                {selectedOrder.sender_phone && (
                  <p>Sender Phone: <strong className="font-mono">{selectedOrder.sender_phone}</strong></p>
                )}
              </div>

              {/* Verification Actions */}
              {selectedOrder.payment_method !== 'cod' && selectedOrder.payment_status !== 'paid' && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, 'paid')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Payment (Mark Paid)</span>
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange(selectedOrder.id, 'rejected')}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Payment</span>
                  </button>
                </div>
              )}
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-brand-dark">Ordered Items</span>
              <div className="border border-brand-border rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brand-dark">{item.product_name}</p>
                      {item.variant_description && (
                        <p className="text-[11px] text-brand-muted">{item.variant_description}</p>
                      )}
                      <p className="text-[11px] font-mono text-gray-400">SKU: {item.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-dark">{formatPrice(item.unit_price)} × {item.quantity}</p>
                      <p className="font-serif font-bold text-brand-rose">{formatPrice(item.line_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculations */}
            <div className="pt-2 border-t border-brand-border space-y-1 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal:</span>
                <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Delivery Charge:</span>
                <span className="font-semibold">{formatPrice(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-dark pt-1 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="font-serif text-brand-rose">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Restock & Status Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-brand-border">
              {selectedOrder.order_status !== 'cancelled' && (
                <button
                  onClick={() => handleCancelAndRestock(selectedOrder.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cancel Order & Restock Inventory</span>
                </button>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-brand-dark text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
