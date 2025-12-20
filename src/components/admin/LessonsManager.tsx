import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useAllLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useQuizLinks, useCreateQuizLink, useDeleteQuizLink } from '@/hooks/useQuizLinks';
import { useVideoLinks, useCreateVideoLink, useDeleteVideoLink } from '@/hooks/useVideoLinks';
import { LessonStatus, LESSON_STATUS_CONFIG } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, FileText, X, Video, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { FileSourceEditor } from '@/components/admin/FileSourceEditor';

function QuizLinksEditor({ lessonId }: { lessonId: string }) {
  const { data: quizLinks, isLoading } = useQuizLinks(lessonId);
  const createQuizLink = useCreateQuizLink();
  const deleteQuizLink = useDeleteQuizLink();
  const [newUrl, setNewUrl] = useState('');
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    try {
      await createQuizLink.mutateAsync({ lessonId, url: newUrl.trim() });
      setNewUrl('');
    } catch (error: any) {
      if (error?.message?.includes('Maximum of 10')) {
        toast({ title: 'Maximum of 10 quiz links allowed', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add quiz link', variant: 'destructive' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuizLink.mutateAsync({ id, lessonId });
    } catch {
      toast({ title: 'Failed to delete quiz link', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Quiz Links ({quizLinks?.length || 0}/10)
      </Label>
      
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter quiz URL..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button 
          size="sm" 
          onClick={handleAdd} 
          disabled={createQuizLink.isPending || (quizLinks?.length || 0) >= 10}
        >
          {createQuizLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
      ) : quizLinks && quizLinks.length > 0 ? (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {quizLinks.map((link, index) => (
            <div key={link.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
              <span className="flex-1 truncate">Quiz {index + 1}: {link.url}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDelete(link.id)}
                disabled={deleteQuizLink.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VideoLinksEditor({ lessonId }: { lessonId: string }) {
  const { data: videoLinks, isLoading } = useVideoLinks(lessonId);
  const createVideoLink = useCreateVideoLink();
  const deleteVideoLink = useDeleteVideoLink();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    try {
      await createVideoLink.mutateAsync({ lessonId, title: newTitle.trim(), url: newUrl.trim() });
      setNewTitle('');
      setNewUrl('');
    } catch {
      toast({ title: 'Failed to add video link', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVideoLink.mutateAsync({ id, lessonId });
    } catch {
      toast({ title: 'Failed to delete video link', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Video className="h-4 w-4" />
        Video Links
      </Label>
      
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Video title..."
          className="flex-1"
        />
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Video URL..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd} disabled={createVideoLink.isPending}>
          {createVideoLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
      ) : videoLinks && videoLinks.length > 0 ? (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {videoLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
              <span className="flex-1 truncate">{link.title}: {link.url}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDelete(link.id)}
                disabled={deleteVideoLink.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LessonsManager() {
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: lessons, isLoading } = useAllLessons();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const { uploadFile, deleteFile, isUploading } = useFileUpload();
  const { toast } = useToast();
  
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredLessons = selectedUnitId && selectedUnitId !== 'all'
    ? lessons?.filter(l => l.unit_id === selectedUnitId)
    : lessons;

  const handleCreateLesson = async () => {
    if (!selectedUnitId || selectedUnitId === 'all' || !newLessonTitle.trim()) {
      toast({ title: 'Please select a unit and enter a title', variant: 'destructive' });
      return;
    }
    
    try {
      await createLesson.mutateAsync({ unitId: selectedUnitId, title: newLessonTitle.trim() });
      setNewLessonTitle('');
      toast({ title: 'Lesson created successfully' });
    } catch {
      toast({ title: 'Failed to create lesson', variant: 'destructive' });
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    
    try {
      await updateLesson.mutateAsync({
        id: editingLesson.id,
        updates: {
          title: editingLesson.title,
          status: editingLesson.status,
          notes: editingLesson.notes || null,
          transcription_url: editingLesson.transcription_url,
          transcription_link: editingLesson.transcription_link,
          summary_url: editingLesson.summary_url,
          summary_link: editingLesson.summary_link,
        }
      });
      setIsDialogOpen(false);
      setEditingLesson(null);
      toast({ title: 'Lesson updated successfully' });
    } catch {
      toast({ title: 'Failed to update lesson', variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await deleteLesson.mutateAsync(id);
      toast({ title: 'Lesson deleted successfully' });
    } catch {
      toast({ title: 'Failed to delete lesson', variant: 'destructive' });
    }
  };

  const handleFileUpload = async (type: 'transcription' | 'summary', file: File) => {
    const url = await uploadFile(file, type === 'transcription' ? 'transcriptions' : 'summaries');
    if (url) {
      setEditingLesson((prev: any) => ({
        ...prev,
        [type === 'transcription' ? 'transcription_url' : 'summary_url']: url
      }));
    } else {
      toast({ title: 'Failed to upload file', variant: 'destructive' });
    }
  };

  const handleRemoveFile = async (type: 'transcription' | 'summary') => {
    const urlKey = type === 'transcription' ? 'transcription_url' : 'summary_url';
    if (editingLesson[urlKey]) {
      await deleteFile(editingLesson[urlKey]);
    }
    setEditingLesson((prev: any) => ({
      ...prev,
      [urlKey]: null
    }));
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lessons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
            <SelectTrigger className="sm:w-[250px]">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {categories?.map((category) => {
                const categoryUnits = units?.filter(u => u.category_id === category.id) || [];
                return categoryUnits.length > 0 ? (
                  <div key={category.id}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category.name}</div>
                    {categoryUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </div>
                ) : null;
              })}
            </SelectContent>
          </Select>
          
          <Input
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            placeholder="New lesson title"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLesson()}
          />
          <Button onClick={handleCreateLesson} disabled={createLesson.isPending || !selectedUnitId || selectedUnitId === 'all'}>
            {createLesson.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {(!selectedUnitId || selectedUnitId === 'all') && (
          <p className="text-muted-foreground text-sm">Select a specific unit to add lessons</p>
        )}

        {filteredLessons?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No lessons yet.</p>
        ) : (
          <div className="space-y-2">
            {filteredLessons?.map((lesson) => {
              const unit = units?.find(u => u.id === lesson.unit_id);
              return (
                <div key={lesson.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{lesson.title}</span>
                      <StatusBadge status={lesson.status} />
                    </div>
                    {unit && (
                      <span className="text-sm text-muted-foreground">{unit.name}</span>
                    )}
                  </div>
                  
                  <Dialog open={isDialogOpen && editingLesson?.id === lesson.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingLesson(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingLesson({ ...lesson });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Lesson</DialogTitle>
                      </DialogHeader>
                      {editingLesson && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={editingLesson.title}
                              onChange={(e) => setEditingLesson((prev: any) => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select 
                              value={editingLesson.status} 
                              onValueChange={(value) => setEditingLesson((prev: any) => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(LESSON_STATUS_CONFIG).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={editingLesson.notes || ''}
                              onChange={(e) => setEditingLesson((prev: any) => ({ ...prev, notes: e.target.value }))}
                              placeholder="Add notes for this lesson..."
                              rows={3}
                            />
                          </div>
                          
                          <FileSourceEditor
                            label="Transcription PDF"
                            uploadUrl={editingLesson.transcription_url}
                            linkUrl={editingLesson.transcription_link}
                            onUpload={(file) => handleFileUpload('transcription', file)}
                            onLinkChange={(link) => setEditingLesson((prev: any) => ({ ...prev, transcription_link: link }))}
                            onRemoveUpload={() => handleRemoveFile('transcription')}
                            isUploading={isUploading}
                          />
                          
                          <FileSourceEditor
                            label="Summary PDF"
                            uploadUrl={editingLesson.summary_url}
                            linkUrl={editingLesson.summary_link}
                            onUpload={(file) => handleFileUpload('summary', file)}
                            onLinkChange={(link) => setEditingLesson((prev: any) => ({ ...prev, summary_link: link }))}
                            onRemoveUpload={() => handleRemoveFile('summary')}
                            isUploading={isUploading}
                          />
                          
                          {/* Quiz Links Editor */}
                          <QuizLinksEditor lessonId={editingLesson.id} />
                          
                          {/* Video Links Editor */}
                          <VideoLinksEditor lessonId={editingLesson.id} />
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateLesson} disabled={updateLesson.isPending}>
                              {updateLesson.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{lesson.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
