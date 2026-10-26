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

const DEFAULT_COLOR_HEX: Record<string, string> = {
  pink: '#D6336C',
  'magenta pink': '#D6336C',
  rose: '#C2185B',
  'deep rose': '#A61E4D',
  'soft pink': '#FCE7EF',
  black: '#1F2937',
  white: '#FFFFFF',
  red: '#DC2626',
  blue: '#2563EB',
  'royal blue': '#1D4ED8',
  'navy blue': '#1E3A8A',
  green: '#16A34A',
  'emerald green': '#059669',
  'bottle green': '#0F5132',
  olive: '#556B2F',
  yellow: '#EAB308',
  mustard: '#D97706',
  maroon: '#800000',
  purple: '#7E22CE',
  ivory: '#FFF9F2',
  cream: '#FFFDD0',
  gold: '#C9A34E',
  silver: '#C0C0C0',
  grey: '#6B7280',
  gray: '#6B7280',
  orange: '#EA580C',
  peach: '#FFDAB9',
  teal: '#0D9488',
  burgundy: '#800020',
};

function isLightColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  return false;
}

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

          // If variable product, select initial active variant
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
  const colorHexMap: Record<string, string> = {};

  if (isVariable && product.variants) {
    product.variants.forEach(variant => {
      variant.attribute_values?.forEach(av => {
        if (!attributeGroups[av.attribute_name]) {
          attributeGroups[av.attribute_name] = [];
        }
        if (!attributeGroups[av.attribute_name].includes(av.value)) {
          attributeGroups[av.attribute_name].push(av.value);
        }
        if (av.color_hex && (av.attribute_name.toLowerCase().includes('colo') || av.color_hex.startsWith('#'))) {
          colorHexMap[av.value] = av.color_hex;
        }
      });
    });
  }

  const getColorHex = (name: string): string => {
    if (colorHexMap[name]) return colorHexMap[name];
    const lower = name.toLowerCase().trim();
    if (DEFAULT_COLOR_HEX[lower]) return DEFAULT_COLOR_HEX[lower];
    if (name.startsWith('#')) return name;
    return '#D6336C';
  };

  // Sort attribute group names: Color first, then Size, then others
  const sortedAttributeNames = Object.keys(attributeGroups).sort((a, b) => {
    const aIsColor = a.toLowerCase().includes('colo');
    const bIsColor = b.toLowerCase().includes('colo');
    if (aIsColor && !bIsColor) return -1;
    if (!aIsColor && bIsColor) return 1;

    const aIsSize = a.toLowerCase().includes('size');
    const bIsSize = b.toLowerCase().includes('size');
    if (aIsSize && !bIsSize) return -1;
    if (!aIsSize && bIsSize) return 1;

    return a.localeCompare(b);
  });

  const handleAttributeChange = (attributeName: string, value: string) => {
    if (!product.variants || product.variants.length === 0) return;

    const targetAttributes = { ...selectedAttributes, [attributeName]: value };

    // 1. Check for exact match with targetAttributes
    let matchedVariant = product.variants.find(v => {
      return Object.entries(targetAttributes).every(([attrKey, attrVal]) => {
        return v.attribute_values?.some(av => av.attribute_name === attrKey && av.value === attrVal);
      });
    });

    // 2. If no exact match (e.g. this size isn't available in current color), find best active variant with this value
    if (!matchedVariant) {
      matchedVariant = product.variants.find(v => {
        return v.is_active && v.stock_quantity > 0 && v.attribute_values?.some(av => av.attribute_name === attributeName && av.value === value);
      }) || product.variants.find(v => {
        return v.attribute_values?.some(av => av.attribute_name === attributeName && av.value === value);
      });
    }

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
      if (matchedVariant.image_url) {
        setSelectedImage(matchedVariant.image_url);
      }
      // Sync all attributes from the selected variant
      const syncedAttrs: Record<string, string> = {};
      matchedVariant.attribute_values?.forEach(av => {
        syncedAttrs[av.attribute_name] = av.value;
      });
      setSelectedAttributes(syncedAttrs);
      setQuantity(1);
    } else {
      setSelectedAttributes(targetAttributes);
    }
  };

  const checkOptionAvailability = (attrName: string, optionVal: string) => {
    if (!product.variants) return { exists: false, inStock: false };

    const isSize = attrName.toLowerCase().includes('size');

    // If it's a size option and a color is currently selected:
    if (isSize) {
      const currentColor = Object.entries(selectedAttributes).find(([k]) => k.toLowerCase().includes('colo'))?.[1];
      if (currentColor) {
        const specificVariant = product.variants.find(v => {
          const hasColor = v.attribute_values?.some(av => av.attribute_name.toLowerCase().includes('colo') && av.value === currentColor);
          const hasSize = v.attribute_values?.some(av => av.attribute_name.toLowerCase().includes('size') && av.value === optionVal);
          return hasColor && hasSize;
        });

        if (specificVariant) {
          return {
            exists: true,
            inStock: specificVariant.is_active && specificVariant.stock_quantity > 0,
            stock: specificVariant.stock_quantity,
          };
        }
      }
    }

    // General availability across variants having this attribute value
    const matchingVariants = product.variants.filter(v =>
      v.attribute_values?.some(av => av.attribute_name === attrName && av.value === optionVal)
    );

    const exists = matchingVariants.length > 0;
    const inStock = matchingVariants.some(v => v.is_active && v.stock_quantity > 0);
    return { exists, inStock };
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
          {isVariable && sortedAttributeNames.length > 0 && (
            <div className="space-y-5 pt-2">
              {sortedAttributeNames.map(attrName => {
                const options = attributeGroups[attrName];
                const isColor = attrName.toLowerCase().includes('colo');
                const isSize = attrName.toLowerCase().includes('size');
                const selectedVal = selectedAttributes[attrName];

                return (
                  <div key={attrName} className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                      <span className="flex items-center gap-1.5">
                        <span>Select {attrName}:</span>
                        <span className="font-bold text-brand-rose">{selectedVal}</span>
                      </span>
                      {isSize && (
                        <span className="text-[11px] text-brand-muted font-normal italic">
                          Standard BD boutique sizing
                        </span>
                      )}
                    </div>

                    {/* COLOR SWATCHES */}
                    {isColor ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {options.map(optionVal => {
                          const isSelected = selectedVal === optionVal;
                          const hex = getColorHex(optionVal);
                          const isLight = isLightColor(hex);
                          const { inStock } = checkOptionAvailability(attrName, optionVal);

                          return (
                            <button
                              key={optionVal}
                              type="button"
                              onClick={() => handleAttributeChange(attrName, optionVal)}
                              title={`${optionVal}${!inStock ? ' (Sold Out)' : ''}`}
                              className={`group relative flex items-center justify-center rounded-full transition-all duration-200 ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-brand-rose scale-110 shadow-md'
                                  : 'hover:scale-105 shadow-sm hover:shadow'
                              } ${!inStock ? 'opacity-50' : ''}`}
                              style={{ width: '38px', height: '38px' }}
                            >
                              <span
                                className="w-full h-full rounded-full border border-black/15 flex items-center justify-center transition-transform"
                                style={{ backgroundColor: hex }}
                              >
                                {isSelected && (
                                  <Check
                                    className={`w-4 h-4 stroke-[2.5] ${
                                      isLight ? 'text-brand-dark' : 'text-white'
                                    }`}
                                  />
                                )}
                                {!inStock && !isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="w-full h-[1.5px] bg-rose-500/80 rotate-45" />
                                  </span>
                                )}
                              </span>
                              <span className="sr-only">{optionVal}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : isSize ? (
                      /* SIZE BUTTONS */
                      <div className="flex flex-wrap items-center gap-2">
                        {options.map(optionVal => {
                          const isSelected = selectedVal === optionVal;
                          const { exists, inStock } = checkOptionAvailability(attrName, optionVal);

                          return (
                            <button
                              key={optionVal}
                              type="button"
                              onClick={() => handleAttributeChange(attrName, optionVal)}
                              className={`min-w-[3.25rem] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'bg-brand-rose text-white border-brand-rose shadow-sm ring-1 ring-brand-rose'
                                  : !exists
                                  ? 'bg-gray-50 text-gray-400 border-dashed border-gray-200 opacity-50'
                                  : !inStock
                                  ? 'bg-gray-50 text-gray-400 border-dashed border-gray-300 opacity-60 line-through'
                                  : 'bg-white hover:bg-brand-softPink/40 text-brand-dark border-brand-border shadow-sm'
                              }`}
                              title={!inStock ? 'Out of stock in this option' : undefined}
                            >
                              {optionVal}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* OTHER ATTRIBUTES */
                      <div className="flex flex-wrap items-center gap-2">
                        {options.map(optionVal => {
                          const isSelected = selectedVal === optionVal;
                          return (
                            <button
                              key={optionVal}
                              type="button"
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
                    )}
                  </div>
                );
              })}
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
