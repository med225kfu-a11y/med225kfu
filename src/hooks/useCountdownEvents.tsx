import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CountdownEvent {
  id: string;
  name: string;
  event_datetime: string;
  created_at: string;
  updated_at: string;
}

export function useCountdownEvents() {
  return useQuery({
    queryKey: ['countdown-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countdown_events')
        .select('*')
        .order('event_datetime', { ascending: true });
      
      if (error) throw error;
      return data as CountdownEvent[];
    },
  });
}

export function useActiveCountdownEvents() {
  return useQuery({
    queryKey: ['countdown-events', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('countdown_events')
        .select('*')
        .gt('event_datetime', now)
        .order('event_datetime', { ascending: true });
      
      if (error) throw error;
      return data as CountdownEvent[];
    },
  });
}

export function useCreateCountdownEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: { name: string; event_datetime: string }) => {
      const { data, error } = await supabase
        .from('countdown_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create event', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCountdownEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; event_datetime?: string }) => {
      const { data, error } = await supabase
        .from('countdown_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-events'] });
      toast({ title: 'Event updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update event', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCountdownEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('countdown_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete event', description: error.message, variant: 'destructive' });
    },
  });
}
