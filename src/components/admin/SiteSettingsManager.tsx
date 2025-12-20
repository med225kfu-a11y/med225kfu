import { useState } from 'react';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

export function SiteSettingsManager() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { uploadFile, deleteFile, isUploading } = useFileUpload();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveTitle = async () => {
    if (!settings?.id || !title.trim()) return;
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: { site_title: title.trim() }
      });
      toast({ title: 'Title updated successfully' });
      setIsEditing(false);
    } catch {
      toast({ title: 'Failed to update title', variant: 'destructive' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings?.id) return;
    
    const url = await uploadFile(file, 'logos');
    if (url) {
      if (settings.logo_url) {
        await deleteFile(settings.logo_url);
      }
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: { logo_url: url }
      });
      toast({ title: 'Logo uploaded successfully' });
    } else {
      toast({ title: 'Failed to upload logo', variant: 'destructive' });
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.id || !settings.logo_url) return;
    
    await deleteFile(settings.logo_url);
    await updateSettings.mutateAsync({
      id: settings.id,
      updates: { logo_url: null }
    });
    toast({ title: 'Logo removed' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Website Title</Label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter website title"
              />
              <Button onClick={handleSaveTitle} disabled={updateSettings.isPending}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-foreground">{settings?.site_title}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setTitle(settings?.site_title || '');
                  setIsEditing(true);
                }}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          {settings?.logo_url ? (
            <div className="flex items-center gap-4">
              <img 
                src={settings.logo_url} 
                alt="Current logo" 
                className="h-16 w-auto object-contain border rounded"
              />
              <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="max-w-xs"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}