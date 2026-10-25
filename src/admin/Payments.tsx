import React, { useEffect, useState } from 'react';
import { getPaymentSettings, updatePaymentSetting } from '../services/api';
import { PaymentSetting } from '../types';
import { useToast } from '../contexts/ToastContext';
import { CreditCard, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Payments: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getPaymentSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (id: string, field: keyof PaymentSetting, value: any) => {
    setSettings(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveItem = async (setting: PaymentSetting) => {
    try {
      await updatePaymentSetting(setting);
      showToast(`Updated ${setting.display_name} settings`, 'success');
    } catch (e) {
      showToast('Error saving payment setting', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Payment Method Configuration
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Configure Cash on Delivery and Bangladeshi mobile banking accounts (bKash, Nagad, Rocket)
        </p>
      </div>

      <div className="space-y-6">
        {settings.map(setting => (
          <div
            key={setting.id}
            className="bg-white p-6 rounded-3xl border border-brand-border shadow-soft space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-brand-rose" />
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  {setting.display_name}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-dark">
                  <input
                    type="checkbox"
                    checked={setting.is_enabled}
                    onChange={e => handleChange(setting.id, 'is_enabled', e.target.checked)}
                    className="rounded text-brand-pink focus:ring-brand-pink"
                  />
                  <span>{setting.is_enabled ? 'Enabled in Store' : 'Disabled'}</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {setting.provider !== 'cod' && (
                <>
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">
                      Account Number (Bangladesh)
                    </label>
                    <input
                      type="text"
                      value={setting.payment_number || ''}
                      onChange={e => handleChange(setting.id, 'payment_number', e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl font-mono text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">
                      Account Type
                    </label>
                    <input
                      type="text"
                      value={setting.account_type || ''}
                      onChange={e => handleChange(setting.id, 'account_type', e.target.value)}
                      placeholder="Personal / Merchant / Agent"
                      className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>
                </>
              )}

              <div className={setting.provider === 'cod' ? 'sm:col-span-2' : 'sm:col-span-2'}>
                <label className="block font-bold text-brand-dark mb-1">
                  Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={setting.instructions || ''}
                  onChange={e => handleChange(setting.id, 'instructions', e.target.value)}
                  className="w-full px-3 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSaveItem(setting)}
                className="px-5 py-2 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save {setting.provider.toUpperCase()} Settings</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
