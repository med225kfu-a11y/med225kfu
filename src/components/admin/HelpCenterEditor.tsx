import { useState } from 'react';
import { useHelpCenter, useCreateHelpCenterEntry, useDeleteHelpCenterEntry } from '@/hooks/useHelpCenter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, HelpCircle, MessageSquare, Link } from 'lucide-react';

interface HelpCenterEditorProps {
  lessonId: string;
}

export function HelpCenterEditor({ lessonId }: HelpCenterEditorProps) {
  const { data: entries, isLoading } = useHelpCenter(lessonId);
  const createEntry = useCreateHelpCenterEntry();
  const deleteEntry = useDeleteHelpCenterEntry();
  const { toast } = useToast();

  const [addMode, setAddMode] = useState<'text' | 'link' | null>(null);
  const [newContent, setNewContent] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddText = async () => {
    if (!newContent.trim()) {
      toast({ title: 'Please enter content', variant: 'destructive' });
      return;
    }

    try {
      await createEntry.mutateAsync({ 
        lessonId, 
        entryType: 'text',
        content: newContent.trim()
      });
      setNewContent('');
      setAddMode(null);
      toast({ title: 'Post added successfully' });
    } catch {
      toast({ title: 'Failed to add post', variant: 'destructive' });
    }
  };

  const handleAddLink = async () => {
    if (!newContent.trim() || !newLinkUrl.trim()) {
      toast({ title: 'Please enter both title and URL', variant: 'destructive' });
      return;
    }

    try {
      await createEntry.mutateAsync({ 
        lessonId, 
        entryType: 'link',
        content: newContent.trim(),
        linkUrl: newLinkUrl.trim()
      });
      setNewContent('');
      setNewLinkUrl('');
      setAddMode(null);
      toast({ title: 'Link added successfully' });
    } catch {
      toast({ title: 'Failed to add link', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry.mutateAsync({ id, lessonId });
      toast({ title: 'Entry removed successfully' });
    } catch {
      toast({ title: 'Failed to remove entry', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        Help Center
      </Label>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          {entries && entries.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 text-sm bg-muted p-2 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      {entry.entry_type === 'text' ? (
                        <MessageSquare className="h-3 w-3" />
                      ) : (
                        <Link className="h-3 w-3" />
                      )}
                      {entry.entry_type === 'text' ? 'Post' : 'Link'}
                    </div>
                    <p className="truncate">{entry.content}</p>
                    {entry.link_url && (
                      <a 
                        href={entry.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate block"
                      >
                        {entry.link_url}
                      </a>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteEntry.isPending}
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
                onClick={() => setAddMode('text')}
                className="gap-1"
              >
                <MessageSquare className="h-3 w-3" /> Add Post
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
              {addMode === 'text' ? (
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your help post..."
                  rows={3}
                />
              ) : (
                <>
                  <Input
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Link title..."
                  />
                  <Input
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL..."
                  />
                </>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={addMode === 'text' ? handleAddText : handleAddLink}
                  disabled={createEntry.isPending || !newContent.trim() || (addMode === 'link' && !newLinkUrl.trim())}
                  className="flex-1"
                >
                  {createEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Add {addMode === 'text' ? 'Post' : 'Link'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setAddMode(null);
                    setNewContent('');
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
