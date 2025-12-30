import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdditionalFile {
  id: string;
  lesson_id: string;
  label: string;
  file_url: string | null;
  link_url: string | null;
  display_order: number;
  created_at: string;
}

export function useAdditionalFiles(lessonId: string) {
  return useQuery({
    queryKey: ['additional-files', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_additional_files')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('display_order');
      
      if (error) throw error;
      return data as AdditionalFile[];
    },
    enabled: !!lessonId,
  });
}

export function useCreateAdditionalFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lessonId, label, fileUrl, linkUrl }: { 
      lessonId: string; 
      label: string; 
      fileUrl?: string | null;
      linkUrl?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('lesson_additional_files')
        .insert({ 
          lesson_id: lessonId, 
          label,
          file_url: fileUrl || null,
          link_url: linkUrl || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-files', variables.lessonId] });
    },
  });
}

export function useUpdateAdditionalFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, lessonId, updates }: { 
      id: string; 
      lessonId: string;
      updates: Partial<Pick<AdditionalFile, 'label' | 'file_url' | 'link_url'>>;
    }) => {
      const { data, error } = await supabase
        .from('lesson_additional_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-files', variables.lessonId] });
    },
  });
}

export function useDeleteAdditionalFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      const { error } = await supabase
        .from('lesson_additional_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-files', variables.lessonId] });
    },
  });
}
