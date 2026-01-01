-- Create countdown_events table
CREATE TABLE public.countdown_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.countdown_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view countdown events" 
ON public.countdown_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage countdown events" 
ON public.countdown_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_countdown_events_updated_at
BEFORE UPDATE ON public.countdown_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();