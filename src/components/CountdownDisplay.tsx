import { useState, useEffect } from 'react';
import { useActiveCountdownEvents, CountdownEvent } from '@/hooks/useCountdownEvents';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(eventDatetime: string): TimeRemaining {
  const now = Date.now();
  const eventTime = new Date(eventDatetime).getTime();
  const total = eventTime - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

function CountdownCard({ event }: { event: CountdownEvent }) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
    calculateTimeRemaining(event.event_datetime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(event.event_datetime));
    }, 1000);

    return () => clearInterval(timer);
  }, [event.event_datetime]);

  if (timeRemaining.total <= 0) {
    return null;
  }

  const eventDate = new Date(event.event_datetime);

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {format(eventDate, 'PPP')} – {format(eventDate, 'p')}
          </p>
        </div>
        <div className="flex items-center gap-3 text-center">
          <div className="bg-primary/10 rounded-md px-3 py-2 min-w-[60px]">
            <span className="text-xl font-bold text-primary">{timeRemaining.days}</span>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
          <div className="bg-primary/10 rounded-md px-3 py-2 min-w-[60px]">
            <span className="text-xl font-bold text-primary">{timeRemaining.hours}</span>
            <p className="text-xs text-muted-foreground">hours</p>
          </div>
          <div className="bg-primary/10 rounded-md px-3 py-2 min-w-[60px] hidden sm:block">
            <span className="text-xl font-bold text-primary">{timeRemaining.minutes}</span>
            <p className="text-xs text-muted-foreground">min</p>
          </div>
          <div className="bg-primary/10 rounded-md px-3 py-2 min-w-[60px] hidden md:block">
            <span className="text-xl font-bold text-primary">{timeRemaining.seconds}</span>
            <p className="text-xs text-muted-foreground">sec</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CountdownDisplay() {
  const { data: events, isLoading } = useActiveCountdownEvents();
  const [, setTick] = useState(0);

  // Force re-render every minute to filter out newly expired events
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading || !events || events.length === 0) {
    return null;
  }

  // Filter out events that have just expired (in case the query hasn't refreshed yet)
  const activeEvents = events.filter((event) => 
    new Date(event.event_datetime).getTime() > Date.now()
  );

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
        <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        Upcoming Events
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {activeEvents.map((event) => (
          <CountdownCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
