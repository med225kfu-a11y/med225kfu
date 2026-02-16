import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { UnitAccordion } from '@/components/UnitAccordion';
import { useCourse } from '@/hooks/useCourses';
import { useCategories } from '@/hooks/useCategories';
import { useUnitsByCourse } from '@/hooks/useUnitsByCourse';
import { useAllLessons } from '@/hooks/useLessons';
import { Loader2, ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: units, isLoading: unitsLoading } = useUnitsByCourse(courseId);
  const { data: allLessons, isLoading: lessonsLoading } = useAllLessons();

  const isLoading = courseLoading || categoriesLoading || unitsLoading || lessonsLoading;

  // Filter lessons to only those belonging to units in this course
  const unitIds = new Set(units?.map(u => u.id) || []);
  const lessons = allLessons?.filter(l => unitIds.has(l.unit_id)) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          
          {course && (
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">{course.name}</h2>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UnitAccordion
            categories={categories || []}
            units={units || []}
            lessons={lessons}
          />
        )}
      </main>
      
      <footer className="border-t border-border py-6 mt-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Academic Medical Community
          </p>
          <Link 
            to="/auth" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
