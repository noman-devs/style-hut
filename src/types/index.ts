export type ProductType = 'simple' | 'variable';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'awaiting_verification' | 'paid' | 'rejected' | 'refunded';
export type PaymentProvider = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type UserRole = 'customer' | 'admin' | 'manager' | 'super_admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: UserRole;
  account_status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  color_hex?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  regular_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
  attribute_values?: {
    attribute_id: string;
    attribute_name: string;
    value_id: string;
    value: string;
    color_hex?: string | null;
  }[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  category_id?: string;
  category?: Category;
  product_type: ProductType;
  regular_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  featured: boolean;
  status: ProductStatus;
  seo_title?: string;
  seo_description?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant_id?: string;
  variant?: ProductVariant;
  quantity: number;
  selected_attributes?: Record<string, string>; // e.g. { Size: 'M', Color: 'Pink' }
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  sku?: string;
  variant_description?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string;
  shipping_address: string;
  division?: string;
  district?: string;
  area?: string;
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  order_status: OrderStatus;
  payment_method: PaymentProvider;
  payment_status: PaymentStatus;
  transaction_id?: string;
  sender_phone?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface PaymentSetting {
  id: string;
  provider: PaymentProvider;
  display_name: string;
  payment_number?: string;
  account_type?: string;
  instructions?: string;
  is_enabled: boolean;
  sort_order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text: string;
  target_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  currency: string;
  currency_symbol: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_threshold: number;
  homepage_sections: {
    latest_products: boolean;
    new_arrivals: boolean;
    best_sellers: boolean;
    featured_products: boolean;
    special_offers: boolean;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  description: string;
  created_by?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  variant_id?: string;
  variant_sku?: string;
  quantity_change: number;
  reason: string;
  created_by?: string;
  created_at: string;
}
