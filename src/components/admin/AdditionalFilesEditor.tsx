import { useState } from 'react';
import { useAdditionalFiles, useCreateAdditionalFile, useUpdateAdditionalFile, useDeleteAdditionalFile } from '@/hooks/useAdditionalFiles';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Upload, Link, FileText } from 'lucide-react';

interface AdditionalFilesEditorProps {
  lessonId: string;
}

export function AdditionalFilesEditor({ lessonId }: AdditionalFilesEditorProps) {
  const { data: files, isLoading } = useAdditionalFiles(lessonId);
  const createFile = useCreateAdditionalFile();
  const updateFile = useUpdateAdditionalFile();
  const deleteFile = useDeleteAdditionalFile();
  const { uploadFile, deleteFile: deleteStorageFile, isUploading } = useFileUpload();
  const { toast } = useToast();

  const [newLabel, setNewLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [addMode, setAddMode] = useState<'upload' | 'link' | null>(null);

  const handleAddWithUpload = async (file: File) => {
    if (!newLabel.trim()) {
      toast({ title: 'Please enter a label first', variant: 'destructive' });
      return;
    }
    
    if (!file.type.includes('pdf')) {
      toast({ title: 'Only PDF files are allowed', variant: 'destructive' });
      return;
    }

    const url = await uploadFile(file, 'additional-files');
    if (url) {
      try {
        await createFile.mutateAsync({ 
          lessonId, 
          label: newLabel.trim(), 
          fileUrl: url 
        });
        setNewLabel('');
        setAddMode(null);
        toast({ title: 'File added successfully' });
      } catch {
        toast({ title: 'Failed to add file', variant: 'destructive' });
      }
    }
  };

  const handleAddWithLink = async () => {
    if (!newLabel.trim() || !newLinkUrl.trim()) {
      toast({ title: 'Please enter both label and URL', variant: 'destructive' });
      return;
    }

    try {
      await createFile.mutateAsync({ 
        lessonId, 
        label: newLabel.trim(), 
        linkUrl: newLinkUrl.trim() 
      });
      setNewLabel('');
      setNewLinkUrl('');
      setAddMode(null);
      toast({ title: 'Link added successfully' });
    } catch {
      toast({ title: 'Failed to add link', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    try {
      if (fileUrl) {
        await deleteStorageFile(fileUrl);
      }
      await deleteFile.mutateAsync({ id, lessonId });
      toast({ title: 'File removed successfully' });
    } catch {
      toast({ title: 'Failed to remove file', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Additional Files
      </Label>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          {files && files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                  <span className="flex-1 truncate">
                    {file.label} - {file.file_url ? 'PDF Upload' : 'External Link'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(file.id, file.file_url)}
                    disabled={deleteFile.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!addMode ? (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAddMode('upload')}
                className="gap-1"
              >
                <Upload className="h-3 w-3" /> Add PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAddMode('link')}
                className="gap-1"
              >
                <Link className="h-3 w-3" /> Add Link
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-3 border rounded-md bg-card">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Button label (e.g., 'Study Guide')"
              />
              
              {addMode === 'link' && (
                <Input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="External URL..."
                />
              )}
              
              <div className="flex gap-2">
                {addMode === 'upload' ? (
                  <label className="flex-1">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAddWithUpload(file);
                      }}
                    />
                    <Button 
                      asChild 
                      size="sm" 
                      disabled={isUploading || !newLabel.trim()}
                      className="w-full"
                    >
                      <span>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                        Choose PDF
                      </span>
                    </Button>
                  </label>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleAddWithLink}
                    disabled={createFile.isPending || !newLabel.trim() || !newLinkUrl.trim()}
                    className="flex-1"
                  >
                    {createFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    Add Link
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setAddMode(null);
                    setNewLabel('');
                    setNewLinkUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
