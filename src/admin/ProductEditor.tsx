import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductBySlug, getProducts, getCategories, saveProduct } from '../services/api';
import { Category, Product, ProductType, ProductVariant } from '../types';
import { useToast } from '../contexts/ToastContext';
import { slugify } from '../lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Layers, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProductEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isEditing = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productType, setProductType] = useState<ProductType>('simple');
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [featured, setFeatured] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  
  // Images (URLs)
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variations for Variable Product
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: 'var-temp-1',
      product_id: '',
      sku: 'SH-VAR-S-PINK',
      regular_price: 2450,
      sale_price: 1950,
      stock_quantity: 10,
      is_active: true,
      attribute_values: [
        { attribute_id: 'size', attribute_name: 'Size', value_id: 's', value: 'Small (S)' },
        { attribute_id: 'color', attribute_name: 'Color', value_id: 'pink', value: 'Blush Pink' },
      ]
    },
    {
      id: 'var-temp-2',
      product_id: '',
      sku: 'SH-VAR-M-PINK',
      regular_price: 2450,
      sale_price: 1950,
      stock_quantity: 12,
      is_active: true,
      attribute_values: [
        { attribute_id: 'size', attribute_name: 'Size', value_id: 'm', value: 'Medium (M)' },
        { attribute_id: 'color', attribute_name: 'Color', value_id: 'pink', value: 'Blush Pink' },
      ]
    }
  ]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const catList = await getCategories();
        setCategories(catList);
        if (catList.length > 0 && !categoryId) {
          setCategoryId(catList[0].id);
        }

        if (isEditing) {
          const prods = await getProducts();
          const p = prods.find(item => item.id === id);
          if (p) {
            setName(p.name);
            setSlug(p.slug);
            setSku(p.sku || '');
            setDescription(p.description || '');
            setCategoryId(p.category_id || (catList[0]?.id ?? ''));
            setProductType(p.product_type);
            setRegularPrice(p.regular_price);
            setSalePrice(p.sale_price ?? undefined);
            setStockQuantity(p.stock_quantity);
            setFeatured(p.featured);
            setStatus(p.status === 'published' ? 'published' : 'draft');
            if (p.images && p.images.length > 0) {
              setImageUrls(p.images.map(img => img.image_url));
            }
            if (p.variants && p.variants.length > 0) {
              setVariants(p.variants);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: 'var-' + Date.now(),
      product_id: id || '',
      sku: `${sku || 'SH'}-${Math.floor(100 + Math.random() * 900)}`,
      regular_price: regularPrice || 2000,
      sale_price: salePrice,
      stock_quantity: 10,
      is_active: true,
      attribute_values: [
        { attribute_id: 'size', attribute_name: 'Size', value_id: 'm', value: 'Medium (M)' },
        { attribute_id: 'color', attribute_name: 'Color', value_id: 'rose', value: 'Deep Rose' }
      ]
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product title', 'error');
      return;
    }
    if (!regularPrice || regularPrice <= 0) {
      showToast('Regular price must be greater than zero', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        id: isEditing ? id : undefined,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        sku: sku.trim() || `SH-${Math.floor(1000 + Math.random() * 9000)}`,
        description: description.trim(),
        category_id: categoryId,
        product_type: productType,
        regular_price: Number(regularPrice),
        sale_price: salePrice ? Number(salePrice) : null,
        stock_quantity: Number(stockQuantity),
        featured,
        status,
        images: imageUrls.map((url, i) => ({
          id: 'img-' + Date.now() + '-' + i,
          product_id: id || '',
          image_url: url,
          sort_order: i + 1,
        })),
        variants: productType === 'variable' ? variants : [],
      };

      await saveProduct(payload);
      showToast(isEditing ? 'Product updated successfully' : 'Product created successfully', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-brand-muted">Loading product editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-rose hover:text-brand-pink"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
          {isEditing ? `Edit: ${name}` : 'Create New Boutique Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Details */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2">
            1. General Product Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Jamdani Handloom Saree"
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-mono text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="SH-SAR-001"
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-mono uppercase text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Product Type *</label>
              <select
                value={productType}
                onChange={e => setProductType(e.target.value as ProductType)}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink font-semibold"
              >
                <option value="simple">Simple Product (Single variation)</option>
                <option value="variable">Variable Product (Sizes / Colors)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Fabric details, weave count, care instructions, and dimensions..."
              className="w-full px-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink leading-relaxed"
            />
          </div>
        </div>

        {/* 2. Pricing & Stock (For Simple Product) */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2">
            2. Base Pricing & Base Stock (BDT ৳)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Regular Price (৳) *</label>
              <input
                type="number"
                required
                min={0}
                value={regularPrice}
                onChange={e => setRegularPrice(Number(e.target.value))}
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-bold text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Sale Price (৳ - Optional)</label>
              <input
                type="number"
                min={0}
                value={salePrice ?? ''}
                onChange={e => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Discounted price"
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs font-bold text-brand-rose focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Inventory Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={e => setStockQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-brand-dark cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="rounded text-brand-pink focus:ring-brand-pink"
              />
              <span>Mark as Featured Product</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-brand-dark">Status:</span>
              <button
                type="button"
                onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-colors ${
                  status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Image Gallery */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center justify-between">
            <span>3. Product Images</span>
            <span className="text-xs text-brand-muted font-normal">Add direct URLs or Supabase Storage links</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL (https://...)"
              className="flex-1 px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand-border group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Form-Based Variation Manager (For Variable Products) */}
        {productType === 'variable' && (
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-rose" />
                  <span>4. Product Variations Manager</span>
                </h2>
                <p className="text-xs text-brand-muted">
                  Configure size, color, individual pricing, and stock per variant
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-1.5 bg-brand-softPink hover:bg-brand-pink hover:text-white text-brand-rose text-xs font-bold rounded-full transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variation</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3">Variant Attributes</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Regular (৳)</th>
                    <th className="px-4 py-3">Sale (৳)</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {variants.map((variant, idx) => (
                    <tr key={variant.id || idx}>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {variant.attribute_values?.map(a => (
                            <span key={a.attribute_name} className="inline-block bg-brand-softPink/60 text-brand-rose text-[10px] px-2 py-0.5 rounded mr-1 font-bold">
                              {a.attribute_name}: {a.value}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                          className="w-32 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded font-mono text-xs uppercase"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={variant.regular_price}
                          onChange={e => handleUpdateVariant(idx, 'regular_price', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded font-bold text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={variant.sale_price ?? ''}
                          onChange={e => handleUpdateVariant(idx, 'sale_price', e.target.value ? Number(e.target.value) : null)}
                          placeholder="Sale"
                          className="w-20 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded text-brand-rose font-bold text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={variant.stock_quantity}
                          onChange={e => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateVariant(idx, 'is_active', !variant.is_active)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            variant.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {variant.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit & Cancel */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-2.5 border border-brand-border text-brand-dark rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-elevated transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
