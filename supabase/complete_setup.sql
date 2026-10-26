-- ====================================================================
-- STYLE HUT COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Copy this entire file and run it inside Supabase Dashboard -> SQL Editor
-- ====================================================================


-- ====================================================================
-- PART: supabase\migrations\20261025000001_initial_schema.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT E-COMMERCE DATABASE INITIAL SCHEMA
-- Women's Fashion & Lifestyle Store (Bangladesh)
-- ====================================================================

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger for new user signup -> auto create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL DEFAULT 'simple' CHECK (product_type IN ('simple', 'variable')),
    regular_price NUMERIC(10, 2) NOT NULL CHECK (regular_price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    featured BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0
);

-- 5. PRODUCT ATTRIBUTES TABLE (e.g. Size, Color)
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- 6. PRODUCT ATTRIBUTE VALUES TABLE (e.g. Small, Medium, Pink, Deep Rose)
CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL
);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    regular_price NUMERIC(10, 2) NOT NULL CHECK (regular_price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. VARIANT ATTRIBUTE VALUES (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.variant_attribute_values (
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES public.product_attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

-- 9. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id, variant_id)
);

-- 10. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT,
    district TEXT,
    division TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id),
    UNIQUE(session_id)
);

-- 12. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    shipping_address TEXT NOT NULL,
    division TEXT,
    district TEXT,
    area TEXT,
    notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL CHECK (delivery_fee >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'awaiting_verification', 'paid', 'rejected', 'refunded')),
    transaction_id TEXT,
    sender_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ORDER ITEMS TABLE (snapshots)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    variant_description TEXT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0)
);

-- 15. PAYMENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    payment_number TEXT,
    account_type TEXT,
    instructions TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0
);

-- 16. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT NOT NULL DEFAULT 'Shop Now',
    target_url TEXT NOT NULL DEFAULT '/products',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. SOCIAL LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0
);

-- 19. ORDER EVENTS TABLE (audit logs)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity_change INT NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES for fast retrieval
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);


-- ====================================================================
-- PART: supabase\migrations\20261025000002_rls_policies.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ====================================================================

-- Function to check if current user is an admin or manager
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO current_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN current_role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile info"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- 2. CATEGORIES POLICIES
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- 3. PRODUCTS POLICIES
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- 4. PRODUCT IMAGES POLICIES
CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- 5. ATTRIBUTES & VALUES POLICIES
CREATE POLICY "Public can view product attributes"
    ON public.product_attributes FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product attributes"
    ON public.product_attributes FOR ALL
    USING (public.is_admin());

CREATE POLICY "Public can view product attribute values"
    ON public.product_attribute_values FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage product attribute values"
    ON public.product_attribute_values FOR ALL
    USING (public.is_admin());

-- 6. PRODUCT VARIANTS POLICIES
CREATE POLICY "Public can view active product variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage product variants"
    ON public.product_variants FOR ALL
    USING (public.is_admin());

CREATE POLICY "Public can view variant attribute values"
    ON public.variant_attribute_values FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage variant attribute values"
    ON public.variant_attribute_values FOR ALL
    USING (public.is_admin());

-- 7. WISHLISTS POLICIES
CREATE POLICY "Users can view their own wishlist"
    ON public.wishlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
    ON public.wishlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
    ON public.wishlists FOR DELETE
    USING (auth.uid() = user_id);

-- 8. ADDRESSES POLICIES
CREATE POLICY "Users can manage their own addresses"
    ON public.addresses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. CARTS & CART ITEMS POLICIES
CREATE POLICY "Users can view their own cart"
    ON public.carts FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage their own cart"
    ON public.carts FOR ALL
    USING (auth.uid() = user_id OR session_id IS NOT NULL)
    WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Cart items viewable by cart owner"
    ON public.cart_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE carts.id = cart_items.cart_id 
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

CREATE POLICY "Cart items manageable by cart owner"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE carts.id = cart_items.cart_id 
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE carts.id = cart_items.cart_id 
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

-- 10. ORDERS POLICIES
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can manage orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

