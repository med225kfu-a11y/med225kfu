import { useState } from 'react';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useReorderCourses } from '@/hooks/useCourses';
import { Course } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Loader2, Plus, Pencil, Trash2, GraduationCap, Check, X, GripVertical } from 'lucide-react';
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

interface SortableCourseItemProps {
  course: Course;
  editingId: string | null;
  editingName: string;
  setEditingId: (id: string | null) => void;
  setEditingName: (name: string) => void;
  handleUpdate: (id: string) => void;
  handleToggleStatus: (id: string, status: string) => void;
  handleDelete: (id: string) => void;
  onSelectCourse?: (course: Course) => void;
  isDragOverlay?: boolean;
}

function SortableCourseItem({
  course,
  editingId,
  editingName,
  setEditingId,
  setEditingName,
  handleUpdate,
  handleToggleStatus,
  handleDelete,
  onSelectCourse,
  isDragOverlay,
}: SortableCourseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex items-center gap-2 p-3 bg-muted rounded-lg transition-shadow ${
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

      {editingId === course.id ? (
        <>
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(course.id)}
          />
          <Button size="sm" onClick={() => handleUpdate(course.id)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span
            className={onSelectCourse ? "flex-1 font-medium cursor-pointer hover:text-primary transition-colors" : "flex-1 font-medium"}
            onClick={() => onSelectCourse?.(course)}
          >
            {course.name}
          </span>
          <Badge
            variant={course.status === 'active' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => handleToggleStatus(course.id, course.status)}
          >
            {course.status === 'active' ? 'Active' : 'Hidden'}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {new Date(course.created_at).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingId(course.id);
              setEditingName(course.name);
            }}
          >
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
                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{course.name}" and all its units and lessons. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(course.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

export function CoursesManager({ onSelectCourse }: { onSelectCourse?: (course: Course) => void } = {}) {
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const reorderCourses = useReorderCourses();
  const { toast } = useToast();

  const [newCourseName, setNewCourseName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCreate = async () => {
    if (!newCourseName.trim()) {
      toast({ title: 'Please enter a course name', variant: 'destructive' });
      return;
    }
    try {
      await createCourse.mutateAsync({ name: newCourseName.trim() });
      setNewCourseName('');
      toast({ title: 'Course created successfully' });
    } catch {
      toast({ title: 'Failed to create course', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCourse.mutateAsync({ id, updates: { name: editingName.trim() } });
      setEditingId(null);
      toast({ title: 'Course updated successfully' });
    } catch {
      toast({ title: 'Failed to update course', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await updateCourse.mutateAsync({ id, updates: { status: newStatus } });
      toast({ title: `Course ${newStatus === 'active' ? 'activated' : 'hidden'}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse.mutateAsync(id);
      toast({ title: 'Course deleted successfully' });
    } catch {
      toast({ title: 'Failed to delete course', variant: 'destructive' });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !courses) return;

    const oldIndex = courses.findIndex((c) => c.id === active.id);
    const newIndex = courses.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(courses, oldIndex, newIndex);

    try {
      await reorderCourses.mutateAsync(reordered.map((c) => c.id));
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

  const activeCourse = courses?.find((c) => c.id === activeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="New course name (e.g. Block 1.4)"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={createCourse.isPending}>
            {createCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {courses?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No courses yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={courses?.map((c) => c.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {courses?.map((course) => (
                  <SortableCourseItem
                    key={course.id}
                    course={course}
                    editingId={editingId}
                    editingName={editingName}
                    setEditingId={setEditingId}
                    setEditingName={setEditingName}
                    handleUpdate={handleUpdate}
                    handleToggleStatus={handleToggleStatus}
                    handleDelete={handleDelete}
                    onSelectCourse={onSelectCourse}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeCourse ? (
                <SortableCourseItem
                  course={activeCourse}
                  editingId={null}
                  editingName=""
                  setEditingId={() => {}}
                  setEditingName={() => {}}
                  handleUpdate={() => {}}
                  handleToggleStatus={() => {}}
                  handleDelete={() => {}}
                  onSelectCourse={onSelectCourse}
                  isDragOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
