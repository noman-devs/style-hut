import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { updateStoreSettings } from '../services/api';
import { StoreSettings } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Save, Store, Truck, Phone, Globe, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, refreshStoreData } = useStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings(formData);
      await refreshStoreData();
      showToast('Store settings updated successfully', 'success');
    } catch (e) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Store & Website Settings
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Manage boutique information, contact hotlines, delivery charges, and homepage visibility
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Brand Information */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-rose" />
            <span>1. Boutique Branding & Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-dark mb-1">Boutique Address (Dhaka)</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
            />
          </div>
        </div>

        {/* Contact Coordinates */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-rose" />
            <span>2. Customer Hotlines & Communication</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Customer Phone Hotline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">WhatsApp Hotline</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-rose" />
            <span>3. Delivery Fee Settings (BDT ৳)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Inside Dhaka Fee (৳)</label>
              <input
                type="number"
                min={0}
                value={formData.delivery_inside_dhaka}
                onChange={e => setFormData({ ...formData, delivery_inside_dhaka: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-bold text-brand-dark focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Outside Dhaka Fee (৳)</label>
              <input
                type="number"
                min={0}
                value={formData.delivery_outside_dhaka}
                onChange={e => setFormData({ ...formData, delivery_outside_dhaka: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-bold text-brand-dark focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Free Delivery Order Threshold (৳)</label>
              <input
                type="number"
                min={0}
                value={formData.free_delivery_threshold}
                onChange={e => setFormData({ ...formData, free_delivery_threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-bold text-brand-dark focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Homepage Section Visibility */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
          <h2 className="font-serif text-base font-bold text-brand-dark border-b border-brand-border pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-rose" />
            <span>4. Homepage Display Sections</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {Object.entries(formData.homepage_sections || {}).map(([secKey, isVisible]) => (
              <label key={secKey} className="flex items-center gap-2 cursor-pointer p-3 bg-brand-ivory/50 rounded-xl border border-brand-border">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={e => {
                    setFormData({
                      ...formData,
                      homepage_sections: {
                        ...formData.homepage_sections,
                        [secKey]: e.target.checked,
                      },
                    });
                  }}
                  className="rounded text-brand-pink focus:ring-brand-pink"
                />
                <span className="font-semibold text-brand-dark capitalize">
                  {secKey.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-brand-pink hover:bg-brand-rose text-white font-bold rounded-full shadow-elevated transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Website Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
