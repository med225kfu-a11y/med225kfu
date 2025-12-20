-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT NOT NULL DEFAULT 'The Scientific Community of Med225',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings (public read, admin write)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (site_title) VALUES ('The Scientific Community of Med225');

-- Create units table
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on units
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- RLS policies for units (public read, admin write)
CREATE POLICY "Anyone can view units"
ON public.units
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage units"
ON public.units
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create lesson_status enum
CREATE TYPE public.lesson_status AS ENUM (
    'uploaded_transcription',
    'will_be_transcribed',
    'no_transcription',
    'previous_batch_sufficient'
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status lesson_status NOT NULL DEFAULT 'no_transcription',
    transcription_url TEXT,
    summary_url TEXT,
    notes TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS policies for lessons (public read, admin write)
CREATE POLICY "Anyone can view lessons"
ON public.lessons
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);

-- Storage policies for files bucket
CREATE POLICY "Anyone can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'files');

CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();