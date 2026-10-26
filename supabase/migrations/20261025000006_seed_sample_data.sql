-- ====================================================================
-- SECTION: SAMPLE SEED DATA FOR STYLE HUT
-- Populates initial boutique categories, attributes, products, and banners
-- ====================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Saree', 'saree', 'Traditional Jamdani, Katan, Organza & Pure Silk Sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Salwar Kameez', 'salwar-kameez', 'Boutique 3-piece sets, organza dupattas and festive party wear', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Kurti', 'kurti', 'Modern, fusion and classic embroidered tunics & kurtis', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Hijab', 'hijab', 'Premium georgette, modal and luxury festive abayas & hijabs', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Jewellery', 'jewellery', 'Kundan, Meenakari, Polki & Gold-plated bridal jewellery', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', 5, true),
  ('c1000000-0000-0000-0000-000000000006', 'Bags', 'bags', 'Embroidered potli bags, clutches and designer leather totes', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 2. SEED ATTRIBUTES (Color & Size)
INSERT INTO public.product_attributes (id, name, slug)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Color', 'color'),
  ('a1000000-0000-0000-0000-000000000002', 'Size', 'size')
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED ATTRIBUTE VALUES
INSERT INTO public.product_attribute_values (id, attribute_id, value, color_hex, is_active, sort_order)
VALUES
  ('ba000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Blush Pink', '#FFC0CB', true, 1),
  ('ba000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Deep Rose', '#A61E4D', true, 2),
  ('ba000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Midnight Black', '#1F1418', true, 3),
  ('ba000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Ivory Gold', '#C9A34E', true, 4),
  ('ba000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Emerald Green', '#008000', true, 5),
  ('ba000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Pearl White', '#FFFFFF', true, 6),
  ('ba000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Royal Blue', '#0000FF', true, 7),
  ('ba000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Ruby Red', '#FF0000', true, 8),
  ('bb000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'XS', NULL, true, 1),
  ('bb000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'S', NULL, true, 2),
  ('bb000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'M', NULL, true, 3),
  ('bb000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'L', NULL, true, 4),
  ('bb000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'XL', NULL, true, 5),
  ('bb000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'XXL', NULL, true, 6),
  ('bb000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'Free Size', NULL, true, 7)
ON CONFLICT (id) DO UPDATE SET
  color_hex = EXCLUDED.color_hex,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 4. SEED PRODUCTS
INSERT INTO public.products (id, name, slug, sku, description, category_id, product_type, regular_price, sale_price, stock_quantity, featured, status)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Aura Embroidered Georgette Kurti', 'aura-embroidered-georgette-kurti', 'SH-KRT-001', 'Handcrafted with intricate zari and floral resham work on fine georgette. Comes with breathable lining for ultimate comfort during Dhaka summers and festive gatherings.', 'c1000000-0000-0000-0000-000000000003', 'variable', 2450.00, 1950.00, 35, true, 'published'),
  ('f1000000-0000-0000-0000-000000000002', 'Royal Dhakai Jamdani Saree - 84 Count', 'royal-dhakai-jamdani-saree-84-count', 'SH-SAR-001', 'Authentic hand-woven Dhakai Jamdani from the master weavers of Demra, Narayanganj. Features traditional floral motifs with subtle gold zari accents.', 'c1000000-0000-0000-0000-000000000001', 'simple', 9800.00, 8500.00, 8, true, 'published'),
  ('f1000000-0000-0000-0000-000000000003', 'Noor Luxury 3-Piece Silk Salwar Suit', 'noor-luxury-3-piece-silk-salwar-suit', 'SH-SS-001', 'Raw silk kameez with hand-embroidered neckline, paired with tailored trousers and a magnificent organza digital printed dupatta.', 'c1000000-0000-0000-0000-000000000002', 'variable', 4850.00, 4200.00, 24, true, 'published'),
  ('f1000000-0000-0000-0000-000000000004', 'Kundan Choker & Jhumka Bridal Set', 'kundan-choker-jhumka-bridal-set', 'SH-JWL-001', '24k micro gold plated brass choker embellished with handcrafted faux pearls and emerald hydro stones.', 'c1000000-0000-0000-0000-000000000005', 'simple', 3650.00, 2990.00, 15, true, 'published'),
  ('f1000000-0000-0000-0000-000000000005', 'Pure Silk Organza Hand-Painted Saree', 'pure-silk-organza-hand-painted-saree', 'SH-SAR-002', 'Featherlight pure organza saree adorned with pastel hand-painted water-colour flowers and scallop cutwork borders.', 'c1000000-0000-0000-0000-000000000001', 'simple', 6200.00, 5400.00, 10, true, 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- 5. SEED PRODUCT IMAGES
INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Front View Pink Kurti', 1),
  ('f1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', 'Model Side Angle', 2),
  ('f1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Jamdani Saree Pallu', 1),
  ('f1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Salwar Suit Full Set', 1),
  ('f1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Kundan Choker Close-up', 1),
  ('f1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', 'Organza Hand-Painted Saree', 1)
ON CONFLICT DO NOTHING;

-- 6. SEED VARIANTS FOR VARIABLE PRODUCTS
INSERT INTO public.product_variants (id, product_id, sku, regular_price, sale_price, stock_quantity, image_url, is_active)
VALUES
  ('fa000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'SH-KRT-PNK-S', 2450.00, 1950.00, 10, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', true),
  ('fa000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'SH-KRT-PNK-M', 2450.00, 1950.00, 12, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', true),
  ('fa000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'SH-KRT-PNK-L', 2450.00, 1950.00, 8, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', true),
  ('fa000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'SH-KRT-BLK-M', 2550.00, 2050.00, 5, 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (sku) DO UPDATE SET
  regular_price = EXCLUDED.regular_price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- Link Variant Attributes (fa1 = Blush Pink + S, fa2 = Blush Pink + M, fa3 = Blush Pink + L, fa4 = Midnight Black + M)
INSERT INTO public.variant_attribute_values (variant_id, attribute_value_id)
VALUES
  ('fa000000-0000-0000-0000-000000000001', 'ba000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000002'),
  ('fa000000-0000-0000-0000-000000000002', 'ba000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000003', 'ba000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000004'),
  ('fa000000-0000-0000-0000-000000000004', 'ba000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 7. SEED BANNERS
INSERT INTO public.banners (id, title, subtitle, image_url, button_text, target_url, sort_order, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Luxury Jamdani & Silk Heritage', 'Handcrafted with timeless elegance for the modern Bangladeshi woman', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80', 'Explore Sarees', '/category/saree', 1, true),
  ('b1000000-0000-0000-0000-000000000002', 'Festive Kurti & Salwar Kameez', 'Vibrant pastels, delicate embroidery & premium breathable fabrics', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=80', 'Shop New Arrivals', '/category/salwar-kameez', 2, true),
  ('b1000000-0000-0000-0000-000000000003', 'Handcrafted Royal Kundan Jewellery', 'Sparkle at every celebration with our 24k gold-plated statement pieces', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=80', 'Discover Jewels', '/category/jewellery', 3, true)
ON CONFLICT DO NOTHING;

-- 8. SEED PAYMENT SETTINGS
INSERT INTO public.payment_settings (id, provider, display_name, payment_number, account_type, instructions, is_enabled, sort_order)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'cod', 'Cash on Delivery (COD)', NULL, 'Pay upon delivery across Bangladesh', 'Pay in cash directly to the courier representative upon receiving your package.', true, 1),
  ('e1000000-0000-0000-0000-000000000002', 'bkash', 'bKash Personal / Send Money', '01711-987654', 'Personal Account', 'Go to bKash app -> Send Money to 01711-987654 -> Copy Transaction ID and enter in checkout.', true, 2),
  ('e1000000-0000-0000-0000-000000000003', 'nagad', 'Nagad Personal / Send Money', '01811-987654', 'Personal Account', 'Go to Nagad app -> Send Money to 01811-987654 -> Copy Transaction ID and enter in checkout.', true, 3),
  ('e1000000-0000-0000-0000-000000000004', 'rocket', 'Rocket Mobile Banking', '01911-987654-7', 'Personal Account', 'Go to Rocket app -> Send Money to 01911-987654-7 -> Copy Transaction ID and enter in checkout.', true, 4)
ON CONFLICT (provider) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  payment_number = EXCLUDED.payment_number,
  instructions = EXCLUDED.instructions;

-- 9. SEED STORE SETTINGS
INSERT INTO public.store_settings (setting_key, setting_value)
VALUES
  ('general', '{"store_name":"Style Hut","tagline":"Be Your Own Style","currency":"BDT","currency_symbol":"৳","email":"care@stylehutbd.com","phone":"+880 1711-987654","whatsapp":"+880 1711-987654","address":"House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh","delivery_inside_dhaka":70,"delivery_outside_dhaka":130,"free_delivery_threshold":3000}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;

-- 10. SEED SOCIAL LINKS
INSERT INTO public.social_links (platform, url, is_active, sort_order)
VALUES
  ('Facebook', 'https://facebook.com/stylehutbd', true, 1),
  ('Instagram', 'https://instagram.com/stylehut.official', true, 2),
  ('YouTube', 'https://youtube.com/@stylehutbd', true, 3),
  ('TikTok', 'https://tiktok.com/@stylehut.bd', true, 4)
ON CONFLICT DO NOTHING;
