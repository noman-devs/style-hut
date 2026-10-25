import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import { createOrder } from '../services/api';
import { formatPrice } from '../lib/utils';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShoppingBag,
  Info
} from 'lucide-react';

const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { paymentSettings } = useStore();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment selection
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-brand-muted mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Your Bag is Empty</h2>
        <p className="text-sm text-brand-muted">Please add products to your bag before checking out.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-full text-xs font-bold">
          Start Shopping
        </Link>
      </div>
    );
  }

  const deliveryFee = division.toLowerCase() === 'dhaka' ? 70 : 130;
  const grandTotal = subtotal + deliveryFee;

  const activePaymentConfig = paymentSettings.find(p => p.provider === paymentMethod);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid Bangladeshi phone number (e.g., 01712345678)');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage('Please provide your full delivery address (House, Road, Area)');
      return;
    }

    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
      if (!transactionId.trim()) {
        setErrorMessage(`Please enter your ${paymentMethod.toUpperCase()} Transaction ID after completing the payment.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        division,
        district: district.trim(),
        area: area.trim(),
        shipping_address: shippingAddress.trim(),
        notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim() || undefined,
        sender_phone: senderPhone.trim() || undefined,
        items: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const result = await createOrder(orderPayload);

      if (result.success) {
        clearCart();
        setCompletedOrder({
          orderNumber: result.order_number,
          total: result.total,
        });
        showToast('Your order has been placed successfully!', 'success');
      } else {
        setErrorMessage(result.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while processing your order. Please check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION MODAL / VIEW
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft animate-in zoom-in">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-rose">Order Placed</span>
          <h1 className="font-serif text-3xl font-bold text-brand-dark">Thank You For Your Order!</h1>
          <p className="text-sm text-brand-muted max-w-md mx-auto">
            We have received your order. Our Dhaka team will inspect and prepare your boutique package shortly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft text-left space-y-3 max-w-md mx-auto">
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-brand-muted">Order Reference:</span>
            <span className="font-mono font-bold text-brand-dark text-sm">{completedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-brand-muted">Total Payable:</span>
            <span className="font-serif font-bold text-brand-rose text-base">{formatPrice(completedOrder.total)}</span>
          </div>
          <div className="flex justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-brand-muted">Payment Method:</span>
            <span className="font-semibold text-brand-dark uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs py-1">
            <span className="text-brand-muted">Estimated Delivery:</span>
            <span className="font-semibold text-brand-dark">
              {division.toLowerCase() === 'dhaka' ? '24–48 Hours (Dhaka)' : '3–5 Days (Nationwide)'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/track-order?order=${completedOrder.orderNumber}&phone=${encodeURIComponent(phone)}`}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold transition-colors shadow-sm"
          >
            Track Order Live
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-brand-border hover:bg-white text-brand-dark text-xs font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="pb-4 border-b border-brand-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Checkout & Shipping
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Review your address and complete payment securely.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer Information & Delivery Address */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Customer Details */}
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-softPink text-brand-rose text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>Delivery Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Phone Number (Bangladesh) *
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

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="for order updates & receipts"
                className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Division *
                </label>
                <select
                  value={division}
                  onChange={e => {
                    setDivision(e.target.value);
                    if (e.target.value !== 'Dhaka') {
                      setDistrict(e.target.value);
                    } else {
                      setDistrict('Dhaka');
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                >
                  {BD_DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  District / City *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Dhaka / Gazipur"
                  className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Area / Thana *
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Banani, Uttara"
                  className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Full Street Address *
              </label>
              <textarea
                required
                rows={2}
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="House number, Road number, Sector/Block, Landmark details"
                className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Specific delivery timing or instructions for rider"
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none"
              />
            </div>

          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-softPink text-brand-rose text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>Payment Option</span>
            </h2>

            {/* Payment Method Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-pink bg-brand-softPink/50 font-bold text-brand-rose shadow-sm'
                    : 'border-brand-border hover:bg-gray-50 text-brand-dark'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <div className="text-xs font-bold">Cash on Delivery</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50 font-bold text-pink-700 shadow-sm'
                    : 'border-brand-border hover:bg-gray-50 text-brand-dark'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-pink-600" />
                <div className="text-xs font-bold">bKash</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50 font-bold text-orange-700 shadow-sm'
                    : 'border-brand-border hover:bg-gray-50 text-brand-dark'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <div className="text-xs font-bold">Nagad</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('rocket')}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'rocket'
                    ? 'border-purple-600 bg-purple-50 font-bold text-purple-700 shadow-sm'
                    : 'border-brand-border hover:bg-gray-50 text-brand-dark'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <div className="text-xs font-bold">Rocket</div>
              </button>
            </div>

            {/* Mobile Banking Instructions & Transaction ID Input */}
            {paymentMethod !== 'cod' && (
              <div className="p-4 bg-brand-ivory/70 rounded-2xl border border-brand-border/80 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-xs text-brand-dark">
                  <Info className="w-4 h-4 text-brand-rose flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      {paymentMethod.toUpperCase()} Account Number: <span className="font-mono text-brand-rose">{activePaymentConfig?.payment_number || '01711-987654'}</span>
                    </p>
                    <p className="text-brand-muted">
                      Account Type: {activePaymentConfig?.account_type || 'Personal'}
                    </p>
                    <p className="text-brand-dark/80 whitespace-pre-line leading-relaxed text-[11px] pt-1">
                      {activePaymentConfig?.instructions || `Send Money ৳${grandTotal} to the number above, then copy & paste your Transaction ID below.`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1">
                      {paymentMethod.toUpperCase()} Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 9J28A1KL"
                      className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-mono uppercase text-brand-dark focus:outline-none focus:border-brand-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1">
                      Sender Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                      placeholder="Number used to send money"
                      className="w-full px-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" /> Cash on Delivery Selected
                </p>
                <p className="text-[11px] text-emerald-700">
                  You can pay the full amount of <strong>{formatPrice(grandTotal)}</strong> directly to the courier delivery agent upon receiving your items.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-brand-dark border-b border-brand-border pb-3">
              Order Summary ({items.length})
            </h2>

            {/* Items Mini List */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {items.map(item => {
                const price = item.variant
                  ? (item.variant.sale_price ?? item.variant.regular_price)
                  : (item.product.sale_price ?? item.product.regular_price);
                return (
                  <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                    <img
                      src={item.variant?.image_url || item.product.images?.[0]?.image_url}
                      alt=""
                      className="w-12 h-14 object-cover rounded-lg border border-brand-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-dark truncate">{item.product.name}</p>
                      {item.selected_attributes && (
                        <p className="text-[10px] text-brand-muted truncate">
                          {Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                      <p className="text-brand-rose font-bold">{formatPrice(price)} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-brand-dark">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-brand-border text-xs">
              <div className="flex justify-between text-brand-dark">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-dark">
                <span>Delivery Charge ({division.toLowerCase() === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-bold">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-brand-border font-bold text-base text-brand-dark">
                <span>Total Amount</span>
                <span className="font-serif text-2xl text-brand-rose font-bold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-sm font-bold shadow-elevated transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Placing Order Securely...</span>
              ) : (
                <>
                  <span>Place Order ({formatPrice(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-brand-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bangladeshi verified transaction with invoice & SMS support</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
