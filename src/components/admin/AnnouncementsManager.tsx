import { useState, useRef } from 'react';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useReorderAnnouncements,
  Announcement,
} from '@/hooks/useAnnouncements';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Megaphone, GripVertical, Eye, EyeOff, Upload, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AnnouncementFormData {
  title: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
}

const emptyForm: AnnouncementFormData = {
  title: '',
  description: '',
  image_url: '',
  button_text: '',
  button_link: '',
};

function SortableAnnouncementItem({
  announcement,
  onEdit,
  onToggle,
  onDelete,
  isDragOverlay,
}: {
  announcement: Announcement;
  onEdit: (a: Announcement) => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: announcement.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex items-center gap-3 p-3 bg-muted rounded-lg transition-shadow ${
        isDragOverlay ? 'shadow-lg ring-1 ring-primary/20' : ''
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{announcement.title}</p>
        {announcement.description && (
          <p className="text-sm text-muted-foreground truncate">{announcement.description}</p>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onToggle(announcement.id, !announcement.is_active)}
        title={announcement.is_active ? 'Deactivate' : 'Activate'}
      >
        {announcement.is_active ? (
          <Eye className="h-4 w-4 text-primary" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      <Button size="sm" variant="ghost" onClick={() => onEdit(announcement)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{announcement.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(announcement.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AnnouncementsManager() {
  const { uploadFile, deleteFile, isUploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const reorderAnnouncements = useReorderAnnouncements();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementFormData>(emptyForm);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      description: a.description || '',
      image_url: a.image_url || '',
      button_text: a.button_text || '',
      button_link: a.button_link || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        button_text: form.button_text.trim() || null,
        button_link: form.button_link.trim() || null,
      };
      if (editingId) {
        await updateAnnouncement.mutateAsync({ id: editingId, updates: payload });
        toast({ title: 'Announcement updated' });
      } else {
        await createAnnouncement.mutateAsync(payload as any);
        toast({ title: 'Announcement created' });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: 'Failed to save announcement', variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateAnnouncement.mutateAsync({ id, updates: { is_active: isActive } });
      toast({ title: isActive ? 'Announcement activated' : 'Announcement deactivated' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast({ title: 'Announcement deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !announcements) return;
    const oldIndex = announcements.findIndex((a) => a.id === active.id);
    const newIndex = announcements.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(announcements, oldIndex, newIndex);
    try {
      await reorderAnnouncements.mutateAsync(reordered.map((a) => a.id));
      toast({ title: 'Order updated' });
    } catch {
      toast({ title: 'Failed to reorder', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const activeAnnouncement = announcements?.find((a) => a.id === activeId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
            </span>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {announcements?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No announcements yet.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={announcements?.map((a) => a.id) || []} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {announcements?.map((a) => (
                    <SortableAnnouncementItem
                      key={a.id}
                      announcement={a}
                      onEdit={openEdit}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeAnnouncement ? (
                  <SortableAnnouncementItem
                    announcement={activeAnnouncement}
                    onEdit={() => {}}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    isDragOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ann-title">Title *</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Announcement title"
              />
            </div>
            <div>
              <Label htmlFor="ann-desc">Description</Label>
              <Textarea
                id="ann-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Announcement details..."
                rows={4}
              />
            </div>
            <div>
              <Label>صورة (اختياري)</Label>
              {form.image_url ? (
                <div className="relative mt-1 rounded-lg overflow-hidden border">
                  <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-7 w-7 p-0"
                    onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="رابط الصورة أو ارفع ملف..."
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFile(file, 'announcements');
                      if (url) {
                        setForm((f) => ({ ...f, image_url: url }));
                        toast({ title: 'تم رفع الصورة' });
                      } else {
                        toast({ title: 'فشل رفع الصورة', variant: 'destructive' });
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ann-btn-text">Button Text</Label>
                <Input
                  id="ann-btn-text"
                  value={form.button_text}
                  onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label htmlFor="ann-btn-link">Button Link</Label>
                <Input
                  id="ann-btn-link"
                  value={form.button_link}
                  onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createAnnouncement.isPending || updateAnnouncement.isPending}
            >
              {(createAnnouncement.isPending || updateAnnouncement.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
