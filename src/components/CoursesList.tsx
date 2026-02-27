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
            className="group relative block w-full rounded-[20px] overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #D6CFE3 0%, #B8AFC9 100%)',
              boxShadow: '0 4px 16px -4px hsl(280 12% 70% / 0.25), inset 0 1px 1px hsl(0 0% 100% / 0.25)',
              borderTop: '1px solid hsl(0 0% 100% / 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 28px -4px hsl(280 12% 65% / 0.35), inset 0 1px 1px hsl(0 0% 100% / 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px -4px hsl(280 12% 70% / 0.25), inset 0 1px 1px hsl(0 0% 100% / 0.25)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px -2px hsl(280 12% 70% / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.15)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 28px -4px hsl(280 12% 65% / 0.35), inset 0 1px 1px hsl(0 0% 100% / 0.3)';
            }}
          >
            {/* Glassmorphism overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.12) 0%, hsl(0 0% 100% / 0.03) 100%)',
                backdropFilter: 'blur(2px)',
              }}
            />

            <div className="relative px-7 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="h-5 w-5 text-foreground/70 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {course.name}
                  </h3>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    Created {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="h-5 w-5 text-foreground/50 flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
