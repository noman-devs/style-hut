-- ====================================================================
-- STYLE HUT SEED DATA — WOMEN'S FASHION & LIFESTYLE (BANGLADESH)
-- ====================================================================

-- 1. STORE SETTINGS
INSERT INTO public.store_settings (setting_key, setting_value)
VALUES
('general', '{
  "store_name": "Style Hut",
  "tagline": "Be Your Own Style",
  "currency": "BDT",
  "currency_symbol": "৳",
  "email": "care@stylehutbd.com",
  "phone": "+880 1711-987654",
  "whatsapp": "+880 1711-987654",
  "address": "House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh",
  "delivery_inside_dhaka": 70,
  "delivery_outside_dhaka": 130,
  "free_delivery_threshold": 3000,
  "homepage_sections": {
    "latest_products": true,
    "new_arrivals": true,
    "best_sellers": true,
    "featured_products": true,
    "special_offers": true
  }
}'::jsonb),
('policies', '{
  "return_policy": "Style Hut offers a hassle-free 7-day exchange and return policy for unworn items with original tags and packaging intact. Contact our Dhaka hotline or WhatsApp for immediate assistance.",
  "privacy_policy": "Your privacy is paramount. Style Hut never sells or shares your personal contact or delivery information with third parties. Transactions are processed securely.",
  "terms_and_conditions": "By shopping at Style Hut, you agree to our standard Bangladesh e-commerce terms. Cash on Delivery is available across all 64 districts."
}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 2. SOCIAL LINKS
INSERT INTO public.social_links (platform, url, is_active, sort_order) VALUES
('Facebook', 'https://facebook.com/stylehutbd', true, 1),
('Instagram', 'https://instagram.com/stylehut.official', true, 2),
('YouTube', 'https://youtube.com/@stylehutbd', true, 3),
('TikTok', 'https://tiktok.com/@stylehut.bd', true, 4);

-- 3. PAYMENT SETTINGS
INSERT INTO public.payment_settings (provider, display_name, payment_number, account_type, instructions, is_enabled, sort_order) VALUES
('cod', 'Cash on Delivery (COD)', NULL, 'Pay upon delivery across Bangladesh', 'Pay in cash directly to the courier representative upon receiving your package. Please keep exact change ready.', true, 1),
('bkash', 'bKash Personal / Send Money', '01711-987654', 'Personal Account', 'Go to bKash app -> Send Money to 01711-987654 -> Enter total order amount -> Use your order or phone as reference -> Copy Transaction ID and enter below.', true, 2),
('nagad', 'Nagad Personal / Send Money', '01811-987654', 'Personal Account', 'Go to Nagad app -> Send Money to 01811-987654 -> Enter total order amount -> Enter reference -> Enter Transaction ID below.', true, 3),
('rocket', 'Rocket Mobile Banking', '01911-987654-7', 'Personal Account', 'Go to Rocket app -> Send Money to 01911-987654-7 (12 digits) -> Enter order total -> Copy Transaction ID and enter below.', true, 4)
ON CONFLICT (provider) DO UPDATE SET 
    payment_number = EXCLUDED.payment_number,
    instructions = EXCLUDED.instructions;

-- 4. BANNERS
INSERT INTO public.banners (title, subtitle, image_url, button_text, target_url, sort_order, is_active) VALUES
('Luxury Jamdani & Silk Heritage', 'Handwoven masterpieces crafted with timeless elegance for the modern woman', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80', 'Explore Sarees', '/category/saree', 1, true),
('Festive Kurti & Salwar Kameez', 'Vibrant pastels, delicate embroidery & premium breathable fabrics', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=80', 'Shop New Arrivals', '/category/salwar-kameez', 2, true),
('Handcrafted Royal Kundan Jewellery', 'Sparkle at every celebration with our 24k gold-plated statement pieces', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=80', 'Discover Jewels', '/category/jewellery', 3, true);

-- 5. ATTRIBUTES & VALUES
INSERT INTO public.product_attributes (id, name, slug) VALUES
('a0000000-0000-0000-0000-000000000001', 'Size', 'size'),
('a0000000-0000-0000-0000-000000000002', 'Color', 'color')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_attribute_values (id, attribute_id, value) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Small (S)'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Medium (M)'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Large (L)'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Extra Large (XL)'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Blush Pink'),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Deep Rose'),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'Midnight Black'),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'Ivory Gold')
ON CONFLICT DO NOTHING;

