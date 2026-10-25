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
