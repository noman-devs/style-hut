import { Banner, Category, PaymentSetting, Product, SocialLink, StoreSettings, Order } from '../types';

export const initialStoreSettings: StoreSettings = {
  store_name: 'Style Hut',
  tagline: 'Be Your Own Style',
  currency: 'BDT',
  currency_symbol: '৳',
  email: 'care@stylehutbd.com',
  phone: '+880 1711-987654',
  whatsapp: '+880 1711-987654',
  address: 'House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh',
  delivery_inside_dhaka: 70,
  delivery_outside_dhaka: 130,
  free_delivery_threshold: 3000,
  homepage_sections: {
    latest_products: true,
    new_arrivals: true,
    best_sellers: true,
    featured_products: true,
    special_offers: true,
  },
};

export const initialSocialLinks: SocialLink[] = [
  { id: '1', platform: 'Facebook', url: 'https://facebook.com/stylehutbd', is_active: true, sort_order: 1 },
  { id: '2', platform: 'Instagram', url: 'https://instagram.com/stylehut.official', is_active: true, sort_order: 2 },
  { id: '3', platform: 'YouTube', url: 'https://youtube.com/@stylehutbd', is_active: true, sort_order: 3 },
  { id: '4', platform: 'TikTok', url: 'https://tiktok.com/@stylehut.bd', is_active: true, sort_order: 4 },
];

export const initialPaymentSettings: PaymentSetting[] = [
  {
    id: 'pay-1',
    provider: 'cod',
    display_name: 'Cash on Delivery (COD)',
    account_type: 'Pay upon delivery across Bangladesh',
    instructions: 'Pay in cash directly to the courier representative upon receiving your package. Please keep exact change ready.',
    is_enabled: true,
    sort_order: 1,
  },
  {
    id: 'pay-2',
    provider: 'bkash',
    display_name: 'bKash Personal / Send Money',
    payment_number: '01711-987654',
    account_type: 'Personal Account',
    instructions: 'Go to bKash app -> Send Money to 01711-987654 -> Enter total order amount -> Use your order or phone as reference -> Copy Transaction ID and enter below.',
    is_enabled: true,
    sort_order: 2,
  },
  {
    id: 'pay-3',
    provider: 'nagad',
    display_name: 'Nagad Personal / Send Money',
    payment_number: '01811-987654',
    account_type: 'Personal Account',
    instructions: 'Go to Nagad app -> Send Money to 01811-987654 -> Enter total order amount -> Enter reference -> Enter Transaction ID below.',
    is_enabled: true,
    sort_order: 3,
  },
  {
    id: 'pay-4',
    provider: 'rocket',
    display_name: 'Rocket Mobile Banking',
    payment_number: '01911-987654-7',
    account_type: 'Personal Account',
    instructions: 'Go to Rocket app -> Send Money to 01911-987654-7 (12 digits) -> Enter order total -> Copy Transaction ID and enter below.',
    is_enabled: true,
    sort_order: 4,
  },
];

