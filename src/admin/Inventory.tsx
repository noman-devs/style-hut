import React, { useEffect, useState } from 'react';
import { getProducts, saveProduct } from '../services/api';
import { Product } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Boxes, AlertTriangle, Search, Save, CheckCircle2 } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateSimpleStock = async (product: Product, newStock: number) => {
    try {
      await saveProduct({ ...product, stock_quantity: newStock });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: newStock } : p));
      showToast(`Stock updated for ${product.name}`, 'success');
    } catch (e) {
      showToast('Error updating stock', 'error');
    }
  };

  const handleUpdateVariantStock = async (product: Product, variantId: string, newStock: number) => {
    if (!product.variants) return;
    const updatedVariants = product.variants.map(v => v.id === variantId ? { ...v, stock_quantity: newStock } : v);
    try {
      await saveProduct({ ...product, variants: updatedVariants });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, variants: updatedVariants } : p));
      showToast(`Variant stock updated`, 'success');
    } catch (e) {
      showToast('Error updating variant stock', 'error');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterLowStock) {
      const hasLowVariant = p.variants?.some(v => v.stock_quantity <= 8);
      const isSimpleLow = p.stock_quantity <= 8;
      return matchesSearch && (hasLowVariant || isSimpleLow);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Inventory & Warehouse Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time stock level monitoring across simple products and variant combinations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search warehouse items by title or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterLowStock
              ? 'bg-rose-600 text-white shadow-sm'
              : 'border border-brand-border text-brand-dark hover:bg-brand-softPink/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock (≤ 8 items)</span>
        </button>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filtered.map(product => {
          const isVariable = product.product_type === 'variable' && product.variants && product.variants.length > 0;

          return (
            <div key={product.id} className="bg-white p-5 rounded-3xl border border-brand-border shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-12 h-14 object-cover rounded-xl border border-brand-border flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-brand-dark">{product.name}</h3>
                    <p className="text-[11px] font-mono text-brand-muted">SKU: {product.sku || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    isVariable ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isVariable ? `Variable (${product.variants!.length} sizes/colors)` : 'Simple Product'}
                  </span>
                </div>
              </div>

              {/* Simple Product Stock */}
              {!isVariable ? (
                <div className="flex items-center justify-between p-3 bg-brand-ivory/50 rounded-2xl text-xs">
                  <div>
                    <span className="font-semibold text-brand-dark">Direct Stock:</span>
                    <span className="text-[11px] text-brand-muted ml-2">Units in Dhaka showroom/hub</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={product.stock_quantity}
                      onBlur={e => handleUpdateSimpleStock(product, Number(e.target.value))}
                      className="w-20 px-3 py-1 bg-white border border-brand-border rounded-lg text-xs font-bold text-center"
                    />
                    <span className="text-brand-muted font-medium">units</span>
                  </div>
                </div>
              ) : (
                /* Variable Product Variations Stock Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
                      <tr>
                        <th className="px-4 py-2.5">Variation</th>
                        <th className="px-4 py-2.5">Variation SKU</th>
                        <th className="px-4 py-2.5">Current Stock</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {product.variants!.map(variant => (
                        <tr key={variant.id}>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {variant.attribute_values?.map(a => (
                                <span key={a.attribute_name} className="bg-brand-softPink/60 text-brand-rose text-[10px] px-2 py-0.5 rounded font-bold">
                                  {a.attribute_name}: {a.value}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-brand-muted uppercase">
                            {variant.sku}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                defaultValue={variant.stock_quantity}
                                onBlur={e => handleUpdateVariantStock(product, variant.id, Number(e.target.value))}
                                className="w-20 px-2.5 py-1 bg-white border border-brand-border rounded-lg text-xs font-bold text-center"
                              />
                              <span className="text-brand-muted text-[11px]">units</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              variant.stock_quantity <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : variant.stock_quantity <= 8
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {variant.stock_quantity <= 0 ? 'Out of Stock' : variant.stock_quantity <= 8 ? 'Low Stock' : 'Good'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
