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
