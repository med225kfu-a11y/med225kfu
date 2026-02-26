import { Link } from 'react-router-dom';
import { Course } from '@/types/database';
import { FolderOpen, ChevronRight, BookOpen } from 'lucide-react';

interface CoursesListProps {
  courses: Course[];
}

export function CoursesList({ courses }: CoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderOpen className="h-10 w-10 mx-auto mb-4 opacity-40" strokeWidth={1.5} />
        <p>No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-serif text-foreground flex items-center gap-2.5">
        <FolderOpen className="h-6 w-6 text-foreground" strokeWidth={1.5} />
        Available Blocks
      </h2>
      <div className="flex flex-col gap-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="group block w-full px-7 py-6 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
