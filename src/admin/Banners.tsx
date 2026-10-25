import React, { useEffect, useState } from 'react';
import { getBanners, saveBanner, deleteBanner } from '../services/api';
import { Banner } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';

export const Banners: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner({
      title: '',
      subtitle: '',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80',
      button_text: 'Shop Now',
      target_url: '/products',
      sort_order: banners.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.trim()) return;

    try {
      await saveBanner(editingBanner);
      showToast('Banner saved successfully', 'success');
      setModalOpen(false);
      loadBanners();
    } catch (err) {
      showToast('Error saving banner', 'error');
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await deleteBanner(b.id);
      showToast('Banner removed', 'success');
      loadBanners();
    } catch (err) {
      showToast('Error deleting banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage high-fashion promotional carousels, headlines, and destination links
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div
            key={banner.id}
            className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] bg-brand-charcoal">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm ${
                  banner.is_active ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-white'
                }`}>
                  {banner.is_active ? 'Active' : 'Disabled'}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/90 text-brand-dark px-2 py-0.5 rounded-full shadow-sm">
                  Order: {banner.sort_order}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-brand-dark line-clamp-1">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs text-brand-muted line-clamp-2">{banner.subtitle}</p>
                )}
                <div className="text-[11px] text-brand-rose font-semibold pt-1">
                  CTA: "{banner.button_text}" → {banner.target_url}
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-ivory/50 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(banner)}
                className="p-1.5 text-gray-500 hover:text-brand-rose rounded-lg"
                title="Edit Banner"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(banner)}
                className="p-1.5 text-gray-500 hover:text-rose-600 rounded-lg"
                title="Delete Banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Modal */}
      {modalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-dark">
                {editingBanner.id ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Luxury Jamdani Heritage"
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Handcrafted with timeless elegance"
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingBanner.image_url || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Button Label</label>
                  <input
                    type="text"
                    value={editingBanner.button_text || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop Now"
                    className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-dark mb-1">Target URL</label>
                  <input
                    type="text"
                    value={editingBanner.target_url || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="/products"
                    className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingBanner.sort_order ?? 1}
                    onChange={e => setEditingBanner(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-dark">
                    <input
                      type="checkbox"
                      checked={editingBanner.is_active ?? true}
                      onChange={e => setEditingBanner(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-brand-pink focus:ring-brand-pink"
                    />
                    <span>Active on Homepage</span>
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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
