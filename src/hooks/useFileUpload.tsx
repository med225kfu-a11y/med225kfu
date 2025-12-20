import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      const path = url.split('/files/')[1];
      if (!path) return false;
      
      const { error } = await supabase.storage
        .from('files')
        .remove([path]);
      
      return !error;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return { uploadFile, deleteFile, isUploading };
}