-- 11. ORDER ITEMS POLICIES
CREATE POLICY "Users can view items in their orders"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Admins can manage order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- 12. PAYMENT SETTINGS POLICIES
CREATE POLICY "Public can view enabled payment settings"
    ON public.payment_settings FOR SELECT
    USING (is_enabled = true OR public.is_admin());

CREATE POLICY "Admins can manage payment settings"
    ON public.payment_settings FOR ALL
    USING (public.is_admin());

-- 13. BANNERS POLICIES
CREATE POLICY "Public can view active banners"
    ON public.banners FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage banners"
    ON public.banners FOR ALL
    USING (public.is_admin());

-- 14. STORE SETTINGS POLICIES
CREATE POLICY "Public can view store settings"
    ON public.store_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage store settings"
    ON public.store_settings FOR ALL
    USING (public.is_admin());

-- 15. SOCIAL LINKS POLICIES
CREATE POLICY "Public can view active social links"
    ON public.social_links FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage social links"
    ON public.social_links FOR ALL
    USING (public.is_admin());

-- 16. ORDER EVENTS & STOCK MOVEMENTS POLICIES
CREATE POLICY "Admins can view and manage order events"
    ON public.order_events FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can view and manage stock movements"
    ON public.stock_movements FOR ALL
    USING (public.is_admin());


-- ====================================================================
-- PART: supabase\migrations\20261025000003_order_functions.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT SECURE ORDER CREATION & ATOMIC INVENTORY PROCESSING
-- Prevents overselling, validates prices server-side, idempotency support
-- ====================================================================

-- Function: create_order_secure
-- Executed with SECURITY DEFINER to allow atomic checkout without exposing service-role keys
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_customer_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_shipping_address TEXT,
    p_division TEXT,
    p_district TEXT,
    p_area TEXT,
    p_notes TEXT,
    p_payment_method TEXT,
    p_transaction_id TEXT,
    p_sender_phone TEXT,
    p_items JSONB, -- Array of {product_id, variant_id, quantity}
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_order_number TEXT;
    v_item RECORD;
    v_product RECORD;
    v_variant RECORD;
    v_unit_price NUMERIC(10, 2);
    v_line_total NUMERIC(10, 2);
    v_subtotal NUMERIC(10, 2) := 0;
    v_delivery_fee NUMERIC(10, 2) := 70.00; -- Default inside Dhaka à§³70, outside Dhaka à§³130
    v_total NUMERIC(10, 2) := 0;
    v_initial_status TEXT := 'pending';
    v_initial_payment_status TEXT := 'unpaid';
    v_variant_desc TEXT;
    v_sku TEXT;
    v_existing_order UUID;
