import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types/database';

export function useUnitsByCourse(courseId?: string) {
  return useQuery({
    queryKey: ['units', 'course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('course_id', courseId!)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!courseId,
  });
}
