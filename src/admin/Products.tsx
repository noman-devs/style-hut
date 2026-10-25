import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, saveProduct } from '../services/api';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useToast } from '../contexts/ToastContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Sparkles, 
  Check, 
  X,
  Layers
} from 'lucide-react';

export const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadProducts = async () => {
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
    loadProducts();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) return;
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast(`Product "${productName}" deleted successfully`, 'success');
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    try {
      await saveProduct({ ...product, status: nextStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: nextStatus } : p));
      showToast(`Status updated to ${nextStatus}`, 'success');
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextFeatured = !product.featured;
    try {
      await saveProduct({ ...product, featured: nextFeatured });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: nextFeatured } : p));
      showToast(`Featured status updated`, 'success');
    } catch (err) {
      showToast('Error updating featured', 'error');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Product Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage your boutique products, variations, inventory, and pricing
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-5 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Price (BDT)</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Featured</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map(product => {
                const isVariable = product.product_type === 'variable' && product.variants && product.variants.length > 0;
                const totalStock = isVariable
                  ? product.variants!.reduce((sum, v) => sum + v.stock_quantity, 0)
                  : product.stock_quantity;
                const imgUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';

                return (
                  <tr key={product.id} className="hover:bg-brand-softPink/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-12 h-14 object-cover rounded-xl border border-brand-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="font-bold text-brand-dark hover:text-brand-pink text-xs line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        isVariable ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isVariable && <Layers className="w-3 h-3" />}
                        {isVariable ? `Variable (${product.variants!.length})` : 'Simple'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-serif font-bold text-brand-rose">
                        {formatPrice(product.sale_price ?? product.regular_price)}
                      </div>
                      {product.sale_price && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.regular_price)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold ${
                        totalStock <= 0 ? 'text-rose-600' : totalStock <= 5 ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {totalStock <= 0 ? 'Sold Out' : `${totalStock} units`}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1.5 rounded-full transition-colors ${
                          product.featured
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-400 hover:text-amber-600'
                        }`}
                        title={product.featured ? 'Unmark Featured' : 'Mark Featured'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase transition-colors ${
                          product.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {product.status}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-brand-dark"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-brand-rose"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