BEGIN
    -- 1. Check current authenticated user
    v_user_id := auth.uid();

    -- 2. Input validation
    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;

    IF p_phone IS NULL OR trim(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;

    IF p_shipping_address IS NULL OR trim(p_shipping_address) = '' THEN
        RAISE EXCEPTION 'Delivery address is required';
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;

    -- 3. Check delivery fee based on division
    IF p_division IS NOT NULL AND lower(trim(p_division)) != 'dhaka' THEN
        v_delivery_fee := 130.00;
    END IF;

    -- 4. Payment status rules
    IF p_payment_method IN ('bkash', 'nagad', 'rocket') THEN
        IF p_transaction_id IS NOT NULL AND trim(p_transaction_id) != '' THEN
            v_initial_payment_status := 'awaiting_verification';
        ELSE
            v_initial_payment_status := 'unpaid';
        END IF;
    ELSIF p_payment_method = 'cod' THEN
        v_initial_payment_status := 'unpaid';
    END IF;

    -- 5. Idempotency check: if transaction_id provided and already used, prevent duplicate order
    IF p_transaction_id IS NOT NULL AND trim(p_transaction_id) != '' THEN
        SELECT id INTO v_existing_order
        FROM public.orders
        WHERE transaction_id = trim(p_transaction_id)
        LIMIT 1;

        IF v_existing_order IS NOT NULL THEN
            RAISE EXCEPTION 'An order with this transaction ID already exists. Please verify your order in your account or contact support.';
        END IF;
    END IF;

    -- Generate unique human-readable order number (e.g., SH-2026-XXXX)
    v_order_number := 'SH-' || to_char(now(), 'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 5));

    -- Create empty order first
    INSERT INTO public.orders (
        order_number,
        user_id,
        customer_name,
        phone,
        email,
        shipping_address,
        division,
        district,
        area,
        notes,
        subtotal,
        delivery_fee,
        discount,
        total,
        order_status,
        payment_method,
        payment_status,
        transaction_id,
        sender_phone
    ) VALUES (
        v_order_number,
        v_user_id,
        trim(p_customer_name),
        trim(p_phone),
        trim(p_email),
        trim(p_shipping_address),
        p_division,
        p_district,
        p_area,
        p_notes,
        0, -- Calculated below
        v_delivery_fee,
        0,
        0, -- Calculated below
        v_initial_status,
        p_payment_method,
        v_initial_payment_status,
        trim(p_transaction_id),
        trim(p_sender_phone)
    ) RETURNING id INTO v_order_id;

    -- Process each item with row-locking FOR UPDATE
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
        product_id UUID,
        variant_id UUID,
        quantity INT
    )
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than zero';
        END IF;

        -- Check variable product vs simple product
        IF v_item.variant_id IS NOT NULL THEN
            -- Lock and inspect variant
            SELECT pv.*, p.name as product_name, p.status as product_status
            INTO v_variant
            FROM public.product_variants pv
            JOIN public.products p ON p.id = pv.product_id
            WHERE pv.id = v_item.variant_id AND pv.product_id = v_item.product_id
            FOR UPDATE OF pv;

            IF v_variant.id IS NULL THEN
                RAISE EXCEPTION 'Selected product variant not found or invalid';
            END IF;

            IF NOT v_variant.is_active OR v_variant.product_status != 'published' THEN
                RAISE EXCEPTION 'The item "%" is currently unavailable', v_variant.product_name;
            END IF;

            IF v_variant.stock_quantity < v_item.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %', 
                    v_variant.product_name, v_variant.stock_quantity, v_item.quantity;
            END IF;

            -- Deduct stock
            UPDATE public.product_variants
            SET stock_quantity = stock_quantity - v_item.quantity,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_variant.id;

            -- Log stock movement
            INSERT INTO public.stock_movements (product_id, variant_id, quantity_change, reason, created_by)
            VALUES (v_item.product_id, v_item.variant_id, -v_item.quantity, 'Order ' || v_order_number, v_user_id);

            -- Price check
            v_unit_price := COALESCE(v_variant.sale_price, v_variant.regular_price);
            v_line_total := v_unit_price * v_item.quantity;
            v_subtotal := v_subtotal + v_line_total;
            v_sku := v_variant.sku;

            -- Get variant attribute description
            SELECT string_agg(pa.name || ': ' || pav.value, ', ')
            INTO v_variant_desc
            FROM public.variant_attribute_values vav
            JOIN public.product_attribute_values pav ON pav.id = vav.attribute_value_id
            JOIN public.product_attributes pa ON pa.id = pav.attribute_id
            WHERE vav.variant_id = v_variant.id;

            -- Insert order item snapshot
            INSERT INTO public.order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                sku,
                variant_description,
                unit_price,
                quantity,
                line_total
            ) VALUES (
                v_order_id,
                v_item.product_id,
                v_item.variant_id,
                v_variant.product_name,
                v_sku,
                v_variant_desc,
                v_unit_price,
                v_item.quantity,
                v_line_total
            );

        ELSE
            -- Simple product without variant
            SELECT * INTO v_product
            FROM public.products
            WHERE id = v_item.product_id
            FOR UPDATE;

            IF v_product.id IS NULL THEN
                RAISE EXCEPTION 'Product not found';
            END IF;

            IF v_product.status != 'published' THEN
                RAISE EXCEPTION 'Product "%" is not currently available for purchase', v_product.name;
            END IF;

            IF v_product.stock_quantity < v_item.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for "%". Available: %, requested: %', 
                    v_product.name, v_product.stock_quantity, v_item.quantity;
            END IF;

            -- Deduct stock
            UPDATE public.products
            SET stock_quantity = stock_quantity - v_item.quantity,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_product.id;

            -- Log stock movement
            INSERT INTO public.stock_movements (product_id, variant_id, quantity_change, reason, created_by)
            VALUES (v_item.product_id, NULL, -v_item.quantity, 'Order ' || v_order_number, v_user_id);

            v_unit_price := COALESCE(v_product.sale_price, v_product.regular_price);
            v_line_total := v_unit_price * v_item.quantity;
            v_subtotal := v_subtotal + v_line_total;

            -- Insert order item snapshot
            INSERT INTO public.order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                sku,
                variant_description,
                unit_price,
                quantity,
                line_total
            ) VALUES (
                v_order_id,
                v_item.product_id,
                NULL,
                v_product.name,
                v_product.sku,
                NULL,
                v_unit_price,
                v_item.quantity,
                v_line_total
            );
        END IF;
    END LOOP;

    -- Update final order total
    v_total := v_subtotal + v_delivery_fee;

    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_total
    WHERE id = v_order_id;

    -- Insert order audit event
    INSERT INTO public.order_events (order_id, event_type, description, created_by)
    VALUES (
        v_order_id,
        'ORDER_PLACED',
        'Order placed successfully by ' || p_customer_name || ' (' || p_payment_method || ')',
        v_user_id
    );

    -- Return safe customer response
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total', v_total,
        'subtotal', v_subtotal,
        'delivery_fee', v_delivery_fee,
        'order_status', v_initial_status,
        'payment_status', v_initial_payment_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to public and authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_secure TO anon, authenticated;