-- 6. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Saree', 'saree', 'Traditional Jamdani, Katan, Organza & Pure Silk Sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 1, true),
('c0000000-0000-0000-0000-000000000002', 'Salwar Kameez', 'salwar-kameez', 'Boutique 3-piece sets, organza dupattas and festive party wear', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', 2, true),
('c0000000-0000-0000-0000-000000000003', 'Kurti', 'kurti', 'Modern, fusion and classic embroidered tunics & kurtis', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80', 3, true),
('c0000000-0000-0000-0000-000000000004', 'Hijab', 'hijab', 'Premium georgette, modal and luxury festive abayas & hijabs', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80', 4, true),
('c0000000-0000-0000-0000-000000000005', 'Jewellery', 'jewellery', 'Kundan, Meenakari, Polki & Gold-plated bridal jewellery', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', 5, true),
('c0000000-0000-0000-0000-000000000006', 'Bags', 'bags', 'Embroidered potli bags, clutches and designer leather totes', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 6, true),
('c0000000-0000-0000-0000-000000000007', 'Shoes', 'shoes', 'Embellished bridal heels, velvet khussas and stylish flats', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 7, true),
('c0000000-0000-0000-0000-000000000008', 'Beauty', 'beauty', 'Fragrances, luxury body mists, attars & organic care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- 7. PRODUCTS (Simple and Variable)
-- Product 1: Variable Product (Kurti)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000001', 'Aura Embroidered Georgette Kurti', 'aura-embroidered-georgette-kurti', 'SH-KRT-001', 'Handcrafted with intricate zari and floral resham work on fine georgette. Comes with breathable lining for ultimate comfort during Dhaka summers and festive gatherings.', 'c0000000-0000-0000-0000-000000000003', 'variable', 2450.00, 1950.00, 32, true, 'published', 'Aura Embroidered Georgette Kurti | Style Hut BD', 'Shop premium embroidered kurtis in Bangladesh. Free delivery inside Dhaka on qualifying orders.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', 'Aura Kurti Front', 1),
('d0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Aura Kurti Detail', 2);

-- Variants for Product 1
INSERT INTO public.product_variants (id, product_id, sku, regular_price, sale_price, stock_quantity, is_active) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SH-KRT-001-S-PNK', 2450.00, 1950.00, 8, true),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'SH-KRT-001-M-PNK', 2450.00, 1950.00, 12, true),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'SH-KRT-001-L-PNK', 2450.00, 1950.00, 6, true),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'SH-KRT-001-M-ROSE', 2600.00, 2100.00, 6, true)
ON CONFLICT (sku) DO NOTHING;

-- Link variant attribute values
INSERT INTO public.variant_attribute_values (variant_id, attribute_value_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'), -- S
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005'), -- Blush Pink
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'), -- M
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005'), -- Blush Pink
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'), -- L
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005'), -- Blush Pink
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'), -- M
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006')  -- Deep Rose
ON CONFLICT DO NOTHING;

-- Product 2: Simple Product (Dhakai Jamdani Saree)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000002', 'Royal Heritage Dhakai Jamdani Saree', 'royal-heritage-dhakai-jamdani-saree', 'SH-SAR-001', 'Authentic 84-count handloom Dhakai Jamdani woven by traditional weavers of Narayanganj. Features mesmerizing buti motifs and regal gold zari border with matching blouse piece.', 'c0000000-0000-0000-0000-000000000001', 'simple', 8500.00, 7200.00, 15, true, 'published', 'Royal Dhakai Jamdani Saree | Style Hut', 'Handloom Dhakai Jamdani Saree in Bangladesh.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Jamdani Saree', 1);

-- Product 3: Variable Product (Salwar Kameez)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000003', 'Gulmohar 3-Piece Festive Salwar Suit', 'gulmohar-3-piece-festive-salwar-suit', 'SH-SLW-001', 'Three-piece luxury ensemble comprising digital printed silk kameez with hand-embellished neckline, organza scalloped dupatta, and comfortable silk trousers.', 'c0000000-0000-0000-0000-000000000002', 'variable', 4800.00, 3950.00, 20, true, 'published', 'Gulmohar 3-Piece Festive Suit | Style Hut BD', 'Shop festive salwar suits online in Dhaka.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Gulmohar Suit', 1);

INSERT INTO public.product_variants (id, product_id, sku, regular_price, sale_price, stock_quantity, is_active) VALUES
('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'SH-SLW-001-M-ROSE', 4800.00, 3950.00, 10, true),
('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'SH-SLW-001-L-ROSE', 4800.00, 3950.00, 10, true)
ON CONFLICT (sku) DO NOTHING;

-- Product 4: Simple Product (Kundan Necklace Set)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000004', 'Noor Royal Kundan Choker & Jhumka Set', 'noor-royal-kundan-choker-jhumka-set', 'SH-JWL-001', 'Exquisite 24K gold-plated Kundan choker with emerald bead drops and matching oversized Jhumkas. Hand-set stones with antique matte finish.', 'c0000000-0000-0000-0000-000000000005', 'simple', 3200.00, 2650.00, 14, true, 'published', 'Noor Kundan Choker Set | Style Hut BD', 'Bridal and party kundan jewellery set.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Kundan Choker', 1);

-- Product 5: Simple Product (Embroidered Velvet Potli Bag)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000005', 'Zahra Hand-Embroidered Velvet Potli', 'zahra-hand-embroidered-velvet-potli', 'SH-BAG-001', 'Rich velvet bag with fine pearl and zardozi embroidery. Features braided gold drawstring and ornate tassel embellishments. Perfectly pairs with sarees.', 'c0000000-0000-0000-0000-000000000006', 'simple', 1850.00, 1450.00, 25, false, 'published', 'Zahra Velvet Potli Bag | Style Hut', 'Luxury evening clutches and potli bags.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Velvet Potli Bag', 1);

-- Product 6: Simple Product (Premium Silk Hijab)
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status, seo_title, seo_description) VALUES
('d0000000-0000-0000-0000-000000000006', 'Medina Silk Premium Modest Hijab', 'medina-silk-premium-modest-hijab', 'SH-HJB-001', 'Non-slip, breathable Medina Silk scarf with subtle sheen. Generous 190x75cm cut allows effortless draping with lasting elegance.', 'c0000000-0000-0000-0000-000000000004', 'simple', 950.00, 750.00, 40, false, 'published', 'Medina Silk Premium Hijab | Style Hut BD', 'Breathable Medina silk scarves.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
('d0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80', 'Silk Hijab', 1);
