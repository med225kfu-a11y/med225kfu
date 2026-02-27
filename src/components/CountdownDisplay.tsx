import { useState, useEffect } from 'react';
import { useActiveCountdownEvents, CountdownEvent } from '@/hooks/useCountdownEvents';
import { Clock } from 'lucide-react';
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

function TimeUnit({ value, label, featured }: { value: number; label: string; featured?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-serif font-bold text-foreground ${
          featured ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
        }`}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs sm:text-sm text-muted-foreground mt-1 tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

function TimeSeparator({ featured }: { featured?: boolean }) {
  return (
    <span
      className={`font-serif text-muted-foreground/40 self-start ${
        featured ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
      }`}
    >
      :
    </span>
  );
}

function CountdownCard({ event, featured = false }: { event: CountdownEvent; featured?: boolean }) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(event.event_datetime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(event.event_datetime));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.event_datetime]);

  if (timeRemaining.total <= 0) return null;

  const eventDate = new Date(event.event_datetime);

  return (
    <div
      className={`relative overflow-hidden text-center ${
        featured ? 'p-8 sm:p-10' : 'p-6 sm:p-8'
      }`}
      style={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, hsl(34 30% 94%), hsl(260 10% 93%))',
        boxShadow: '0 4px 24px -6px hsl(34 20% 70% / 0.25)',
      }}
    >
      {/* Decorative academic circle */}
      <div
        className="absolute -top-16 -right-16 rounded-full pointer-events-none"
        style={{
          width: featured ? '180px' : '140px',
          height: featured ? '180px' : '140px',
          background: 'radial-gradient(circle, hsl(280 12% 75% / 0.08), transparent 70%)',
        }}
      />

      <h3
        className={`font-serif font-bold text-foreground mb-2 ${
          featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
        }`}
      >
        {event.name}
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        {format(eventDate, 'EEEE, MMMM d, yyyy')} · {format(eventDate, 'h:mm a')}
      </p>

      <div className="flex items-start justify-center gap-3 sm:gap-5">
        <TimeUnit value={timeRemaining.days} label="Days" featured={featured} />
        <TimeSeparator featured={featured} />
        <TimeUnit value={timeRemaining.hours} label="Hours" featured={featured} />
        <TimeSeparator featured={featured} />
        <TimeUnit value={timeRemaining.minutes} label="Min" featured={featured} />
        <TimeSeparator featured={featured} />
        <TimeUnit value={timeRemaining.seconds} label="Sec" featured={featured} />
      </div>
    </div>
  );
}

export function CountdownDisplay() {
  const { data: events, isLoading } = useActiveCountdownEvents();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading || !events || events.length === 0) return null;

  const activeEvents = events.filter(
    (e) => new Date(e.event_datetime).getTime() > Date.now()
  );

  if (activeEvents.length === 0) return null;

  // First event (nearest) is featured
  const [featured, ...rest] = activeEvents;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
        <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        Upcoming Events
      </h2>
      <div className="flex flex-col gap-10">
        <CountdownCard key={featured.id} event={featured} featured />
        {rest.map((event) => (
          <CountdownCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