-- Function: cancel_order_and_restock (Admin only)
CREATE OR REPLACE FUNCTION public.cancel_order_and_restock(
    p_order_id UUID,
    p_reason TEXT DEFAULT 'Order cancelled'
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_admin_id UUID := auth.uid();
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: only store administrators can restock cancelled orders';
    END IF;

    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.order_status = 'cancelled' THEN
        RAISE EXCEPTION 'This order has already been cancelled';
    END IF;

    -- Restock items
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
            UPDATE public.product_variants
            SET stock_quantity = stock_quantity + v_item.quantity,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_item.variant_id;

            INSERT INTO public.stock_movements (product_id, variant_id, quantity_change, reason, created_by)
            VALUES (v_item.product_id, v_item.variant_id, v_item.quantity, 'Restock: ' || p_reason || ' (' || v_order.order_number || ')', v_admin_id);
        ELSE
            UPDATE public.products
            SET stock_quantity = stock_quantity + v_item.quantity,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_item.product_id;

            INSERT INTO public.stock_movements (product_id, variant_id, quantity_change, reason, created_by)
            VALUES (v_item.product_id, NULL, v_item.quantity, 'Restock: ' || p_reason || ' (' || v_order.order_number || ')', v_admin_id);
        END IF;
    END LOOP;

    -- Update order status
    UPDATE public.orders
    SET order_status = 'cancelled',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    -- Log event
    INSERT INTO public.order_events (order_id, event_type, description, created_by)
    VALUES (p_order_id, 'ORDER_CANCELLED', 'Order cancelled and stock restocked: ' || p_reason, v_admin_id);

    RETURN jsonb_build_object('success', true, 'message', 'Order cancelled and stock restored successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.cancel_order_and_restock TO authenticated;

-- Function: track_order_public (Allows customers to track by order number + phone without revealing other customer data)
CREATE OR REPLACE FUNCTION public.track_order_public(
    p_order_number TEXT,
    p_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_items JSONB;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE lower(order_number) = lower(trim(p_order_number))
      AND right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10);

    IF v_order.id IS NULL THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'product_name', product_name,
            'sku', sku,
            'variant_description', variant_description,
            'unit_price', unit_price,
            'quantity', quantity,
            'line_total', line_total
        )
    ) INTO v_items
    FROM public.order_items
    WHERE order_id = v_order.id;

    RETURN jsonb_build_object(
        'found', true,
        'order_number', v_order.order_number,
        'customer_name', v_order.customer_name,
        'order_status', v_order.order_status,
        'payment_method', v_order.payment_method,
        'payment_status', v_order.payment_status,
        'total', v_order.total,
        'subtotal', v_order.subtotal,
        'delivery_fee', v_order.delivery_fee,
        'created_at', v_order.created_at,
        'shipping_address', v_order.shipping_address,
        'items', COALESCE(v_items, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.track_order_public TO anon, authenticated;


-- ====================================================================
-- PART: supabase\migrations\20261025000004_storage_setup.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT SUPABASE STORAGE BUCKETS & POLICIES
-- ====================================================================

-- 1. Create storage buckets for public assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('categories', 'categories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('branding', 'branding', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies: Public can read all images in these buckets
CREATE POLICY "Public image read access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('products', 'categories', 'banners', 'branding'));

-- 3. Storage Policies: Only Admins can upload/modify/delete images
CREATE POLICY "Admins can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );

CREATE POLICY "Admins can update images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );

CREATE POLICY "Admins can delete images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id IN ('products', 'categories', 'banners', 'branding')
        AND (public.is_admin())
    );


-- ====================================================================
-- PART: supabase\migrations\20261025000005_variation_attributes.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT PRODUCT VARIATION ATTRIBUTES MIGRATION
-- Adds color_hex, is_active, and sort_order to product_attribute_values
-- ====================================================================

ALTER TABLE public.product_attribute_values 
ADD COLUMN IF NOT EXISTS color_hex TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Index for sorting and active attribute retrieval
CREATE INDEX IF NOT EXISTS idx_pav_attr_sort 
ON public.product_attribute_values(attribute_id, sort_order);

-- Seed/update default color hexes and sizes if attributes exist
UPDATE public.product_attribute_values SET color_hex = '#FFC0CB', sort_order = 1 WHERE value ILIKE '%Blush Pink%' OR value ILIKE '%Pink%';
UPDATE public.product_attribute_values SET color_hex = '#A61E4D', sort_order = 2 WHERE value ILIKE '%Deep Rose%' OR value ILIKE '%Rose%';
UPDATE public.product_attribute_values SET color_hex = '#1F1418', sort_order = 3 WHERE value ILIKE '%Midnight Black%' OR value ILIKE '%Black%';
UPDATE public.product_attribute_values SET color_hex = '#C9A34E', sort_order = 4 WHERE value ILIKE '%Ivory Gold%' OR value ILIKE '%Gold%';
UPDATE public.product_attribute_values SET color_hex = '#008000', sort_order = 5 WHERE value ILIKE '%Emerald%' OR value ILIKE '%Green%';
UPDATE public.product_attribute_values SET color_hex = '#FFFFFF', sort_order = 6 WHERE value ILIKE '%White%';
UPDATE public.product_attribute_values SET color_hex = '#0000FF', sort_order = 7 WHERE value ILIKE '%Blue%';
UPDATE public.product_attribute_values SET color_hex = '#FF0000', sort_order = 8 WHERE value ILIKE '%Red%';

UPDATE public.product_attribute_values SET sort_order = 1 WHERE value = 'XS';
UPDATE public.product_attribute_values SET sort_order = 2 WHERE value = 'S' OR value ILIKE 'Small%';
UPDATE public.product_attribute_values SET sort_order = 3 WHERE value = 'M' OR value ILIKE 'Medium%';
UPDATE public.product_attribute_values SET sort_order = 4 WHERE value = 'L' OR value ILIKE 'Large%';
UPDATE public.product_attribute_values SET sort_order = 5 WHERE value = 'XL' OR value ILIKE 'Extra Large%';
UPDATE public.product_attribute_values SET sort_order = 6 WHERE value = 'XXL';
UPDATE public.product_attribute_values SET sort_order = 7 WHERE value ILIKE '%Free Size%';


-- ====================================================================
-- PART: supabase\migrations\20261025000006_seed_sample_data.sql
-- ====================================================================

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
  ('general', '{"store_name":"Style Hut","tagline":"Be Your Own Style","currency":"BDT","currency_symbol":"à§³","email":"care@stylehutbd.com","phone":"+880 1711-987654","whatsapp":"+880 1711-987654","address":"House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh","delivery_inside_dhaka":70,"delivery_outside_dhaka":130,"free_delivery_threshold":3000}'::jsonb)
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


-- ====================================================================
-- PART: supabase\migrations\20261026000001_super_admin_system.sql
-- ====================================================================

-- ====================================================================
-- STYLE HUT SUPER ADMIN & ROLE-BASED ACCESS CONTROL (RBAC) MIGRATION
-- Adds super_admin role, email tracking, and Admin Management functions
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Ensure email column exists on profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update role check constraint to support super_admin
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'admin', 'manager', 'super_admin'));

