import { Header } from '@/components/Header';
import { CoursesList } from '@/components/CoursesList';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { useActiveCourses } from '@/hooks/useCourses';
import { Link } from 'react-router-dom';
import { Settings, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: courses, isLoading } = useActiveCourses();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <CountdownDisplay />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CoursesList courses={courses || []} />
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
};

export default Index;
