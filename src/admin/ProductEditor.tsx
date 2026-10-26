import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getProducts, 
  getCategories, 
  getAttributes, 
  saveProduct 
} from '../services/api';
import { Category, Product, ProductAttribute, ProductType, ProductVariant } from '../types';
import { useToast } from '../contexts/ToastContext';
import { slugify } from '../lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Layers, 
  Palette,
  Ruler,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

export const ProductEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isEditing = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
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

  // Selected Attribute Values for generating variations
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);

  // Variations list for Variable Product
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Quick image picker modal for individual variant
  const [activeImagePickerIndex, setActiveImagePickerIndex] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [catList, attrList] = await Promise.all([
          getCategories(),
          getAttributes(),
        ]);
        setCategories(catList);
        setAttributes(attrList);

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

              // Pre-select colors and sizes currently used by this product's variants
              const usedColorIds = new Set<string>();
              const usedSizeIds = new Set<string>();

              const colorAttr = attrList.find(a => a.slug === 'color');
              const sizeAttr = attrList.find(a => a.slug === 'size');

              p.variants.forEach(v => {
                v.attribute_values?.forEach(av => {
                  if (av.attribute_name.toLowerCase() === 'color' || av.attribute_id === 'attr-color') {
                    // Match by value_id or value
                    const match = colorAttr?.values?.find(val => val.id === av.value_id || val.value.toLowerCase() === av.value.toLowerCase());
                    if (match) usedColorIds.add(match.id);
                  }
                  if (av.attribute_name.toLowerCase() === 'size' || av.attribute_id === 'attr-size') {
                    const match = sizeAttr?.values?.find(val => val.id === av.value_id || val.value.toLowerCase() === av.value.toLowerCase());
                    if (match) usedSizeIds.add(match.id);
                  }
                });
              });

              setSelectedColorIds(Array.from(usedColorIds));
              setSelectedSizeIds(Array.from(usedSizeIds));
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

  const colorAttribute = attributes.find(a => a.slug === 'color') || {
    id: 'attr-color',
    name: 'Color',
    slug: 'color',
    values: [],
  };

  const sizeAttribute = attributes.find(a => a.slug === 'size') || {
    id: 'attr-size',
    name: 'Size',
    slug: 'size',
    values: [],
  };

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

  const toggleColorSelection = (colorId: string) => {
    setSelectedColorIds(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const toggleSizeSelection = (sizeId: string) => {
    setSelectedSizeIds(prev =>
      prev.includes(sizeId) ? prev.filter(s => s !== sizeId) : [...prev, sizeId]
    );
  };

  // Generate Variations algorithm that preserves existing configurations!
  const handleGenerateVariations = () => {
    const selectedColors = (colorAttribute.values || []).filter(c => selectedColorIds.includes(c.id));
    const selectedSizes = (sizeAttribute.values || []).filter(s => selectedSizeIds.includes(s.id));

    if (selectedColors.length === 0 && selectedSizes.length === 0) {
      showToast('Please select at least one colour or size to generate variations', 'error');
      return;
    }

    const generated: ProductVariant[] = [];
    const baseSku = sku.trim() || 'SH-PROD';

    // Helper to find existing matching variant
    const findExisting = (colorVal?: string, sizeVal?: string) => {
      return variants.find(v => {
        let matchColor = true;
        let matchSize = true;

        if (colorVal) {
          matchColor = Boolean(v.attribute_values?.some(
            av => (av.attribute_name.toLowerCase() === 'color' || av.attribute_id === 'attr-color') &&
                  av.value.toLowerCase() === colorVal.toLowerCase()
          ));
        }

        if (sizeVal) {
          matchSize = Boolean(v.attribute_values?.some(
            av => (av.attribute_name.toLowerCase() === 'size' || av.attribute_id === 'attr-size') &&
                  av.value.toLowerCase() === sizeVal.toLowerCase()
          ));
        }

        return matchColor && matchSize;
      });
    };

    if (selectedColors.length > 0 && selectedSizes.length > 0) {
      // Both colors and sizes
      selectedColors.forEach(colorItem => {
        selectedSizes.forEach(sizeItem => {
          const existing = findExisting(colorItem.value, sizeItem.value);
          if (existing) {
            generated.push(existing);
          } else {
            const cleanColor = slugify(colorItem.value).toUpperCase().replace(/-/g, '');
            const cleanSize = slugify(sizeItem.value).toUpperCase().replace(/-/g, '');
            generated.push({
              id: 'var-gen-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
              product_id: id || '',
              sku: `${baseSku}-${cleanColor}-${cleanSize}`,
              regular_price: regularPrice || 1500,
              sale_price: salePrice || null,
              stock_quantity: 10,
              image_url: imageUrls[0] || '',
              is_active: true,
              attribute_values: [
                {
                  attribute_id: colorAttribute.id,
                  attribute_name: 'Color',
                  value_id: colorItem.id,
                  value: colorItem.value,
                  color_hex: colorItem.color_hex || null,
                },
                {
                  attribute_id: sizeAttribute.id,
                  attribute_name: 'Size',
                  value_id: sizeItem.id,
                  value: sizeItem.value,
                },
              ],
            });
          }
        });
      });
    } else if (selectedColors.length > 0) {
      // Colors only
      selectedColors.forEach(colorItem => {
        const existing = findExisting(colorItem.value, undefined);
        if (existing) {
          generated.push(existing);
        } else {
          const cleanColor = slugify(colorItem.value).toUpperCase().replace(/-/g, '');
          generated.push({
            id: 'var-gen-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
            product_id: id || '',
            sku: `${baseSku}-${cleanColor}`,
            regular_price: regularPrice || 1500,
            sale_price: salePrice || null,
            stock_quantity: 10,
            image_url: imageUrls[0] || '',
            is_active: true,
            attribute_values: [
              {
                attribute_id: colorAttribute.id,
                attribute_name: 'Color',
                value_id: colorItem.id,
                value: colorItem.value,
                color_hex: colorItem.color_hex || null,
              },
            ],
          });
        }
      });
    } else {
      // Sizes only
      selectedSizes.forEach(sizeItem => {
        const existing = findExisting(undefined, sizeItem.value);
        if (existing) {
          generated.push(existing);
        } else {
          const cleanSize = slugify(sizeItem.value).toUpperCase().replace(/-/g, '');
          generated.push({
            id: 'var-gen-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
            product_id: id || '',
            sku: `${baseSku}-${cleanSize}`,
            regular_price: regularPrice || 1500,
            sale_price: salePrice || null,
            stock_quantity: 10,
            image_url: imageUrls[0] || '',
            is_active: true,
            attribute_values: [
              {
                attribute_id: sizeAttribute.id,
                attribute_name: 'Size',
                value_id: sizeItem.id,
                value: sizeItem.value,
              },
            ],
          });
        }
      });
    }

    setVariants(generated);
    showToast(`Generated ${generated.length} variation combinations`, 'success');
  };

  const handleAddCustomVariant = () => {
    const baseSku = sku.trim() || 'SH-VAR';
    const newVariant: ProductVariant = {
      id: 'var-custom-' + Date.now(),
      product_id: id || '',
      sku: `${baseSku}-${Math.floor(100 + Math.random() * 900)}`,
      regular_price: regularPrice || 1500,
      sale_price: salePrice || null,
      stock_quantity: 10,
      image_url: imageUrls[0] || '',
      is_active: true,
      attribute_values: [
        {
          attribute_id: colorAttribute.id,
          attribute_name: 'Color',
          value_id: colorAttribute.values?.[0]?.id || 'val-pink',
          value: colorAttribute.values?.[0]?.value || 'Pink',
          color_hex: colorAttribute.values?.[0]?.color_hex || '#D6336C',
        },
        {
          attribute_id: sizeAttribute.id,
          attribute_name: 'Size',
          value_id: sizeAttribute.values?.[0]?.id || 'val-m',
          value: sizeAttribute.values?.[0]?.value || 'M',
        },
      ],
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

    if (productType === 'simple') {
      if (!regularPrice || regularPrice <= 0) {
        showToast('Regular price must be greater than zero for simple products', 'error');
        return;
      }
      if (salePrice && salePrice > regularPrice) {
        showToast('Sale price cannot exceed regular price', 'error');
        return;
      }
    } else {
      // Validate variations
      if (variants.length === 0) {
        showToast('Please generate or add at least one variation for a Variable Product', 'error');
        return;
      }

      for (const v of variants) {
        if (!v.regular_price || v.regular_price <= 0) {
          showToast(`Regular price must be greater than zero for variant "${v.sku}"`, 'error');
          return;
        }
        if (v.sale_price && v.sale_price > v.regular_price) {
          showToast(`Sale price cannot exceed regular price for variation "${v.sku}"`, 'error');
          return;
        }
        if (v.stock_quantity < 0) {
          showToast(`Stock quantity cannot be negative for variation "${v.sku}"`, 'error');
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Compute display price and total stock from variations if variable
      const computedStock = productType === 'variable'
        ? variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
        : Number(stockQuantity);

      const computedRegularPrice = productType === 'variable' && variants.length > 0
        ? Math.min(...variants.map(v => Number(v.regular_price) || 0))
        : Number(regularPrice);

      const computedSalePrice = productType === 'variable' && variants.length > 0
        ? (variants.some(v => v.sale_price) ? Math.min(...variants.map(v => v.sale_price ? Number(v.sale_price) : Number(v.regular_price))) : null)
        : (salePrice ? Number(salePrice) : null);

      const payload: Partial<Product> = {
        id: isEditing ? id : undefined,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        sku: sku.trim() || `SH-${Math.floor(1000 + Math.random() * 9000)}`,
        description: description.trim(),
        category_id: categoryId,
        product_type: productType,
        regular_price: computedRegularPrice,
        sale_price: computedSalePrice,
        stock_quantity: computedStock,
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
      showToast(isEditing ? 'Product and variations updated successfully' : 'Product and variations created successfully', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-brand-muted animate-pulse">Loading product editor...</div>;
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
        
        {/* 1. General Product Information */}
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
              <label className="block text-xs font-bold text-brand-dark mb-1">Product Base SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. SH-KRT-001"
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
                <option value="simple">Simple Product (Single price & stock)</option>
                <option value="variable">Variable Product (Colours & Sizes)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Fabric details, weave count, care instructions, and dimensions..."
              className="w-full px-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-brand-dark cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="rounded text-brand-pink focus:ring-brand-pink"
              />
              <span>Mark as Featured on Homepage</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-brand-dark">Publish Status:</span>
              <button
                type="button"
                onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase transition-colors ${
                  status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Simple Product Pricing & Stock (Only for Simple Products) */}
        {productType === 'simple' && (
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
            <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2">
              2. Simple Product Pricing & Inventory (BDT ৳)
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
          </div>
        )}

        {/* 3. Image Gallery */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center justify-between">
            <span>3. Product Images</span>
            <span className="text-xs text-brand-muted font-normal">Add image links or Supabase Storage URLs</span>
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

        {/* 4. PRODUCT VARIATIONS (For Variable Products) */}
        {productType === 'variable' && (
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-brand-dark flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-rose" />
                  <span>4. Product Variations</span>
                </h2>
                <p className="text-xs text-brand-muted">
                  Select available colours and sizes, generate combinations, and set individual prices and inventory
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/admin/attributes"
                  target="_blank"
                  className="text-xs text-brand-rose hover:text-brand-pink font-semibold flex items-center gap-1 underline"
                >
                  <span>Manage Colours & Sizes</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* A. Colour Selection */}
            <div className="space-y-2 p-4 bg-brand-ivory/40 rounded-2xl border border-brand-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-brand-rose" />
                  <span>Step 1: Select Available Colours ({selectedColorIds.length} selected)</span>
                </span>
                <span className="text-[11px] text-brand-muted">Click swatches to toggle</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(colorAttribute.values || []).map(colorItem => {
                  const isSelected = selectedColorIds.includes(colorItem.id);
                  return (
                    <button
                      key={colorItem.id}
                      type="button"
                      onClick={() => toggleColorSelection(colorItem.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'border-brand-rose bg-brand-rose text-white shadow-sm'
                          : 'border-brand-border bg-white text-brand-dark hover:border-brand-pink'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border shadow-inner flex items-center justify-center ${
                          isSelected ? 'border-white' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: colorItem.color_hex || '#ccc' }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white drop-shadow-md" />}
                      </span>
                      <span>{colorItem.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Size Selection */}
            <div className="space-y-2 p-4 bg-brand-ivory/40 rounded-2xl border border-brand-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-brand-rose" />
                  <span>Step 2: Select Available Sizes ({selectedSizeIds.length} selected)</span>
                </span>
                <span className="text-[11px] text-brand-muted">Click sizes to toggle</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(sizeAttribute.values || []).map(sizeItem => {
                  const isSelected = selectedSizeIds.includes(sizeItem.id);
                  return (
                    <button
                      key={sizeItem.id}
                      type="button"
                      onClick={() => toggleSizeSelection(sizeItem.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'border-brand-rose bg-brand-rose text-white shadow-sm'
                          : 'border-brand-border bg-white text-brand-dark hover:border-brand-pink'
                      }`}
                    >
                      {sizeItem.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Action Bar: Generate Variations */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-brand-softPink/30 rounded-2xl border border-brand-rose/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-brand-dark">Generate Combinations</p>
                <p className="text-[11px] text-brand-muted">
                  Generates variations for selected colours × sizes without overwriting existing prices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateVariations}
                  className="px-5 py-2.5 bg-brand-rose hover:bg-brand-pink text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Generate Variations</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCustomVariant}
                  className="px-4 py-2.5 bg-white border border-brand-border hover:bg-gray-50 text-brand-dark text-xs font-semibold rounded-full transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Single</span>
                </button>
              </div>
            </div>

            {/* D. Variation Management Table */}
            {variants.length === 0 ? (
              <div className="text-center p-8 bg-brand-ivory/30 rounded-2xl border border-dashed border-brand-border space-y-2">
                <Layers className="w-8 h-8 text-brand-muted mx-auto" />
                <p className="font-serif text-sm font-bold text-brand-dark">No Variations Generated Yet</p>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Select your available colours and sizes above, then click <strong>"Generate Variations"</strong> to configure prices and stock.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                  <span>Configured Variations ({variants.length})</span>
                  <span className="text-[11px] text-brand-muted font-normal">
                    Total stock: {variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)} units
                  </span>
                </div>

                <div className="overflow-x-auto border border-brand-border rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
                      <tr>
                        <th className="px-4 py-3">Colour & Size</th>
                        <th className="px-4 py-3">Variation SKU *</th>
                        <th className="px-4 py-3">Regular (৳) *</th>
                        <th className="px-4 py-3">Sale (৳)</th>
                        <th className="px-4 py-3">Stock *</th>
                        <th className="px-4 py-3">Image</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {variants.map((variant, idx) => {
                        const colorAV = variant.attribute_values?.find(
                          av => av.attribute_name.toLowerCase() === 'color' || av.attribute_id === 'attr-color'
                        );
                        const sizeAV = variant.attribute_values?.find(
                          av => av.attribute_name.toLowerCase() === 'size' || av.attribute_id === 'attr-size'
                        );

                        return (
                          <tr key={variant.id || idx} className="hover:bg-brand-softPink/15 transition-colors">
                            {/* Colour & Size Badges */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {colorAV && (
                                  <span className="inline-flex items-center gap-1.5 bg-white border border-brand-border px-2 py-0.5 rounded-md text-[11px] font-bold text-brand-dark shadow-2xs">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: colorAV.color_hex || '#D6336C' }}
                                    />
                                    <span>{colorAV.value}</span>
                                  </span>
                                )}
                                {sizeAV && (
                                  <span className="inline-block bg-brand-softPink/80 text-brand-rose px-2 py-0.5 rounded-md text-[11px] font-bold border border-brand-border">
                                    {sizeAV.value}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Variation SKU */}
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                required
                                value={variant.sku}
                                onChange={e => handleUpdateVariant(idx, 'sku', e.target.value.toUpperCase())}
                                className="w-36 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded font-mono text-xs uppercase text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                              />
                            </td>

                            {/* Regular Price */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                required
                                min={1}
                                value={variant.regular_price}
                                onChange={e => handleUpdateVariant(idx, 'regular_price', Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded font-bold text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                              />
                            </td>

                            {/* Sale Price */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={0}
                                value={variant.sale_price ?? ''}
                                onChange={e => handleUpdateVariant(idx, 'sale_price', e.target.value ? Number(e.target.value) : null)}
                                placeholder="Optional"
                                className="w-20 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded text-brand-rose font-bold text-xs focus:bg-white focus:outline-none focus:border-brand-pink"
                              />
                            </td>

                            {/* Stock */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                required
                                min={0}
                                value={variant.stock_quantity}
                                onChange={e => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                                className="w-16 px-2 py-1 bg-brand-ivory/50 border border-brand-border rounded text-xs font-semibold text-center text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                              />
                            </td>

                            {/* Image selector */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {variant.image_url ? (
                                  <img
                                    src={variant.image_url}
                                    alt=""
                                    className="w-8 h-10 object-cover rounded border border-brand-border cursor-pointer hover:opacity-80"
                                    onClick={() => setActiveImagePickerIndex(idx)}
                                    title="Click to change image"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setActiveImagePickerIndex(idx)}
                                    className="p-1.5 border border-dashed border-brand-border text-brand-muted hover:text-brand-rose rounded"
                                    title="Assign image"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleUpdateVariant(idx, 'is_active', !variant.is_active)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase transition-colors ${
                                  variant.is_active !== false
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {variant.is_active !== false ? 'Active' : 'Hidden'}
                              </button>
                            </td>

                            {/* Remove button */}
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-gray-400 hover:text-red-600 p-1"
                                title="Remove combination"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Quick Image Picker Modal for Variant */}
        {activeImagePickerIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  Select Image for Variation ({variants[activeImagePickerIndex]?.sku})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveImagePickerIndex(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Choose from Gallery:
                </label>
                <div className="grid grid-cols-4 gap-2 py-2">
                  {imageUrls.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      onClick={() => {
                        handleUpdateVariant(activeImagePickerIndex, 'image_url', img);
                        setActiveImagePickerIndex(null);
                      }}
                      className="w-full aspect-[3/4] object-cover rounded-xl border border-brand-border cursor-pointer hover:border-brand-pink transition-all"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Or enter direct Image URL:
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  defaultValue={variants[activeImagePickerIndex]?.image_url || ''}
                  onBlur={e => {
                    if (e.target.value.trim()) {
                      handleUpdateVariant(activeImagePickerIndex, 'image_url', e.target.value.trim());
                    }
                  }}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveImagePickerIndex(null)}
                  className="px-5 py-1.5 bg-brand-pink text-white rounded-full text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit & Cancel */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
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
            <span>{saving ? 'Saving...' : 'Save Product & Variations'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