-- 3. Update is_admin() function to include super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO current_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN current_role IN ('super_admin', 'admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create is_super_admin() helper function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
    caller_email TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
    SELECT email INTO caller_email FROM auth.users WHERE id = auth.uid();

    RETURN current_role = 'super_admin' OR caller_email = 'sohel229229@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 5. Backfill emails in profiles from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 6. Set root super admin account
UPDATE public.profiles
SET role = 'super_admin',
    account_status = 'active',
    full_name = 'Super Admin',
    email = 'sohel229229@gmail.com'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'sohel229229@gmail.com');

-- 7. Update handle_new_user() trigger to also save email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        'customer',
        new.email
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function: get_admin_users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    role TEXT,
    account_status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.full_name, 'Administrator') AS full_name,
        COALESCE(p.phone, '') AS phone,
        COALESCE(p.email, u.email, 'unknown@stylehutbd.com') AS email,
        p.role,
        p.account_status,
        p.created_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE p.role IN ('super_admin', 'admin', 'manager')
    ORDER BY (p.role = 'super_admin') DESC, p.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 9. Function: create_admin_user
CREATE OR REPLACE FUNCTION public.create_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_phone TEXT DEFAULT '',
    p_role TEXT DEFAULT 'admin'
)
RETURNS JSONB AS $$
DECLARE
    v_new_id UUID := gen_random_uuid();
    v_encrypted_pw TEXT;
    v_assigned_role TEXT := 'admin';
