-- Add new lesson status enum value
ALTER TYPE lesson_status ADD VALUE 'not_studied_yet';

-- Create quiz links table (max 10 per lesson enforced via trigger)
CREATE TABLE public.lesson_quiz_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video links table (with custom titles)
CREATE TABLE public.lesson_video_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quiz links
ALTER TABLE public.lesson_quiz_links ENABLE ROW LEVEL SECURITY;

-- Enable RLS on video links
ALTER TABLE public.lesson_video_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz links - anyone can view
CREATE POLICY "Anyone can view quiz links"
ON public.lesson_quiz_links
FOR SELECT
USING (true);

-- RLS policies for quiz links - admins can manage
CREATE POLICY "Admins can manage quiz links"
ON public.lesson_quiz_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for video links - anyone can view
CREATE POLICY "Anyone can view video links"
ON public.lesson_video_links
FOR SELECT
USING (true);

-- RLS policies for video links - admins can manage
CREATE POLICY "Admins can manage video links"
ON public.lesson_video_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function to enforce max 10 quiz links per lesson
CREATE OR REPLACE FUNCTION public.check_max_quiz_links()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    link_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO link_count
    FROM public.lesson_quiz_links
    WHERE lesson_id = NEW.lesson_id;
    
    IF link_count >= 10 THEN
        RAISE EXCEPTION 'Maximum of 10 quiz links per lesson allowed';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for max quiz links
CREATE TRIGGER enforce_max_quiz_links
    BEFORE INSERT ON public.lesson_quiz_links
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_quiz_links();

-- Seed the three fixed units (Pre-Mid, Post-Mid, Additional)
INSERT INTO public.units (name, display_order)
VALUES 
    ('Pre-Mid', 0),
    ('Post-Mid', 1),
    ('Additional', 2)
ON CONFLICT DO NOTHING;