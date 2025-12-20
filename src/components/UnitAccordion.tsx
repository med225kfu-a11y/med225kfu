import { Unit, Lesson } from '@/types/database';
import { LessonCard } from './LessonCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen } from 'lucide-react';

interface UnitAccordionProps {
  units: Unit[];
  lessons: Lesson[];
}

export function UnitAccordion({ units, lessons }: UnitAccordionProps) {
  const getLessonsForUnit = (unitId: string) => {
    return lessons.filter(lesson => lesson.unit_id === unitId);
  };

  if (units.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No units available yet.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {units.map((unit) => {
        const unitLessons = getLessonsForUnit(unit.id);
        
        return (
          <AccordionItem
            key={unit.id}
            value={unit.id}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium text-foreground">{unit.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({unitLessons.length} lesson{unitLessons.length !== 1 ? 's' : ''})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              {unitLessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No lessons in this unit yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {unitLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}