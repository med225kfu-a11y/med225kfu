import { Category, Unit, Lesson } from '@/types/database';
import { LessonCard } from './LessonCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, FolderOpen } from 'lucide-react';

interface ContentHierarchyProps {
  categories: Category[];
  units: Unit[];
  lessons: Lesson[];
}

export function UnitAccordion({ categories, units, lessons }: ContentHierarchyProps) {
  const getUnitsForCategory = (categoryId: string) => {
    return units.filter(unit => unit.category_id === categoryId);
  };

  const getLessonsForUnit = (unitId: string) => {
    return lessons.filter(lesson => lesson.unit_id === unitId);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No content available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryUnits = getUnitsForCategory(category.id);
        const totalLessons = categoryUnits.reduce(
          (acc, unit) => acc + getLessonsForUnit(unit.id).length,
          0
        );

        return (
          <section key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <FolderOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">{category.name}</h2>
              <span className="text-sm text-muted-foreground">
                ({categoryUnits.length} unit{categoryUnits.length !== 1 ? 's' : ''}, {totalLessons} lesson{totalLessons !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Units Accordion */}
            {categoryUnits.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No units in this category yet.
              </p>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {categoryUnits.map((unit) => {
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
            )}
          </section>
        );
      })}
    </div>
  );
}
