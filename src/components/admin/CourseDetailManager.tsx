import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useUnitsByCourse } from '@/hooks/useUnitsByCourse';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useQuizLinks, useCreateQuizLink, useDeleteQuizLink } from '@/hooks/useQuizLinks';
import { useVideoLinks, useCreateVideoLink, useDeleteVideoLink } from '@/hooks/useVideoLinks';
import { LessonStatus, LESSON_STATUS_CONFIG, Course, Unit, Lesson } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Plus, Pencil, Trash2, ArrowLeft, ChevronDown,
  GripVertical, Check, X, Video, ExternalLink, FolderOpen
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { FileSourceEditor } from '@/components/admin/FileSourceEditor';
import { AdditionalFilesEditor } from '@/components/admin/AdditionalFilesEditor';
import { HelpCenterEditor } from '@/components/admin/HelpCenterEditor';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Unit Item ---
function SortableUnitItem({
  unit,
  children,
}: {
  unit: Unit;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-0">
        <button
          className="mt-3 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

// --- Sortable Lesson Item ---
function SortableLessonItem({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// --- Quiz Links Editor (inline) ---
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
      toast({
        title: error?.message?.includes('Maximum of 10') ? 'Maximum of 10 quiz links allowed' : 'Failed to add quiz link',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Quiz Links ({quizLinks?.length || 0}/10)
      </Label>
      <div className="flex gap-2">
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Enter quiz URL..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <Button size="sm" onClick={handleAdd} disabled={createQuizLink.isPending || (quizLinks?.length || 0) >= 10}>
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
              <Button size="sm" variant="ghost" onClick={() => deleteQuizLink.mutateAsync({ id: link.id, lessonId })} disabled={deleteQuizLink.isPending}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// --- Video Links Editor (inline) ---
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

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Video className="h-4 w-4" />
        Video Links
      </Label>
      <div className="flex gap-2">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Video title..." className="flex-1" />
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Video URL..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
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
              <Button size="sm" variant="ghost" onClick={() => deleteVideoLink.mutateAsync({ id: link.id, lessonId })} disabled={deleteVideoLink.isPending}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// --- Unit Section with Lessons ---
function UnitSection({
  unit,
  categoryName,
}: {
  unit: Unit;
  categoryName: string;
}) {
  const { data: lessons, isLoading: lessonsLoading } = useLessons(unit.id);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();
  const { uploadFile, deleteFile, isUploading } = useFileUpload();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [editingUnitName, setEditingUnitName] = useState(false);
  const [unitName, setUnitName] = useState(unit.name);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim()) return;
    try {
      await createLesson.mutateAsync({ unitId: unit.id, title: newLessonTitle.trim() });
      setNewLessonTitle('');
      toast({ title: 'Lesson created' });
    } catch {
      toast({ title: 'Failed to create lesson', variant: 'destructive' });
    }
  };

  const handleSaveUnitName = async () => {
    if (!unitName.trim()) return;
    try {
      await updateUnit.mutateAsync({ id: unit.id, updates: { name: unitName.trim() } });
      setEditingUnitName(false);
      toast({ title: 'Unit updated' });
    } catch {
      toast({ title: 'Failed to update unit', variant: 'destructive' });
    }
  };

  const handleDeleteUnit = async () => {
    try {
      await deleteUnit.mutateAsync(unit.id);
      toast({ title: 'Unit deleted' });
    } catch {
      toast({ title: 'Failed to delete unit', variant: 'destructive' });
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
        },
      });
      setIsDialogOpen(false);
      setEditingLesson(null);
      toast({ title: 'Lesson updated' });
    } catch {
      toast({ title: 'Failed to update lesson', variant: 'destructive' });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await deleteLesson.mutateAsync(id);
      toast({ title: 'Lesson deleted' });
    } catch {
      toast({ title: 'Failed to delete lesson', variant: 'destructive' });
    }
  };

  const handleFileUpload = async (type: 'transcription' | 'summary', file: File) => {
    const url = await uploadFile(file, type === 'transcription' ? 'transcriptions' : 'summaries');
    if (url) {
      setEditingLesson((prev: any) => ({
        ...prev,
        [type === 'transcription' ? 'transcription_url' : 'summary_url']: url,
      }));
    }
  };

  const handleRemoveFile = async (type: 'transcription' | 'summary') => {
    const urlKey = type === 'transcription' ? 'transcription_url' : 'summary_url';
    if (editingLesson[urlKey]) await deleteFile(editingLesson[urlKey]);
    setEditingLesson((prev: any) => ({ ...prev, [urlKey]: null }));
  };

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !lessons) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(['lessons', unit.id], reordered);

    // Persist
    const updates = reordered.map((l, i) => ({ id: l.id, display_order: i }));
    for (const u of updates) {
      await supabase.from('lessons').update({ display_order: u.display_order }).eq('id', u.id);
    }
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted transition-colors text-left">
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            <FolderOpen className="h-4 w-4 text-primary" />
            <div className="flex-1 min-w-0">
              {editingUnitName ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="h-7 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveUnitName()}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleSaveUnitName(); }}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setEditingUnitName(false); setUnitName(unit.name); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="font-medium text-sm">{unit.name}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{categoryName}</span>
            <span className="text-xs text-muted-foreground">{lessons?.length || 0} lessons</span>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingUnitName(true); setUnitName(unit.name); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{unit.name}" and all its lessons.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUnit}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 space-y-3 border-t border-border">
            {/* Add lesson */}
            <div className="flex gap-2">
              <Input
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="New lesson title..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLesson()}
              />
              <Button size="sm" className="h-8" onClick={handleCreateLesson} disabled={createLesson.isPending}>
                {createLesson.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                <span className="ml-1 hidden sm:inline">Add</span>
              </Button>
            </div>

            {/* Lessons list with drag & drop */}
            {lessonsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : !lessons || lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">No lessons yet</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {lessons.map((lesson) => (
                      <SortableLessonItem key={lesson.id} lesson={lesson}>
                        <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-md text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium truncate">{lesson.title}</span>
                              <StatusBadge status={lesson.status} />
                            </div>
                          </div>

                          <Dialog
                            open={isDialogOpen && editingLesson?.id === lesson.id}
                            onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingLesson(null); }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingLesson({ ...lesson }); setIsDialogOpen(true); }}>
                                <Pencil className="h-3 w-3" />
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
                                    <Input value={editingLesson.title} onChange={(e) => setEditingLesson((prev: any) => ({ ...prev, title: e.target.value }))} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={editingLesson.status} onValueChange={(value) => setEditingLesson((prev: any) => ({ ...prev, status: value }))}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(LESSON_STATUS_CONFIG).map(([key, config]) => (
                                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea value={editingLesson.notes || ''} onChange={(e) => setEditingLesson((prev: any) => ({ ...prev, notes: e.target.value }))} placeholder="Add notes..." rows={3} />
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
                                  <AdditionalFilesEditor lessonId={editingLesson.id} />
                                  <QuizLinksEditor lessonId={editingLesson.id} />
                                  <VideoLinksEditor lessonId={editingLesson.id} />
                                  <HelpCenterEditor lessonId={editingLesson.id} />
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
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{lesson.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </SortableLessonItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// --- Main Course Detail Manager ---
export function CourseDetailManager({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const { data: categories } = useCategories();
  const { data: units, isLoading: unitsLoading } = useUnitsByCourse(course.id);
  const createUnit = useCreateUnit();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [newUnitName, setNewUnitName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCreateUnit = async () => {
    if (!newUnitName.trim() || !selectedCategoryId) {
      toast({ title: 'Please select a category and enter a unit name', variant: 'destructive' });
      return;
    }
    try {
      await createUnit.mutateAsync({ name: newUnitName.trim(), categoryId: selectedCategoryId, courseId: course.id });
      setNewUnitName('');
      toast({ title: 'Unit created' });
    } catch {
      toast({ title: 'Failed to create unit', variant: 'destructive' });
    }
  };

  const handleUnitDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !units) return;

    const oldIndex = units.findIndex((u) => u.id === active.id);
    const newIndex = units.findIndex((u) => u.id === over.id);
    const reordered = arrayMove(units, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(['units', 'course', course.id], reordered);

    // Persist
    const updates = reordered.map((u, i) => ({ id: u.id, display_order: i }));
    for (const u of updates) {
      await supabase.from('units').update({ display_order: u.display_order }).eq('id', u.id);
    }
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-xl font-serif font-semibold">{course.name}</h2>
      </div>

      {/* Add Unit */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="New unit name..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUnit()}
            />
            <Button onClick={handleCreateUnit} disabled={createUnit.isPending || !selectedCategoryId}>
              {createUnit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Add Unit</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Units list with drag & drop */}
      {unitsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !units || units.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No units yet. Add your first unit above.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleUnitDragEnd}>
          <SortableContext items={units.map((u) => u.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {units.map((unit) => {
                const category = categories?.find((c) => c.id === unit.category_id);
                return (
                  <SortableUnitItem key={unit.id} unit={unit}>
                    <UnitSection unit={unit} categoryName={category?.name || 'Unknown'} />
                  </SortableUnitItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
