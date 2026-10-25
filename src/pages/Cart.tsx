import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');

  const deliveryFee = deliveryArea === 'dhaka' ? 70 : 130;
  const grandTotal = subtotal + (items.length > 0 ? deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-brand-softPink rounded-full flex items-center justify-center mx-auto text-brand-rose">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">Your Cart is Empty</h1>
        <p className="text-sm text-brand-muted max-w-sm mx-auto">
          You haven't added any boutique pieces to your shopping bag yet.
        </p>
        <Link
          to="/products"
          className="inline-block px-8 py-3 bg-brand-pink hover:bg-brand-rose text-white text-sm font-bold rounded-full shadow-md transition-colors"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-brand-rose hover:underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-brand-border divide-y divide-gray-100 overflow-hidden shadow-soft">
            {items.map(item => {
              const unitPrice = item.variant
                ? (item.variant.sale_price ?? item.variant.regular_price)
                : (item.product.sale_price ?? item.product.regular_price);
              const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
              const imgUrl = item.variant?.image_url || item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80';

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  <img
                    src={imgUrl}
                    alt={item.product.name}
                    className="w-24 h-28 object-cover rounded-2xl border border-brand-border flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm sm:text-base font-semibold text-brand-dark hover:text-brand-pink transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>

                    {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 py-1">
                        {Object.entries(item.selected_attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-[11px] bg-brand-softPink/60 text-brand-rose px-2 py-0.5 rounded-md font-medium"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sm font-bold text-brand-rose">
                      {formatPrice(unitPrice)}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border border-brand-border rounded-xl bg-brand-ivory/40">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-brand-dark hover:bg-white rounded-l-xl transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-brand-dark min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        className="p-2 text-brand-dark hover:bg-white rounded-r-xl transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm sm:text-base font-bold text-brand-dark font-serif min-w-[5rem] text-right">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-soft space-y-6">
            <h2 className="font-serif text-lg font-bold text-brand-dark border-b border-brand-border pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-brand-dark">
                <span>Subtotal</span>
                <span className="font-bold text-sm">{formatPrice(subtotal)}</span>
              </div>

              {/* Delivery Zone Selector */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="font-semibold text-brand-dark">Delivery Zone:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryArea('dhaka')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryArea === 'dhaka'
                        ? 'border-brand-pink bg-brand-softPink/40 font-bold text-brand-rose'
                        : 'border-brand-border hover:bg-gray-50 text-brand-muted'
                    }`}
                  >
                    <div>Inside Dhaka</div>
                    <div className="text-[11px] font-semibold mt-0.5">৳70</div>
                  </button>
                  <button
                    onClick={() => setDeliveryArea('outside')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      deliveryArea === 'outside'
                        ? 'border-brand-pink bg-brand-softPink/40 font-bold text-brand-rose'
                        : 'border-brand-border hover:bg-gray-50 text-brand-muted'
                    }`}
                  >
                    <div>Outside Dhaka</div>
                    <div className="text-[11px] font-semibold mt-0.5">৳130</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-brand-dark pt-2 border-t border-gray-100">
                <span>Delivery Charge</span>
                <span className="font-bold">{formatPrice(deliveryFee)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-brand-border text-brand-dark">
                <span className="text-sm font-bold">Estimated Grand Total</span>
                <span className="font-serif text-xl font-bold text-brand-rose">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-sm font-bold shadow-elevated transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-brand-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
