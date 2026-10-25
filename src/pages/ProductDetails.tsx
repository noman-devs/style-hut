import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug, getProducts } from '../services/api';
import { Product, ProductVariant } from '../types';
import { calculateDiscountPercentage, formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { ProductCard } from '../components/products/ProductCard';
import { 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  Minus, 
  Plus, 
  Sparkles,
  Zap
} from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');

          // If variable product, select initial variant
          if (prod.product_type === 'variable' && prod.variants && prod.variants.length > 0) {
            const firstActive = prod.variants.find(v => v.is_active && v.stock_quantity > 0) || prod.variants[0];
            setSelectedVariant(firstActive);
            if (firstActive.image_url) {
              setSelectedImage(firstActive.image_url);
            }
            // Populate selected attributes
            const attrs: Record<string, string> = {};
            firstActive.attribute_values?.forEach(av => {
              attrs[av.attribute_name] = av.value;
            });
            setSelectedAttributes(attrs);
          } else {
            setSelectedVariant(null);
            setSelectedAttributes({});
          }

          // Fetch related products
          const related = await getProducts({ categoryId: prod.category_id, limit: 4 });
          setRelatedProducts(related.filter(r => r.id !== prod.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setQuantity(1);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-brand-softPink/30 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-brand-softPink/30 rounded-lg w-3/4" />
            <div className="h-6 bg-brand-softPink/30 rounded-lg w-1/4" />
            <div className="h-24 bg-brand-softPink/30 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">Product Not Found</h2>
        <p className="text-brand-muted mt-2">The product you are looking for is no longer available.</p>
        <Link to="/products" className="mt-4 inline-block px-6 py-2 bg-brand-pink text-white rounded-full text-xs font-bold">
          Browse Catalog
        </Link>
      </div>
    );
  }

  // Active pricing and stock
  const isVariable = product.product_type === 'variable' && product.variants && product.variants.length > 0;
  const currentPrice = selectedVariant
    ? (selectedVariant.sale_price ?? selectedVariant.regular_price)
    : (product.sale_price ?? product.regular_price);
  const regularPrice = selectedVariant ? selectedVariant.regular_price : product.regular_price;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const currentSKU = selectedVariant?.sku || product.sku || 'SH-PRODUCT';
  const discountPct = calculateDiscountPercentage(regularPrice, currentPrice);
  const isOutOfStock = currentStock <= 0;
  const isWished = isInWishlist(product.id);

  // Group unique attribute options for variable products
  const attributeGroups: Record<string, string[]> = {};
  if (isVariable && product.variants) {
    product.variants.forEach(variant => {
      variant.attribute_values?.forEach(av => {
        if (!attributeGroups[av.attribute_name]) {
          attributeGroups[av.attribute_name] = [];
        }
        if (!attributeGroups[av.attribute_name].includes(av.value)) {
          attributeGroups[av.attribute_name].push(av.value);
        }
      });
    });
  }

  const handleAttributeChange = (attributeName: string, value: string) => {
    const updated = { ...selectedAttributes, [attributeName]: value };
    setSelectedAttributes(updated);

    // Find matching variant
    if (product.variants) {
      const match = product.variants.find(v => {
        return Object.entries(updated).every(([attrKey, attrVal]) => {
          return v.attribute_values?.some(av => av.attribute_name === attrKey && av.value === attrVal);
        });
      });
      if (match) {
        setSelectedVariant(match);
        if (match.image_url) {
          setSelectedImage(match.image_url);
        }
        setQuantity(1);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant || undefined, quantity, selectedAttributes);
    showToast(`Added ${quantity} × ${product.name} to cart`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant || undefined, quantity, selectedAttributes);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (isWished) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      showToast('Added to wishlist', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      
      {/* Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-brand-ivory border border-brand-border shadow-soft group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {discountPct && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-brand-rose text-white text-xs font-bold rounded-full shadow-md">
                -{discountPct}% OFF
              </span>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all ${
                isWished
                  ? 'bg-brand-rose text-white'
                  : 'bg-white/90 backdrop-blur-sm text-brand-dark hover:text-brand-rose hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === img.image_url ? 'border-brand-pink shadow-md' : 'border-brand-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6">
          
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
            <span className="uppercase tracking-wider text-brand-rose font-bold">
              {product.category?.name || 'Exclusive Boutique'}
            </span>
            <span className="font-mono bg-brand-ivory px-2 py-0.5 rounded border border-brand-border">
              SKU: {currentSKU}
            </span>
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark leading-tight">
            {product.name}
          </h1>

          {/* Price Box */}
          <div className="flex items-baseline gap-3 p-4 bg-brand-ivory/60 rounded-2xl border border-brand-border/60">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-brand-rose">
              {formatPrice(currentPrice)}
            </span>
            {regularPrice > currentPrice && (
              <span className="text-base text-gray-400 line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
            {discountPct && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Save {formatPrice(regularPrice - currentPrice)} ({discountPct}%)
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-brand-dark">Stock Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Out of Stock
              </span>
            ) : (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                In Stock ({currentStock} units available)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-brand-dark/80 leading-relaxed border-t border-b border-brand-border/60 py-4">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          {/* Variable Product Attribute Selectors (Size, Color) */}
          {isVariable && Object.keys(attributeGroups).length > 0 && (
            <div className="space-y-4 pt-2">
              {Object.entries(attributeGroups).map(([attrName, options]) => (
                <div key={attrName} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-brand-dark">
                    <span>Select {attrName}:</span>
                    <span className="text-brand-rose">{selectedAttributes[attrName]}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {options.map(optionVal => {
                      const isSelected = selectedAttributes[attrName] === optionVal;
                      return (
                        <button
                          key={optionVal}
                          onClick={() => handleAttributeChange(attrName, optionVal)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-brand-rose text-white border-brand-rose shadow-sm'
                              : 'bg-white hover:bg-brand-softPink/40 text-brand-dark border-brand-border'
                          }`}
                        >
                          {optionVal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Controls & Action Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-brand-dark">Quantity:</span>
              <div className="flex items-center border border-brand-border rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-brand-dark hover:bg-brand-softPink/50 transition-colors rounded-l-xl"
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-brand-dark min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2.5 text-brand-dark hover:bg-brand-softPink/50 transition-colors rounded-r-xl"
                  disabled={quantity >= currentStock || isOutOfStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-sm font-bold shadow-elevated transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-6 rounded-full bg-brand-dark hover:bg-black text-white text-sm font-bold shadow-elevated transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-brand-gold" />
                <span>Buy Now (Express)</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 bg-brand-ivory/50 rounded-2xl border border-brand-border/60 space-y-2 text-xs text-brand-dark/90">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-rose flex-shrink-0" />
              <span><strong>Cash on Delivery (COD)</strong> available throughout all 64 districts</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-rose flex-shrink-0" />
              <span><strong>7-Day Hassle-Free Return</strong> & Size Exchange guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-rose flex-shrink-0" />
              <span><strong>100% Authentic Fabric</strong> crafted by master weavers</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-brand-border">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-rose mb-2">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Complete the Look</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-8">
            You May Also Admire
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
