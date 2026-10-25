import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  initialBanners,
  initialCategories,
  initialOrders,
  initialPaymentSettings,
  initialProducts,
  initialSocialLinks,
  initialStoreSettings,
} from './mockData';
import {
  Banner,
  Category,
  Order,
  PaymentSetting,
  Product,
  SocialLink,
  StoreSettings,
} from '../types';

// In-memory / localStorage cache for when Supabase credentials are not connected
const STORAGE_PREFIX = 'stylehut_';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage error', e);
  }
}

// 1. PRODUCTS API
export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  limit?: number;
}): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*,
            attribute_values:variant_attribute_values(
              attribute_value:product_attribute_values(
                id,
                value,
                attribute:product_attributes(id, name)
              )
            )
          )
        `)
        .eq('status', 'published');

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options?.featured) {
        query = query.eq('featured', true);
      }
      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }
      if (options?.sortBy === 'price_asc') {
        query = query.order('regular_price', { ascending: true });
      } else if (options?.sortBy === 'price_desc') {
        query = query.order('regular_price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (!error && data) return data as Product[];
    } catch (e) {
      console.warn('Supabase query error, falling back to local dataset', e);
    }
  }

  // Fallback to local
  let products = getLocal<Product[]>('products', initialProducts);
  if (options?.categoryId) {
    products = products.filter(p => p.category_id === options.categoryId);
  }
  if (options?.categorySlug) {
    const cats = getLocal<Category[]>('categories', initialCategories);
    const cat = cats.find(c => c.slug === options.categorySlug);
    if (cat) {
      products = products.filter(p => p.category_id === cat.id);
    }
  }
  if (options?.featured) {
    products = products.filter(p => p.featured);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s));
  }
  if (options?.sortBy === 'price_asc') {
    products.sort((a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price));
  } else if (options?.sortBy === 'price_desc') {
    products.sort((a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price));
  }
  if (options?.limit) {
    products = products.slice(0, options.limit);
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .single();
      if (!error && data) return data as Product;
    } catch (e) {
      console.warn('Supabase getProductBySlug fallback', e);
    }
  }

  const products = getLocal<Product[]>('products', initialProducts);
  return products.find(p => p.slug === slug) || null;
}

// 2. CATEGORIES API
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as Category[];
    } catch (e) {
      console.warn('Supabase getCategories fallback', e);
    }
  }
  return getLocal<Category[]>('categories', initialCategories);
}

// 3. BANNERS API
export async function getBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as Banner[];
    } catch (e) {
      console.warn('Supabase getBanners fallback', e);
    }
  }
  return getLocal<Banner[]>('banners', initialBanners);
}

// 4. STORE SETTINGS API
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('setting_key', 'general')
        .single();
      if (!error && data?.setting_value) return data.setting_value as StoreSettings;
    } catch (e) {
      console.warn('Supabase getStoreSettings fallback', e);
    }
  }
  return getLocal<StoreSettings>('store_settings', initialStoreSettings);
}

export async function updateStoreSettings(settings: StoreSettings): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ setting_key: 'general', setting_value: settings, updated_at: new Date().toISOString() });
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  setLocal('store_settings', settings);
  return true;
}

// 5. PAYMENT SETTINGS API
export async function getPaymentSettings(): Promise<PaymentSetting[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) return data as PaymentSetting[];
    } catch (e) {
      console.warn('Supabase getPaymentSettings fallback', e);
    }
  }
  return getLocal<PaymentSetting[]>('payment_settings', initialPaymentSettings);
}

export async function updatePaymentSetting(setting: PaymentSetting): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert(setting);
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  const all = getLocal<PaymentSetting[]>('payment_settings', initialPaymentSettings);
  const idx = all.findIndex(p => p.id === setting.id);
  if (idx >= 0) all[idx] = setting;
  else all.push(setting);
  setLocal('payment_settings', all);
  return true;
}

// 6. SOCIAL LINKS API
export async function getSocialLinks(): Promise<SocialLink[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) return data as SocialLink[];
    } catch (e) {
      console.warn('Supabase getSocialLinks fallback', e);
    }
  }
  return getLocal<SocialLink[]>('social_links', initialSocialLinks);
}

// 7. ORDER PROCESSING & CREATION API
export interface CreateOrderPayload {
  customer_name: string;
  phone: string;
  email?: string;
  shipping_address: string;
  division?: string;
  district?: string;
  area?: string;
  notes?: string;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'rocket';
  transaction_id?: string;
  sender_phone?: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<{
  success: boolean;
  order_number: string;
  order_id: string;
  total: number;
  message?: string;
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('create_order_secure', {
        p_customer_name: payload.customer_name,
        p_phone: payload.phone,
        p_email: payload.email || '',
        p_shipping_address: payload.shipping_address,
        p_division: payload.division || 'Dhaka',
        p_district: payload.district || '',
        p_area: payload.area || '',
        p_notes: payload.notes || '',
        p_payment_method: payload.payment_method,
        p_transaction_id: payload.transaction_id || '',
        p_sender_phone: payload.sender_phone || '',
        p_items: payload.items,
      });

      if (!error && data?.success) {
        return {
          success: true,
          order_id: data.order_id,
          order_number: data.order_number,
          total: data.total,
        };
      } else if (error) {
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.warn('Supabase RPC error, executing local order processing', e);
      if (isSupabaseConfigured) throw e;
    }
  }

  // Local fallback processing with complete validation and stock reservation
  const products = getLocal<Product[]>('products', initialProducts);
  let subtotal = 0;
  const orderNumber = 'SH-' + Math.floor(100000 + Math.random() * 900000);
  const deliveryFee = payload.division?.toLowerCase() === 'dhaka' ? 70 : 130;

  const orderItems = payload.items.map((item, index) => {
    const prod = products.find(p => p.id === item.product_id);
    if (!prod) throw new Error('Product not found: ' + item.product_id);
    
    let price = prod.sale_price ?? prod.regular_price;
    let desc = '';
    let sku = prod.sku || 'SKU';

    if (item.variant_id && prod.variants) {
      const v = prod.variants.find(varItem => varItem.id === item.variant_id);
      if (v) {
        price = v.sale_price ?? v.regular_price;
        sku = v.sku;
        desc = v.attribute_values?.map(a => `${a.attribute_name}: ${a.value}`).join(', ') || '';
        v.stock_quantity = Math.max(0, v.stock_quantity - item.quantity);
      }
    } else {
      prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
    }

    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    return {
      id: 'item-' + Date.now() + '-' + index,
      order_id: 'ord-' + Date.now(),
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: prod.name,
      sku,
      variant_description: desc,
      unit_price: price,
      quantity: item.quantity,
      line_total: lineTotal,
    };
  });

  // Update products stock locally
  setLocal('products', products);

  const newOrder: Order = {
    id: 'ord-' + Date.now(),
    order_number: orderNumber,
    customer_name: payload.customer_name,
    phone: payload.phone,
    email: payload.email,
    shipping_address: payload.shipping_address,
    division: payload.division,
    district: payload.district,
    area: payload.area,
    notes: payload.notes,
    subtotal,
    delivery_fee: deliveryFee,
    discount: 0,
    total: subtotal + deliveryFee,
    order_status: 'pending',
    payment_method: payload.payment_method,
    payment_status: payload.payment_method === 'cod' ? 'unpaid' : (payload.transaction_id ? 'awaiting_verification' : 'unpaid'),
    transaction_id: payload.transaction_id,
    sender_phone: payload.sender_phone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_items: orderItems,
  };

  const orders = getLocal<Order[]>('orders', initialOrders);
  orders.unshift(newOrder);
  setLocal('orders', orders);

  return {
    success: true,
    order_id: newOrder.id,
    order_number: newOrder.order_number,
    total: newOrder.total,
  };
}

// 8. ORDER TRACKING API
export async function trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('track_order_public', {
        p_order_number: orderNumber,
        p_phone: phone,
      });
      if (!error && data?.found) {
        return data as Order;
      }
    } catch (e) {
      console.warn('Supabase trackOrder fallback', e);
    }
  }

  const orders = getLocal<Order[]>('orders', initialOrders);
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const found = orders.find(
    o => o.order_number.toLowerCase() === orderNumber.trim().toLowerCase() &&
         o.phone.replace(/\D/g, '').slice(-10) === cleanPhone
  );
  return found || null;
}

// 9. ADMIN DATA APIS
export async function getAdminOrders(): Promise<Order[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    } catch (e) {
      console.warn('Supabase getAdminOrders fallback', e);
    }
  }
  return getLocal<Order[]>('orders', initialOrders);
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  const orders = getLocal<Order[]>('orders', initialOrders);
  const ord = orders.find(o => o.id === orderId);
  if (ord) {
    ord.order_status = status;
    ord.updated_at = new Date().toISOString();
    setLocal('orders', orders);
    return true;
  }
  return false;
}

export async function updateOrderPaymentStatus(orderId: string, status: Order['payment_status']): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  const orders = getLocal<Order[]>('orders', initialOrders);
  const ord = orders.find(o => o.id === orderId);
  if (ord) {
    ord.payment_status = status;
    ord.updated_at = new Date().toISOString();
    setLocal('orders', orders);
    return true;
  }
  return false;
}

export async function cancelAndRestockOrder(orderId: string, reason: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('cancel_order_and_restock', {
        p_order_id: orderId,
        p_reason: reason,
      });
      if (!error && data?.success) return true;
    } catch (e) {
      console.error(e);
    }
  }

  const orders = getLocal<Order[]>('orders', initialOrders);
  const ord = orders.find(o => o.id === orderId);
  if (ord && ord.order_status !== 'cancelled') {
    ord.order_status = 'cancelled';
    ord.updated_at = new Date().toISOString();
    
    // Restock items in products
    const products = getLocal<Product[]>('products', initialProducts);
    ord.order_items?.forEach(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        if (item.variant_id && prod.variants) {
          const v = prod.variants.find(varItem => varItem.id === item.variant_id);
          if (v) v.stock_quantity += item.quantity;
        } else {
          prod.stock_quantity += item.quantity;
        }
      }
    });

    setLocal('products', products);
    setLocal('orders', orders);
    return true;
  }
  return false;
}

// 10. PRODUCT MANAGEMENT APIS (Admin)
export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const products = getLocal<Product[]>('products', initialProducts);
  
  if (product.id) {
    // Update
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...product, updated_at: new Date().toISOString() } as Product;
      setLocal('products', products);
      return products[idx];
    }
  }

  // New product
  const newProduct: Product = {
    id: 'prod-' + Date.now(),
    name: product.name || 'New Fashion Product',
    slug: product.slug || ('prod-' + Date.now()),
    sku: product.sku || ('SH-' + Math.floor(1000 + Math.random() * 9000)),
    description: product.description || '',
    category_id: product.category_id,
    product_type: product.product_type || 'simple',
    regular_price: product.regular_price || 0,
    sale_price: product.sale_price,
    stock_quantity: product.stock_quantity || 0,
    featured: Boolean(product.featured),
    status: product.status || 'published',
    images: product.images || [
      { id: 'img-' + Date.now(), product_id: 'prod-' + Date.now(), image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ],
    variants: product.variants || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  products.unshift(newProduct);
  setLocal('products', products);
  return newProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const products = getLocal<Product[]>('products', initialProducts);
  const filtered = products.filter(p => p.id !== productId);
  setLocal('products', filtered);
  return true;
}

// 11. CATEGORY MANAGEMENT APIS (Admin)
export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const categories = getLocal<Category[]>('categories', initialCategories);
  if (category.id) {
    const idx = categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      categories[idx] = { ...categories[idx], ...category } as Category;
      setLocal('categories', categories);
      return categories[idx];
    }
  }
  const newCat: Category = {
    id: 'cat-' + Date.now(),
    name: category.name || 'New Category',
    slug: category.slug || ('cat-' + Date.now()),
    description: category.description,
    image_url: category.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    sort_order: category.sort_order || categories.length + 1,
    is_active: category.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  categories.push(newCat);
  setLocal('categories', categories);
  return newCat;
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message?: string }> {
  const products = getLocal<Product[]>('products', initialProducts);
  const hasProducts = products.some(p => p.category_id === categoryId);
  if (hasProducts) {
    return {
      success: false,
      message: 'Cannot delete category: existing products are currently assigned to this category. Please reassign or delete those products first.',
    };
  }

  const categories = getLocal<Category[]>('categories', initialCategories);
  const filtered = categories.filter(c => c.id !== categoryId);
  setLocal('categories', filtered);
  return { success: true };
}

// 12. BANNERS MANAGEMENT APIS (Admin)
export async function saveBanner(banner: Partial<Banner>): Promise<Banner> {
  const banners = getLocal<Banner[]>('banners', initialBanners);
  if (banner.id) {
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      banners[idx] = { ...banners[idx], ...banner } as Banner;
      setLocal('banners', banners);
      return banners[idx];
    }
  }
  const newBanner: Banner = {
    id: 'b-' + Date.now(),
    title: banner.title || 'New Banner',
    subtitle: banner.subtitle,
    image_url: banner.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80',
    button_text: banner.button_text || 'Shop Now',
    target_url: banner.target_url || '/products',
    sort_order: banner.sort_order || banners.length + 1,
    is_active: banner.is_active ?? true,
  };
  banners.push(newBanner);
  setLocal('banners', banners);
  return newBanner;
}

export async function deleteBanner(bannerId: string): Promise<boolean> {
  const banners = getLocal<Banner[]>('banners', initialBanners);
  setLocal('banners', banners.filter(b => b.id !== bannerId));
  return true;
}
