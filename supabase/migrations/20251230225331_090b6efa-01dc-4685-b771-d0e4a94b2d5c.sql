-- Create lesson_additional_files table for multiple files per lesson
CREATE TABLE public.lesson_additional_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    file_url TEXT,
    link_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_additional_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view additional files" 
ON public.lesson_additional_files 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage additional files" 
ON public.lesson_additional_files 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create lesson_help_center table for help center entries
CREATE TABLE public.lesson_help_center (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('text', 'link')),
    content TEXT NOT NULL,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_help_center ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view help center entries" 
ON public.lesson_help_center 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage help center entries" 
ON public.lesson_help_center 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing summary files to additional files
INSERT INTO public.lesson_additional_files (lesson_id, label, file_url, link_url, display_order)
SELECT 
    id as lesson_id,
    'Summary' as label,
    summary_url as file_url,
    summary_link as link_url,
    0 as display_order
FROM public.lessons
WHERE summary_url IS NOT NULL OR summary_link IS NOT NULL;