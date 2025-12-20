import { LessonStatus, LESSON_STATUS_CONFIG } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: LessonStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = LESSON_STATUS_CONFIG[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-primary-foreground',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}