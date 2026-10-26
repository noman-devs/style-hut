import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  initialAttributes,
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
  ProductAttribute,
  ProductAttributeValue,
  ProductVariant,
  SocialLink,
  StoreSettings,
} from '../types';

// Helper to normalize Supabase nested variant attribute values
function normalizeVariantAttributes(variants: any[]): ProductVariant[] {
  if (!variants) return [];
  return variants.map(v => ({
    ...v,
    attribute_values: (v.attribute_values || []).map((av: any) => {
      if (av.attribute_value) {
        return {
          attribute_id: av.attribute_value.attribute?.id || '',
          attribute_name: av.attribute_value.attribute?.name || '',
          value_id: av.attribute_value.id || '',
          value: av.attribute_value.value || '',
          color_hex: av.attribute_value.color_hex || null,
        };
      }
      return av;
    }),
  }));
}

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
                color_hex,
                is_active,
                sort_order,
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
      if (!error && data) {
        return (data as any[]).map(p => ({
          ...p,
          variants: normalizeVariantAttributes(p.variants),
        })) as Product[];
      }
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
          variants:product_variants(*,
            attribute_values:variant_attribute_values(
              attribute_value:product_attribute_values(
                id,
                value,
                color_hex,
                is_active,
                sort_order,
                attribute:product_attributes(id, name)
              )
            )
          )
        `)
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return {
          ...data,
          variants: normalizeVariantAttributes(data.variants),
        } as Product;
      }
    } catch (e) {
      console.warn('Supabase getProductBySlug fallback', e);
    }
  }

  const products = getLocal<Product[]>('products', initialProducts);
  return products.find(p => p.slug === slug) || null;
}

// 2. ATTRIBUTES API (Colours & Sizes)
export async function getAttributes(): Promise<ProductAttribute[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .select(`
          *,
          values:product_attribute_values(*)
        `)
        .order('name');
      if (!error && data) {
        return data.map((attr: any) => ({
          ...attr,
          values: (attr.values || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        })) as ProductAttribute[];
      }
    } catch (e) {
      console.warn('Supabase getAttributes fallback', e);
    }
  }

  const attrs = getLocal<ProductAttribute[]>('attributes', initialAttributes);
  return attrs.map(attr => ({
    ...attr,
    values: [...(attr.values || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));
}

export async function saveAttributeValue(
  attributeSlug: 'color' | 'size',
  payload: {
    id?: string;
    value: string;
    color_hex?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }
): Promise<ProductAttributeValue> {
  const attrs = getLocal<ProductAttribute[]>('attributes', initialAttributes);
  let targetAttr = attrs.find(a => a.slug === attributeSlug);
  if (!targetAttr) {
    targetAttr = {
      id: 'attr-' + attributeSlug,
      name: attributeSlug === 'color' ? 'Color' : 'Size',
      slug: attributeSlug,
      values: [],
    };
    attrs.push(targetAttr);
  }

  if (isSupabaseConfigured) {
    try {
      const { data: attrRow } = await supabase
        .from('product_attributes')
        .select('id')
        .eq('slug', attributeSlug)
        .single();

      const attrId = attrRow?.id || targetAttr.id;

      if (payload.id && !payload.id.startsWith('val-temp-') && !payload.id.startsWith('val-')) {
        const { data, error } = await supabase
          .from('product_attribute_values')
          .update({
            value: payload.value,
            color_hex: payload.color_hex,
            is_active: payload.is_active ?? true,
            sort_order: payload.sort_order ?? 0,
          })
          .eq('id', payload.id)
          .select()
          .single();
        if (!error && data) return data as ProductAttributeValue;
      } else {
        const { data, error } = await supabase
          .from('product_attribute_values')
          .insert({
            attribute_id: attrId,
            value: payload.value,
            color_hex: payload.color_hex,
            is_active: payload.is_active ?? true,
            sort_order: payload.sort_order ?? (targetAttr.values?.length || 0) + 1,
          })
          .select()
          .single();
        if (!error && data) return data as ProductAttributeValue;
      }
    } catch (e) {
      console.warn('Supabase saveAttributeValue fallback', e);
    }
  }

  targetAttr.values = targetAttr.values || [];
  if (payload.id) {
    const idx = targetAttr.values.findIndex(v => v.id === payload.id);
    if (idx >= 0) {
      targetAttr.values[idx] = {
        ...targetAttr.values[idx],
        value: payload.value,
        color_hex: payload.color_hex,
        is_active: payload.is_active ?? targetAttr.values[idx].is_active ?? true,
        sort_order: payload.sort_order ?? targetAttr.values[idx].sort_order ?? 0,
      };
      setLocal('attributes', attrs);
      return targetAttr.values[idx];
    }
  }

  const newId = 'val-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newVal: ProductAttributeValue = {
    id: newId,
    attribute_id: targetAttr.id,
    value: payload.value,
    color_hex: payload.color_hex,
    is_active: payload.is_active ?? true,
    sort_order: payload.sort_order ?? targetAttr.values.length + 1,
  };
  targetAttr.values.push(newVal);
  setLocal('attributes', attrs);
  return newVal;
}

export async function deleteAttributeValue(
  valueId: string
): Promise<{ success: boolean; message?: string }> {
  const products = getLocal<Product[]>('products', initialProducts);
  const inUse = products.some(p =>
    p.variants?.some(v =>
      v.attribute_values?.some(av => av.value_id === valueId)
    )
  );
  if (inUse) {
    return {
      success: false,
      message: 'Cannot delete: this attribute value is currently assigned to existing product variations. Please reassign or deactivate it instead.',
    };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('product_attribute_values')
        .delete()
        .eq('id', valueId);
      if (error) {
        return { success: false, message: error.message };
      }
    } catch (e: any) {
      console.warn('Supabase deleteAttributeValue error', e);
    }
  }

  const attrs = getLocal<ProductAttribute[]>('attributes', initialAttributes);
  attrs.forEach(attr => {
    if (attr.values) {
      attr.values = attr.values.filter(v => v.id !== valueId);
    }
  });
  setLocal('attributes', attrs);
  return { success: true };
}

// 3. CATEGORIES API
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
  
  if (isSupabaseConfigured) {
    try {
      const prodPayload = {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        category_id: product.category_id || null,
        product_type: product.product_type || 'simple',
        regular_price: product.regular_price,
        sale_price: product.sale_price || null,
        stock_quantity: product.stock_quantity || 0,
        featured: Boolean(product.featured),
        status: product.status || 'published',
        updated_at: new Date().toISOString(),
      };

      let savedId = product.id;
      if (savedId && !savedId.startsWith('prod-')) {
        await supabase
          .from('products')
          .update(prodPayload)
          .eq('id', savedId);
      } else {
        const { data: newProd } = await supabase
          .from('products')
          .insert({
            ...prodPayload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (newProd) savedId = newProd.id;
      }

      // If variants are present, sync to product_variants
      if (savedId && product.variants && product.variants.length > 0) {
        for (const v of product.variants) {
          const variantPayload = {
            product_id: savedId,
            sku: v.sku,
            regular_price: v.regular_price,
            sale_price: v.sale_price || null,
            stock_quantity: v.stock_quantity,
            image_url: v.image_url || null,
            is_active: v.is_active ?? true,
            updated_at: new Date().toISOString(),
          };

          let varId = v.id;
          if (varId && !varId.startsWith('var-')) {
            await supabase.from('product_variants').update(variantPayload).eq('id', varId);
          } else {
            const { data: newVar } = await supabase.from('product_variants').insert(variantPayload).select().single();
            if (newVar) varId = newVar.id;
          }

          // Link attribute values
          if (varId && v.attribute_values) {
            for (const av of v.attribute_values) {
              if (av.value_id && !av.value_id.startsWith('val-temp-') && !av.value_id.startsWith('val-')) {
                await supabase.from('variant_attribute_values').upsert({
                  variant_id: varId,
                  attribute_value_id: av.value_id,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Supabase saveProduct fallback', e);
    }
  }

  if (product.id) {
    // Update local
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = { 
        ...products[idx], 
        ...product, 
        variants: product.variants !== undefined ? product.variants : products[idx].variants,
        updated_at: new Date().toISOString() 
      } as Product;
      setLocal('products', products);
      return products[idx];
    }
  }

  // New product local
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

// 13. ADMIN USERS & RBAC APIS (Super Admin)
export interface AdminUserItem {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager';
  account_status: 'active' | 'blocked';
  created_at: string;
}

const ADMIN_STORAGE_KEY = 'admin_staff';

const DEFAULT_ADMIN_STAFF: AdminUserItem[] = [
  {
    id: '39f7a1b8-17a1-4833-b4c3-8dcf20132805',
    full_name: 'Super Admin Sohel',
    email: 'sohel229229@gmail.com',
    phone: '01700-000000',
    role: 'super_admin',
    account_status: 'active',
    created_at: '2026-10-26T05:13:48.887Z',
  },
  {
    id: 'b71bb7ff-ee0a-4a20-ba72-a85178349a12',
    full_name: 'alamin',
    email: 'hello.alaminmkt@gmail.com',
    phone: '01833729229',
    role: 'admin',
    account_status: 'active',
    created_at: '2026-10-26T05:26:27.260Z',
  },
  {
    id: 'e43a0724-5a82-4ae1-bef0-4a55b1e41b50',
    full_name: 'alamin',
    email: 'sohel229@gmail.com',
    phone: '01833729229',
    role: 'admin',
    account_status: 'active',
    created_at: '2026-10-26T05:33:11.372Z',
  },
];

function getStoredAdminStaff(): AdminUserItem[] {
  // Support both key conventions for full continuity
  const standard = getLocal<AdminUserItem[]>(ADMIN_STORAGE_KEY, []);
  if (standard && standard.length > 0) return standard;
  
  try {
    const rawLegacy = localStorage.getItem('stylehut_stylehut_admin_staff') || localStorage.getItem('stylehut_admin_staff');
    if (rawLegacy) {
      const parsed = JSON.parse(rawLegacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLocal(ADMIN_STORAGE_KEY, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  setLocal(ADMIN_STORAGE_KEY, DEFAULT_ADMIN_STAFF);
  return DEFAULT_ADMIN_STAFF;
}

function saveAdminStaff(staff: AdminUserItem[]): void {
  setLocal(ADMIN_STORAGE_KEY, staff);
  try {
    localStorage.setItem('stylehut_admin_staff', JSON.stringify(staff));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

export async function getAdminUsersList(): Promise<AdminUserItem[]> {
  const localList = getStoredAdminStaff();

  if (isSupabaseConfigured) {
    try {
      // 1. Try get_admin_users RPC function
      const { data, error } = await supabase.rpc('get_admin_users');
      if (!error && data && data.length > 0) {
        saveAdminStaff(data as AdminUserItem[]);
        return data as AdminUserItem[];
      }

      // 2. Query profiles directly with safe mapping
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['super_admin', 'admin', 'manager'])
        .order('created_at', { ascending: true });

      if (!pErr && profs && profs.length > 0) {
        const merged: AdminUserItem[] = [...localList];
        profs.forEach((p: any) => {
          const existingIdx = merged.findIndex(m => m.id === p.id);
          const isRootSohel = p.id === '39f7a1b8-17a1-4833-b4c3-8dcf20132805' || p.full_name?.includes('Sohel');
          const determinedRole: 'super_admin' | 'admin' = (isRootSohel || p.role === 'super_admin') ? 'super_admin' : 'admin';
          
          if (existingIdx >= 0) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              full_name: p.full_name || merged[existingIdx].full_name,
              phone: p.phone || merged[existingIdx].phone,
              role: merged[existingIdx].role || determinedRole,
              account_status: p.account_status || merged[existingIdx].account_status || 'active',
            };
          } else {
            merged.push({
              id: p.id,
              full_name: p.full_name || 'Admin Staff',
              phone: p.phone || '',
              email: isRootSohel ? 'sohel229229@gmail.com' : `admin-${p.id.slice(0, 5)}@stylehutbd.com`,
              role: determinedRole,
              account_status: p.account_status || 'active',
              created_at: p.created_at || new Date().toISOString(),
            });
          }
        });

        saveAdminStaff(merged);
        return merged;
      }
    } catch (e) {
      console.warn('getAdminUsersList error', e);
    }
  }

  return localList;
}

export async function createAdminAccount(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'admin' | 'super_admin';
}): Promise<{ success: boolean; message?: string }> {
  const cleanEmail = payload.email.trim().toLowerCase();

  const newAdmin: AdminUserItem = {
    id: 'adm-' + Date.now(),
    full_name: payload.name.trim(),
    email: cleanEmail,
    phone: payload.phone || '',
    role: payload.role,
    account_status: 'active',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      // 1. Try database RPC function first
      const { data, error } = await supabase.rpc('create_admin_user', {
        p_email: cleanEmail,
        p_password: payload.password,
        p_name: payload.name.trim(),
        p_phone: payload.phone || '',
        p_role: payload.role,
      });

      if (!error && data?.success) {
        if (data.user_id) newAdmin.id = data.user_id;
        const current = getStoredAdminStaff();
        saveAdminStaff([...current.filter(c => c.email !== cleanEmail), newAdmin]);
        return { success: true };
      }

      // 2. Resilient client-side fallback
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
        email: cleanEmail,
        password: payload.password,
        options: {
          data: {
            full_name: payload.name.trim(),
            phone: payload.phone || '',
          },
        },
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        return { success: false, message: signUpError.message };
      }

      if (signUpData?.user?.id) {
        newAdmin.id = signUpData.user.id;
        // Wait briefly for triggers
        await new Promise(r => setTimeout(r, 400));
        // Update profile in DB with role: 'admin' (valid in PostgreSQL check constraint)
        await supabase
          .from('profiles')
          .update({
            role: 'admin',
            full_name: payload.name.trim(),
            phone: payload.phone || '',
            account_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', signUpData.user.id);
      }

      const current = getStoredAdminStaff();
      saveAdminStaff([...current.filter(c => c.email !== cleanEmail), newAdmin]);
      return { success: true };
    } catch (e: any) {
      console.warn('createAdminAccount error', e);
    }
  }

  // Update local staff list
  const current = getStoredAdminStaff();
  saveAdminStaff([...current.filter(c => c.email !== cleanEmail), newAdmin]);
  return { success: true };
}

export async function updateAdminAccount(
  adminId: string,
  updates: {
    full_name?: string;
    phone?: string;
    role?: 'admin' | 'super_admin';
    account_status?: 'active' | 'blocked';
  }
): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured) {
    try {
      const dbPayload: any = { updated_at: new Date().toISOString() };
      if (updates.full_name) dbPayload.full_name = updates.full_name;
      if (updates.phone !== undefined) dbPayload.phone = updates.phone;
      if (updates.account_status) dbPayload.account_status = updates.account_status;
      if (updates.role) dbPayload.role = 'admin'; // 'admin' satisfies DB constraint
      await supabase.from('profiles').update(dbPayload).eq('id', adminId);
    } catch (e: any) {
      console.warn('update admin error', e);
    }
  }

  const current = getStoredAdminStaff();
  const updated = current.map(a => (a.id === adminId ? { ...a, ...updates } : a));
  saveAdminStaff(updated);
  return { success: true };
}

export async function deleteAdminAccount(adminId: string): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').update({ role: 'customer', account_status: 'blocked', updated_at: new Date().toISOString() }).eq('id', adminId);
    } catch (e: any) {
      console.warn('delete admin error', e);
    }
  }

  const current = getStoredAdminStaff();
  const filtered = current.filter(a => a.id !== adminId);
  saveAdminStaff(filtered);
  return { success: true };
}

export async function toggleAdminAccountStatus(adminId: string, status: 'active' | 'blocked'): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').update({ account_status: status, updated_at: new Date().toISOString() }).eq('id', adminId);
    } catch (e: any) {
      console.warn('toggle status error', e);
    }
  }

  const current = getStoredAdminStaff();
  const updated = current.map(a => (a.id === adminId ? { ...a, account_status: status } : a));
  saveAdminStaff(updated);
  return { success: true };
}