BEGIN
    IF p_email IS NULL OR trim(p_email) = '' THEN
        RAISE EXCEPTION 'Valid email address is required';
    END IF;

    IF p_password IS NULL OR length(p_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;

    IF p_role IN ('super_admin', 'admin') THEN
        v_assigned_role := p_role;
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))) THEN
        RAISE EXCEPTION 'An account with email % already exists', p_email;
    END IF;

    v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        v_new_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        lower(trim(p_email)),
        v_encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', p_name, 'phone', p_phone),
        now(),
        now()
    );

    INSERT INTO public.profiles (
        id,
        full_name,
        phone,
        role,
        account_status,
        email
    ) VALUES (
        v_new_id,
        p_name,
        p_phone,
        v_assigned_role,
        'active',
        lower(trim(p_email))
    ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        account_status = 'active';

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_new_id,
        'email', lower(trim(p_email)),
        'role', v_assigned_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- 10. Function: delete_admin_user
CREATE OR REPLACE FUNCTION public.delete_admin_user(p_admin_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_target_email TEXT;
BEGIN
    SELECT email INTO v_target_email FROM auth.users WHERE id = p_admin_id;
    IF v_target_email = 'sohel229229@gmail.com' THEN
        RAISE EXCEPTION 'Root Super Admin cannot be deleted';
    END IF;

    DELETE FROM auth.users WHERE id = p_admin_id;
    DELETE FROM public.profiles WHERE id = p_admin_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 11. Function: toggle_admin_status
CREATE OR REPLACE FUNCTION public.toggle_admin_status(p_admin_id UUID, p_status TEXT)
RETURNS JSONB AS $$
DECLARE
    v_target_email TEXT;
BEGIN
    SELECT email INTO v_target_email FROM auth.users WHERE id = p_admin_id;
    IF v_target_email = 'sohel229229@gmail.com' THEN
        RAISE EXCEPTION 'Root Super Admin cannot be blocked';
    END IF;

    IF p_status NOT IN ('active', 'blocked') THEN
        p_status := 'active';
    END IF;

    UPDATE public.profiles
    SET account_status = p_status,
        updated_at = now()
    WHERE id = p_admin_id;

    RETURN jsonb_build_object('success', true, 'status', p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.delete_admin_user(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.toggle_admin_status(UUID, TEXT) TO authenticated, anon;

