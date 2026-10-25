import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../lib/utils';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-brand-border">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-brand-ivory/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-pink" />
              <h2 className="font-serif text-lg font-bold text-brand-dark">
                Shopping Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-brand-softPink/50 text-brand-dark transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-softPink/60 flex items-center justify-center text-brand-rose">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark">Your Bag is Empty</h3>
                  <p className="text-sm text-brand-muted mt-1 max-w-xs">
                    Explore our exclusive Sarees, Salwar Kameez, Kurtis and lifestyle collections.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-sm font-semibold rounded-full shadow-sm transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => {
                const itemPrice = item.variant
                  ? (item.variant.sale_price ?? item.variant.regular_price)
                  : (item.product.sale_price ?? item.product.regular_price);
                const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
                const imgUrl = item.variant?.image_url || item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80';

                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img
                      src={imgUrl}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-xl border border-brand-border flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-brand-dark line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variant Attributes */}
                        {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.selected_attributes).map(([attr, val]) => (
                              <span
                                key={attr}
                                className="text-[11px] bg-brand-softPink/60 text-brand-rose px-2 py-0.5 rounded-md font-medium"
                              >
                                {attr}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 text-sm font-bold text-brand-rose">
                          {formatPrice(itemPrice)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-brand-border rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-brand-softPink/40 text-brand-dark transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-brand-dark min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-1.5 hover:bg-brand-softPink/40 text-brand-dark transition-colors disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-brand-dark">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-ivory/40 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-brand-muted text-xs">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-dark text-sm">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-muted text-xs">
                  <span>Estimated Delivery</span>
                  <span>Inside Dhaka: ৳70 | Outside: ৳130</span>
                </div>
              </div>

              <div className="border-t border-brand-border/60 pt-2 flex justify-between font-bold text-base text-brand-dark">
                <span>Total Amount</span>
                <span className="text-brand-rose font-serif text-lg">{formatPrice(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-3 rounded-full border border-brand-border hover:bg-white text-xs font-semibold text-brand-dark transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-3 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
