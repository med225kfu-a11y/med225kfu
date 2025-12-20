import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types/database';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Unit[];
    },
  });
}

export function useUnitsByCategory(categoryId?: string) {
  return useQuery({
    queryKey: ['units', 'category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('category_id', categoryId!)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Unit[];
    },
    enabled: !!categoryId,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, categoryId }: { name: string; categoryId: string }) => {
      const { data: existingUnits } = await supabase
        .from('units')
        .select('display_order')
        .eq('category_id', categoryId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingUnits && existingUnits.length > 0 
        ? existingUnits[0].display_order + 1 
        : 0;

      const { data, error } = await supabase
        .from('units')
        .insert({ name, category_id: categoryId, display_order: nextOrder })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Unit> }) => {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}
