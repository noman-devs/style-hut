import React, { useEffect, useState } from 'react';
import { getCategories, saveCategory, deleteCategory } from '../services/api';
import { Category } from '../types';
import { useToast } from '../contexts/ToastContext';
import { slugify } from '../lib/utils';
import { Plus, Edit, Trash2, Layers, Check, X, ArrowUpDown } from 'lucide-react';

export const Categories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) return;

    try {
      const payload: Partial<Category> = {
        ...editingCategory,
        slug: editingCategory.slug?.trim() || slugify(editingCategory.name),
      };
      await saveCategory(payload);
      showToast('Category saved successfully', 'success');
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${category.name}"?`)) return;

    try {
      const res = await deleteCategory(category.id);
      if (res.success) {
        showToast('Category deleted successfully', 'success');
        loadCategories();
      } else {
        showToast(res.message || 'Cannot delete category', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Category Management
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Organize collections, display order, and boutique banners
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-brand-softPink/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                        alt=""
                        className="w-12 h-12 object-cover rounded-xl border border-brand-border flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-brand-dark text-xs">{cat.name}</div>
                        {cat.description && (
                          <div className="text-[11px] text-brand-muted line-clamp-1 max-w-xs">{cat.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px] text-brand-muted">
                    {cat.slug}
                  </td>

                  <td className="px-6 py-4 font-bold text-brand-dark">
                    {cat.sort_order}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cat.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-brand-rose"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-gray-400 hover:text-rose-600"
                        title="Delete"
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
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-dark">
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingCategory(prev => ({
                      ...prev,
                      name: val,
                      slug: prev?.id ? prev.slug : slugify(val),
                    }));
                  }}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-mono text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingCategory.image_url || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCategory.sort_order ?? 1}
                    onChange={e => setEditingCategory(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-dark">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active ?? true}
                      onChange={e => setEditingCategory(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-brand-pink focus:ring-brand-pink"
                    />
                    <span>Active Status</span>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
