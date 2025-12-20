import { useState } from 'react';
import { useUnits } from '@/hooks/useUnits';
import { useAllLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useFileUpload } from '@/hooks/useFileUpload';
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
import { Loader2, Plus, Pencil, Trash2, FileText, Upload, X } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export function LessonsManager() {
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

  const filteredLessons = selectedUnitId 
    ? lessons?.filter(l => l.unit_id === selectedUnitId)
    : lessons;

  const handleCreateLesson = async () => {
    if (!selectedUnitId || !newLessonTitle.trim()) {
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
          summary_url: editingLesson.summary_url,
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
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {units?.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            placeholder="New lesson title"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLesson()}
          />
          <Button onClick={handleCreateLesson} disabled={createLesson.isPending || !selectedUnitId}>
            {createLesson.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!selectedUnitId && (
          <p className="text-muted-foreground text-sm">Select a unit to add lessons</p>
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
                          
                          <div className="space-y-2">
                            <Label>Transcription PDF</Label>
                            {editingLesson.transcription_url ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground truncate flex-1">File uploaded</span>
                                <Button size="sm" variant="outline" onClick={() => handleRemoveFile('transcription')}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload('transcription', e.target.files[0])}
                                disabled={isUploading}
                              />
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Summary PDF</Label>
                            {editingLesson.summary_url ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground truncate flex-1">File uploaded</span>
                                <Button size="sm" variant="outline" onClick={() => handleRemoveFile('summary')}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload('summary', e.target.files[0])}
                                disabled={isUploading}
                              />
                            )}
                          </div>
                          
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