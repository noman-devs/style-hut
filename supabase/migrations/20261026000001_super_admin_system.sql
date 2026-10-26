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
