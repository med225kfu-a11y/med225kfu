
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public read access for active courses
CREATE POLICY "Anyone can view active courses"
  ON public.courses FOR SELECT
  USING (true);

-- Admin management
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add course_id to units table
ALTER TABLE public.units ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Insert the default "Block 1.3" course
INSERT INTO public.courses (id, name, display_order)
VALUES ('00000000-0000-0000-0000-000000000001', 'Block 1.3', 0);

-- Assign all existing units to "Block 1.3"
UPDATE public.units SET course_id = '00000000-0000-0000-0000-000000000001';

-- Make course_id NOT NULL after migration
ALTER TABLE public.units ALTER COLUMN course_id SET NOT NULL;
