-- Add columns for external links (separate from uploaded files)
ALTER TABLE public.lessons 
ADD COLUMN transcription_link text DEFAULT NULL,
ADD COLUMN summary_link text DEFAULT NULL;