-- Create categories table (fixed, non-editable)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- No insert/update/delete policies - categories are fixed and managed only via migrations

-- Add category_id to units table
ALTER TABLE public.units ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Insert the three fixed categories
INSERT INTO public.categories (name, display_order) VALUES
    ('Pre-Mid', 0),
    ('Post-Mid', 1),
    ('Additional', 2);

-- Delete the current placeholder units (they have no lessons)
DELETE FROM public.units WHERE name IN ('Pre-Mid', 'Post-Mid', 'Additional');

-- Make category_id NOT NULL after cleanup (new units must have a category)
ALTER TABLE public.units ALTER COLUMN category_id SET NOT NULL;