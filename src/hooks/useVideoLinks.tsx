import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonVideoLink } from '@/types/database';

export function useVideoLinks(lessonId: string) {
  return useQuery({
    queryKey: ['video-links', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_video_links')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as LessonVideoLink[];
    },
    enabled: !!lessonId,
  });
}

export function useCreateVideoLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, title, url }: { lessonId: string; title: string; url: string }) => {
      const { data: existingLinks } = await supabase
        .from('lesson_video_links')
        .select('display_order')
        .eq('lesson_id', lessonId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingLinks && existingLinks.length > 0 
        ? existingLinks[0].display_order + 1 
        : 0;

      const { data, error } = await supabase
        .from('lesson_video_links')
        .insert({ lesson_id: lessonId, title, url, display_order: nextOrder })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video-links', variables.lessonId] });
    },
  });
}

export function useDeleteVideoLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, lessonId }: { id: string; lessonId: string }) => {
      const { error } = await supabase
        .from('lesson_video_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return lessonId;
    },
    onSuccess: (lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['video-links', lessonId] });
    },
  });
}
