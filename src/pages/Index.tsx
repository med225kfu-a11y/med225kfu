import { Header } from '@/components/Header';
import { CoursesList } from '@/components/CoursesList';
import { CountdownDisplay } from '@/components/CountdownDisplay';
import { HomepageQuote } from '@/components/HomepageQuote';
import { AnnouncementsSlider } from '@/components/AnnouncementsSlider';
import { useActiveCourses } from '@/hooks/useCourses';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Link } from 'react-router-dom';
import { Settings, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: courses, isLoading } = useActiveCourses();
  const { data: settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-[900px] mx-auto px-4 py-12">
        {/* 1. Announcements */}
        <AnnouncementsSlider />

        {/* 2. Available Blocks */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-[60px]">
            <CoursesList courses={courses || []} />
          </div>
        )}

        {/* 3. Countdown */}
        <div className="mt-[60px]">
          <CountdownDisplay />
        </div>

        {/* 4. Quote */}
        <HomepageQuote quoteText={settings?.quote_text} />
      </main>
      
      <footer className="border-t border-border py-6 mt-[60px]">
        <div className="w-full max-w-[900px] mx-auto px-4 flex items-center justify-between">
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
