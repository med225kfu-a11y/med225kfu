import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Calendar, Clock, Loader2 } from 'lucide-react';
import {
  useCountdownEvents,
  useCreateCountdownEvent,
  useUpdateCountdownEvent,
  useDeleteCountdownEvent,
  CountdownEvent,
} from '@/hooks/useCountdownEvents';
import { format } from 'date-fns';

export function CountdownEventsManager() {
  const { data: events, isLoading } = useCountdownEvents();
  const createEvent = useCreateCountdownEvent();
  const updateEvent = useUpdateCountdownEvent();
  const deleteEvent = useDeleteCountdownEvent();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CountdownEvent | null>(null);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const resetForm = () => {
    setName('');
    setDate('');
    setTime('');
  };

  const handleCreate = async () => {
    if (!name || !date || !time) return;
    
    const eventDatetime = new Date(`${date}T${time}`).toISOString();
    await createEvent.mutateAsync({ name, event_datetime: eventDatetime });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingEvent || !name || !date || !time) return;
    
    const eventDatetime = new Date(`${date}T${time}`).toISOString();
    await updateEvent.mutateAsync({ id: editingEvent.id, name, event_datetime: eventDatetime });
    resetForm();
    setEditingEvent(null);
  };

  const openEditDialog = (event: CountdownEvent) => {
    const eventDate = new Date(event.event_datetime);
    setName(event.name);
    setDate(format(eventDate, 'yyyy-MM-dd'));
    setTime(format(eventDate, 'HH:mm'));
    setEditingEvent(event);
  };

  const closeEditDialog = () => {
    resetForm();
    setEditingEvent(null);
  };

  const isPastEvent = (datetime: string) => {
    return new Date(datetime) <= new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Countdown Events
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Countdown Events
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Midterm Exam"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={!name || !date || !time || createEvent.isPending}
                className="w-full"
              >
                {createEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {events?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No countdown events yet. Add your first event!
          </p>
        ) : (
          <div className="space-y-3">
            {events?.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isPastEvent(event.event_datetime) ? 'bg-muted/50 opacity-60' : 'bg-card'
                }`}
              >
                <div className="space-y-1">
                  <p className="font-medium">{event.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.event_datetime), 'PPP')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.event_datetime), 'p')}
                    </span>
                  </div>
                  {isPastEvent(event.event_datetime) && (
                    <span className="text-xs text-destructive">Event has passed</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editingEvent?.id === event.id} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-event-name">Event Name</Label>
                          <Input
                            id="edit-event-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Midterm Exam"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-event-date">Date</Label>
                            <Input
                              id="edit-event-date"
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-event-time">Time</Label>
                            <Input
                              id="edit-event-time"
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleUpdate} 
                          disabled={!name || !date || !time || updateEvent.isPending}
                          className="w-full"
                        >
                          {updateEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Update Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{event.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteEvent.mutate(event.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
