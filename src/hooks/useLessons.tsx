import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lesson, LessonStatus } from '@/types/database';

export function useLessons(unitId?: string) {
  return useQuery({
    queryKey: ['lessons', unitId],
    queryFn: async () => {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (unitId) {
        query = query.eq('unit_id', unitId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Lesson[];
    },
  });
}

export function useAllLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ unitId, title }: { unitId: string; title: string }) => {
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('display_order')
        .eq('unit_id', unitId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingLessons && existingLessons.length > 0 
        ? existingLessons[0].display_order + 1 
        : 0;

      const { data, error } = await supabase
        .from('lessons')
        .insert({ 
          unit_id: unitId, 
          title, 
          display_order: nextOrder,
          status: 'no_transcription' as LessonStatus
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lesson> }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}