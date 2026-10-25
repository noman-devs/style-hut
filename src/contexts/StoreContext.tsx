import React, { createContext, useContext, useEffect, useState } from 'react';
import { Banner, Category, PaymentSetting, SocialLink, StoreSettings } from '../types';
import {
  getBanners,
  getCategories,
  getPaymentSettings,
  getSocialLinks,
  getStoreSettings,
} from '../services/api';
import { initialStoreSettings } from '../services/mockData';
import { isSupabaseConfigured } from '../lib/supabase';

interface StoreContextType {
  settings: StoreSettings;
  socialLinks: SocialLink[];
  paymentSettings: PaymentSetting[];
  categories: Category[];
  banners: Banner[];
  isSupabaseLive: boolean;
  refreshStoreData: () => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, soc, p, c, b] = await Promise.all([
        getStoreSettings(),
        getSocialLinks(),
        getPaymentSettings(),
        getCategories(),
        getBanners(),
      ]);
      setSettings(s);
      setSocialLinks(soc);
      setPaymentSettings(p);
      setCategories(c);
      setBanners(b);
    } catch (e) {
      console.error('Failed to load store metadata', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        socialLinks,
        paymentSettings,
        categories,
        banners,
        isSupabaseLive: isSupabaseConfigured,
        refreshStoreData: loadData,
        loading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
