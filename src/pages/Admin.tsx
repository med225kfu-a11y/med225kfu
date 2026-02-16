import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminHeader } from '@/components/Header';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { UnitsManager } from '@/components/admin/UnitsManager';
import { LessonsManager } from '@/components/admin/LessonsManager';
import { UserManagement } from '@/components/admin/UserManagement';
import { CountdownEventsManager } from '@/components/admin/CountdownEventsManager';
import { CoursesManager } from '@/components/admin/CoursesManager';
import { Button } from '@/components/ui/button';
import { 
  Loader2, LogOut, Settings, BookOpen, Users, GraduationCap, 
  Clock, FileText, Menu, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminSection = 'courses' | 'content' | 'lessons' | 'countdown' | 'settings' | 'users';

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'content', label: 'Units', icon: BookOpen },
  { id: 'lessons', label: 'Lessons', icon: FileText },
  { id: 'countdown', label: 'Countdown', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'users', label: 'Users', icon: Users },
];

export default function Admin() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-serif mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges. Please contact an administrator to grant you access.
          </p>
          <Button onClick={() => signOut().then(() => navigate('/'))}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'courses':
        return <CoursesManager />;
      case 'content':
        return <UnitsManager />;
      case 'lessons':
        return <LessonsManager />;
      case 'countdown':
        return <CountdownEventsManager />;
      case 'settings':
        return <SiteSettingsManager />;
      case 'users':
        return <UserManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      {/* Mobile menu toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="ml-2">Menu</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate('/'))}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 border-r border-border bg-sidebar min-h-[calc(100vh-73px)] flex-shrink-0",
          "lg:block",
          sidebarOpen ? "block absolute z-50 lg:relative" : "hidden"
        )}>
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    activeSection === item.id
                      ? "bg-sidebar-accent text-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border hidden lg:block">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => signOut().then(() => navigate('/'))}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
