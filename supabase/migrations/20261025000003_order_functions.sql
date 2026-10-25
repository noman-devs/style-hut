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
    v_delivery_fee NUMERIC(10, 2) := 70.00; -- Default inside Dhaka ৳70, outside Dhaka ৳130
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
