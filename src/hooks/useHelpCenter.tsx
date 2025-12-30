import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpCenterEntry {
  id: string;
  lesson_id: string;
  entry_type: 'text' | 'link';
  content: string;
  link_url: string | null;
  created_at: string;
}

export function useHelpCenter(lessonId: string) {
  return useQuery({
    queryKey: ['help-center', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_help_center')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HelpCenterEntry[];
    },
    enabled: !!lessonId,
  });
}

export function useCreateHelpCenterEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, entryType, content, linkUrl }: { 
      lessonId: string; 
      entryType: 'text' | 'link';
      content: string;
      linkUrl?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('lesson_help_center')
        .insert({ 
          lesson_id: lessonId, 
          entry_type: entryType,
          content,
          link_url: linkUrl || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['help-center', variables.lessonId] });
    },
  });
}

export function useDeleteHelpCenterEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      const { error } = await supabase
        .from('lesson_help_center')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['help-center', variables.lessonId] });
    },
  });
}