export const initialBanners: Banner[] = [
  {
    id: 'b-1',
    title: 'Luxury Jamdani & Silk Heritage',
    subtitle: 'Handcrafted with timeless elegance for the modern Bangladeshi woman',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80',
    button_text: 'Explore Sarees',
    target_url: '/category/saree',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'b-2',
    title: 'Festive Kurti & Salwar Kameez',
    subtitle: 'Vibrant pastels, delicate embroidery & premium breathable fabrics',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=80',
    button_text: 'Shop New Arrivals',
    target_url: '/category/salwar-kameez',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'b-3',
    title: 'Handcrafted Royal Kundan Jewellery',
    subtitle: 'Sparkle at every celebration with our 24k gold-plated statement pieces',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=80',
    button_text: 'Discover Jewels',
    target_url: '/category/jewellery',
    sort_order: 3,
    is_active: true,
  },
];

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Saree',
    slug: 'saree',
    description: 'Traditional Jamdani, Katan, Organza & Pure Silk Sarees',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Salwar Kameez',
    slug: 'salwar-kameez',
    description: 'Boutique 3-piece sets, organza dupattas and festive party wear',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Kurti',
    slug: 'kurti',
    description: 'Modern, fusion and classic embroidered tunics & kurtis',
    image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-4',
    name: 'Hijab',
    slug: 'hijab',
    description: 'Premium georgette, modal and luxury festive abayas & hijabs',
    image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-5',
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Kundan, Meenakari, Polki & Gold-plated bridal jewellery',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-6',
    name: 'Bags',
    slug: 'bags',
    description: 'Embroidered potli bags, clutches and designer leather totes',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'cat-7',
    name: 'Shoes',
    slug: 'shoes',
    description: 'Embellished bridal heels, velvet khussas and stylish flats',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'cat-8',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Fragrances, luxury body mists, attars & organic care',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    sort_order: 8,
    is_active: true,
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Embroidered Georgette Kurti',
    slug: 'aura-embroidered-georgette-kurti',
    sku: 'SH-KRT-001',
    description: 'Handcrafted with intricate zari and floral resham work on fine georgette. Comes with breathable lining for ultimate comfort during Dhaka summers and festive gatherings.',
    category_id: 'cat-3',
    product_type: 'variable',
    regular_price: 2450,
    sale_price: 1950,
    stock_quantity: 32,
    featured: true,
    status: 'published',
    seo_title: 'Aura Embroidered Georgette Kurti | Style Hut BD',
    seo_description: 'Shop premium embroidered kurtis in Bangladesh.',
    images: [
      { id: 'img-1', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', sort_order: 1 },
      { id: 'img-2', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', sort_order: 2 }
    ],
    variants: [
      {
        id: 'var-1',
        product_id: 'prod-1',
        sku: 'SH-KRT-001-S-PNK',
        regular_price: 2450,
        sale_price: 1950,
        stock_quantity: 8,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-s', value: 'Small (S)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-pink', value: 'Blush Pink' },
        ]
      },
      {
        id: 'var-2',
        product_id: 'prod-1',
        sku: 'SH-KRT-001-M-PNK',
        regular_price: 2450,
        sale_price: 1950,
        stock_quantity: 12,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-m', value: 'Medium (M)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-pink', value: 'Blush Pink' },
        ]
      },
      {
        id: 'var-3',
        product_id: 'prod-1',
        sku: 'SH-KRT-001-L-PNK',
        regular_price: 2450,
        sale_price: 1950,
        stock_quantity: 6,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-l', value: 'Large (L)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-pink', value: 'Blush Pink' },
        ]
      },
      {
        id: 'var-4',
        product_id: 'prod-1',
        sku: 'SH-KRT-001-M-ROSE',
        regular_price: 2600,
        sale_price: 2100,
        stock_quantity: 6,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-m', value: 'Medium (M)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-rose', value: 'Deep Rose' },
        ]
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Royal Heritage Dhakai Jamdani Saree',
    slug: 'royal-heritage-dhakai-jamdani-saree',
    sku: 'SH-SAR-001',
    description: 'Authentic 84-count handloom Dhakai Jamdani woven by traditional weavers of Narayanganj. Features mesmerizing buti motifs and regal gold zari border with matching blouse piece.',
    category_id: 'cat-1',
    product_type: 'simple',
    regular_price: 8500,
    sale_price: 7200,
    stock_quantity: 15,
    featured: true,
    status: 'published',
    images: [
      { id: 'img-3', product_id: 'prod-2', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ]
  },
  {
    id: 'prod-3',
    name: 'Gulmohar 3-Piece Festive Salwar Suit',
    slug: 'gulmohar-3-piece-festive-salwar-suit',
    sku: 'SH-SLW-001',
    description: 'Three-piece luxury ensemble comprising digital printed silk kameez with hand-embellished neckline, organza scalloped dupatta, and comfortable silk trousers.',
    category_id: 'cat-2',
    product_type: 'variable',
    regular_price: 4800,
    sale_price: 3950,
    stock_quantity: 20,
    featured: true,
    status: 'published',
    images: [
      { id: 'img-4', product_id: 'prod-3', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ],
    variants: [
      {
        id: 'var-5',
        product_id: 'prod-3',
        sku: 'SH-SLW-001-M-ROSE',
        regular_price: 4800,
        sale_price: 3950,
        stock_quantity: 10,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-m', value: 'Medium (M)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-rose', value: 'Deep Rose' }
        ]
      },
      {
        id: 'var-6',
        product_id: 'prod-3',
        sku: 'SH-SLW-001-L-ROSE',
        regular_price: 4800,
        sale_price: 3950,
        stock_quantity: 10,
        is_active: true,
        attribute_values: [
          { attribute_id: 'attr-size', attribute_name: 'Size', value_id: 'val-l', value: 'Large (L)' },
          { attribute_id: 'attr-color', attribute_name: 'Color', value_id: 'val-rose', value: 'Deep Rose' }
        ]
      }
    ]
  },
  {
    id: 'prod-4',
    name: 'Noor Royal Kundan Choker & Jhumka Set',
    slug: 'noor-royal-kundan-choker-jhumka-set',
    sku: 'SH-JWL-001',
    description: 'Exquisite 24K gold-plated Kundan choker with emerald bead drops and matching oversized Jhumkas. Hand-set stones with antique matte finish.',
    category_id: 'cat-5',
    product_type: 'simple',
    regular_price: 3200,
    sale_price: 2650,
    stock_quantity: 14,
    featured: true,
    status: 'published',
    images: [
      { id: 'img-5', product_id: 'prod-4', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ]
  },
  {
    id: 'prod-5',
    name: 'Zahra Hand-Embroidered Velvet Potli',
    slug: 'zahra-hand-embroidered-velvet-potli',
    sku: 'SH-BAG-001',
    description: 'Rich velvet bag with fine pearl and zardozi embroidery. Features braided gold drawstring and ornate tassel embellishments. Perfectly pairs with sarees.',
    category_id: 'cat-6',
    product_type: 'simple',
    regular_price: 1850,
    sale_price: 1450,
    stock_quantity: 25,
    featured: false,
    status: 'published',
    images: [
      { id: 'img-6', product_id: 'prod-5', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ]
  },
  {
    id: 'prod-6',
    name: 'Medina Silk Premium Modest Hijab',
    slug: 'medina-silk-premium-modest-hijab',
    sku: 'SH-HJB-001',
    description: 'Non-slip, breathable Medina Silk scarf with subtle sheen. Generous 190x75cm cut allows effortless draping with lasting elegance.',
    category_id: 'cat-4',
    product_type: 'simple',
    regular_price: 950,
    sale_price: 750,
    stock_quantity: 40,
    featured: false,
    status: 'published',
    images: [
      { id: 'img-7', product_id: 'prod-6', image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80', sort_order: 1 }
    ]
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'SH-261025-A109B',
    customer_name: 'Tasnim Rahman',
    phone: '01712345678',
    email: 'tasnim@example.com',
    shipping_address: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Uttara',
    notes: 'Please call before delivery',
    subtotal: 7200,
    delivery_fee: 70,
    discount: 0,
    total: 7270,
    order_status: 'confirmed',
    payment_method: 'cod',
    payment_status: 'unpaid',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    order_items: [
      {
        id: 'item-1',
        order_id: 'ord-101',
        product_id: 'prod-2',
        product_name: 'Royal Heritage Dhakai Jamdani Saree',
        sku: 'SH-SAR-001',
        unit_price: 7200,
        quantity: 1,
        line_total: 7200,
      }
    ]
  },
  {
    id: 'ord-102',
    order_number: 'SH-261024-C887X',
    customer_name: 'Nusrat Jahan',
    phone: '01898765432',
    email: 'nusrat@example.com',
    shipping_address: 'Flat 4B, Mehedibag, Chattogram',
    division: 'Chittagong',
    district: 'Chattogram',
    area: 'Mehedibag',
    subtotal: 3950,
    delivery_fee: 130,
    discount: 0,
    total: 4080,
    order_status: 'processing',
    payment_method: 'bkash',
    payment_status: 'paid',
    transaction_id: 'BK9A7721XZ',
    sender_phone: '01898765432',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    order_items: [
      {
        id: 'item-2',
        order_id: 'ord-102',
        product_id: 'prod-3',
        variant_id: 'var-5',
        product_name: 'Gulmohar 3-Piece Festive Salwar Suit',
        sku: 'SH-SLW-001-M-ROSE',
        variant_description: 'Size: Medium (M), Color: Deep Rose',
        unit_price: 3950,
        quantity: 1,
        line_total: 3950,
      }
    ]
  }
];
