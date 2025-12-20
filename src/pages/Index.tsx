import { Header } from '@/components/Header';
import { UnitAccordion } from '@/components/UnitAccordion';
import { useUnits } from '@/hooks/useUnits';
import { useAllLessons } from '@/hooks/useLessons';
import { Link } from 'react-router-dom';
import { Settings, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: lessons, isLoading: lessonsLoading } = useAllLessons();

  const isLoading = unitsLoading || lessonsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UnitAccordion units={units || []} lessons={lessons || []} />
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