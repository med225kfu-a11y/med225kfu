import { useState } from 'react';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Plus, Pencil, Trash2, BookOpen, Check, X } from 'lucide-react';

export function UnitsManager() {
  const { data: units, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();
  const { toast } = useToast();
  
  const [newUnitName, setNewUnitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) return;
    
    try {
      await createUnit.mutateAsync(newUnitName.trim());
      setNewUnitName('');
      toast({ title: 'Unit created successfully' });
    } catch {
      toast({ title: 'Failed to create unit', variant: 'destructive' });
    }
  };

  const handleUpdateUnit = async (id: string) => {
    if (!editingName.trim()) return;
    
    try {
      await updateUnit.mutateAsync({ id, updates: { name: editingName.trim() } });
      setEditingId(null);
      toast({ title: 'Unit updated successfully' });
    } catch {
      toast({ title: 'Failed to update unit', variant: 'destructive' });
    }
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      await deleteUnit.mutateAsync(id);
      toast({ title: 'Unit deleted successfully' });
    } catch {
      toast({ title: 'Failed to delete unit', variant: 'destructive' });
    }
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
          <BookOpen className="h-5 w-5" />
          Units
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="New unit name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateUnit()}
          />
          <Button onClick={handleCreateUnit} disabled={createUnit.isPending}>
            {createUnit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {units?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No units yet. Create your first unit above.</p>
        ) : (
          <div className="space-y-2">
            {units?.map((unit) => (
              <div key={unit.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {editingId === unit.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateUnit(unit.id)}
                    />
                    <Button size="sm" onClick={() => handleUpdateUnit(unit.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{unit.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEditingId(unit.id);
                        setEditingName(unit.name);
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
                          <AlertDialogTitle>Delete Unit</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{unit.name}" and all its lessons. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUnit(unit.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}