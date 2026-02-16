import { Link } from 'react-router-dom';
import { Course } from '@/types/database';
import { GraduationCap, ChevronRight } from 'lucide-react';

interface CoursesListProps {
  courses: Course[];
}

export function CoursesList({ courses }: CoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif text-foreground flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" />
        Available Blocks
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="group block p-5 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
