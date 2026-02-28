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
      
      <footer
        className="relative mt-[60px]"
        style={{
          background: 'linear-gradient(135deg, hsl(34 30% 93%), hsl(270 15% 88%))',
          borderTop: '1px solid hsl(270 12% 82% / 0.5)',
        }}
      >
        {/* Decorative top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, hsl(270 12% 78%), hsl(34 30% 80%), hsl(270 12% 78%))',
          }}
        />

        <div className="w-full max-w-[900px] mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <p
              className="text-sm text-center"
              style={{ color: 'hsl(0 0% 50%)' }}
            >
              © {new Date().getFullYear()} Scientific Community of Med225
            </p>
            <Link 
              to="/auth" 
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: 'hsl(0 0% 60%)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(0 0% 40%)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(0 0% 60%)'}
            >
              <Settings className="h-3.5 w-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
