import React, { useEffect, useState } from 'react';
import { getAttributes, saveAttributeValue, deleteAttributeValue } from '../services/api';
import { ProductAttribute, ProductAttributeValue } from '../types';
import { useToast } from '../contexts/ToastContext';
import { 
  Palette, 
  Ruler, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ArrowUpDown, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Attributes: React.FC = () => {
  const { showToast } = useToast();
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'color' | 'size'
  const [activeTab, setActiveTab] = useState<'color' | 'size'>('color');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{
    id?: string;
    attribute_id?: string;
    value: string;
    color_hex?: string;
    is_active?: boolean;
    sort_order?: number;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAttributes();
      setAttributes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const colorAttr = attributes.find(a => a.slug === 'color') || {
    id: 'attr-color',
    name: 'Color',
    slug: 'color',
    values: [],
  };

  const sizeAttr = attributes.find(a => a.slug === 'size') || {
    id: 'attr-size',
    name: 'Size',
    slug: 'size',
    values: [],
  };

  const handleOpenAdd = () => {
    if (activeTab === 'color') {
      setEditingValue({
        value: '',
        color_hex: '#D6336C',
        is_active: true,
        sort_order: (colorAttr.values?.length || 0) + 1,
      });
    } else {
      setEditingValue({
        value: '',
        is_active: true,
        sort_order: (sizeAttr.values?.length || 0) + 1,
      });
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (val: ProductAttributeValue) => {
    setEditingValue({
      id: val.id,
      attribute_id: val.attribute_id,
      value: val.value,
      color_hex: val.color_hex || '#D6336C',
      is_active: val.is_active ?? true,
      sort_order: val.sort_order ?? 1,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValue?.value?.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      await saveAttributeValue(activeTab, {
        id: editingValue.id,
        value: editingValue.value.trim(),
        color_hex: activeTab === 'color' ? (editingValue.color_hex || '#D6336C') : null,
        is_active: editingValue.is_active ?? true,
        sort_order: Number(editingValue.sort_order || 1),
      });

      showToast(`${activeTab === 'color' ? 'Colour' : 'Size'} saved successfully`, 'success');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving attribute', 'error');
    }
  };

  const handleDelete = async (val: ProductAttributeValue) => {
    if (!window.confirm(`Are you sure you want to delete "${val.value}"?`)) return;

    try {
      const res = await deleteAttributeValue(val.id);
      if (res.success) {
        showToast(`"${val.value}" deleted successfully`, 'success');
        loadData();
      } else {
        showToast(res.message || 'Failed to delete attribute value', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting attribute value', 'error');
    }
  };

  const handleToggleStatus = async (val: ProductAttributeValue) => {
    try {
      await saveAttributeValue(activeTab, {
        ...val,
        is_active: !val.is_active,
      });
      showToast(`Status updated to ${!val.is_active ? 'Active' : 'Inactive'}`, 'success');
      loadData();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Product Attributes & Variations
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage global boutique colours, HEX swatches, and standard apparel sizes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === 'color' ? 'Colour' : 'Size'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-border">
        <button
          onClick={() => setActiveTab('color')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'color'
              ? 'border-brand-pink text-brand-rose'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colours ({colorAttr.values?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('size')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'size'
              ? 'border-brand-pink text-brand-rose'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Sizes ({sizeAttr.values?.length || 0})</span>
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-brand-muted animate-pulse">
            Loading attribute list...
          </div>
        ) : activeTab === 'color' ? (
          /* COLOUR TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Colour Swatch</th>
                  <th className="px-6 py-3.5">Colour Name</th>
                  <th className="px-6 py-3.5">HEX Code</th>
                  <th className="px-6 py-3.5">Display Order</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {(colorAttr.values || []).map(val => (
                  <tr key={val.id} className="hover:bg-brand-softPink/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: val.color_hex || '#cccccc' }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-brand-dark text-xs">
                      {val.value}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-brand-muted">
                      {val.color_hex || 'None'}
                    </td>

                    <td className="px-6 py-4 font-semibold text-brand-dark">
                      {val.sort_order ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(val)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase transition-colors ${
                          val.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {val.is_active !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(val)}
                          className="p-1.5 text-gray-400 hover:text-brand-rose"
                          title="Edit Colour"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(val)}
                          className="p-1.5 text-gray-400 hover:text-rose-600"
                          title="Delete Colour"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* SIZE TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Size Badge</th>
                  <th className="px-6 py-3.5">Size Name / Code</th>
                  <th className="px-6 py-3.5">Display Order</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {(sizeAttr.values || []).map(val => (
                  <tr key={val.id} className="hover:bg-brand-softPink/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-brand-softPink/80 text-brand-rose font-bold text-xs rounded-lg border border-brand-border">
                        {val.value}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-brand-dark text-xs">
                      {val.value}
                    </td>

                    <td className="px-6 py-4 font-semibold text-brand-dark">
                      {val.sort_order ?? 0}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(val)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase transition-colors ${
                          val.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {val.is_active !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(val)}
                          className="p-1.5 text-gray-400 hover:text-brand-rose"
                          title="Edit Size"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(val)}
                          className="p-1.5 text-gray-400 hover:text-rose-600"
                          title="Delete Size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Attribute Modal */}
      {modalOpen && editingValue && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-dark">
                {editingValue.id 
                  ? `Edit ${activeTab === 'color' ? 'Colour' : 'Size'}` 
                  : `Add New ${activeTab === 'color' ? 'Colour' : 'Size'}`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  {activeTab === 'color' ? 'Colour Name *' : 'Size Name / Label *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingValue.value}
                  onChange={e => setEditingValue(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                  placeholder={activeTab === 'color' ? 'e.g. Blush Pink, Olive Green' : 'e.g. M, XL, Free Size'}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              {activeTab === 'color' && (
                <div>
                  <label className="block font-bold text-brand-dark mb-1">
                    Select Colour Swatch & HEX Code *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingValue.color_hex || '#D6336C'}
                      onChange={e => setEditingValue(prev => prev ? ({ ...prev, color_hex: e.target.value.toUpperCase() }) : null)}
                      className="w-12 h-10 p-0.5 rounded-xl border border-brand-border cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={editingValue.color_hex || '#D6336C'}
                      onChange={e => setEditingValue(prev => prev ? ({ ...prev, color_hex: e.target.value.toUpperCase() }) : null)}
                      placeholder="#FFC0CB"
                      className="flex-1 px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-mono uppercase text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={editingValue.sort_order ?? 1}
                    onChange={e => setEditingValue(prev => prev ? ({ ...prev, sort_order: Number(e.target.value) }) : null)}
                    className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-dark">
                    <input
                      type="checkbox"
                      checked={editingValue.is_active ?? true}
                      onChange={e => setEditingValue(prev => prev ? ({ ...prev, is_active: e.target.checked }) : null)}
                      className="rounded text-brand-pink focus:ring-brand-pink"
                    />
                    <span>Active for Sale</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-brand-border rounded-full hover:bg-gray-50 text-brand-dark font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-pink hover:bg-brand-rose text-white font-bold rounded-full shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
