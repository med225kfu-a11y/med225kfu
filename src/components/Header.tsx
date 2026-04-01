import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

export function Header() {
  const { data: settings } = useSiteSettings();
  
  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(34 30% 93%), hsl(270 15% 88%))',
        borderBottom: '1px solid hsl(270 12% 82% / 0.5)',
      }}
    >
      {/* Decorative accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, hsl(270 12% 78%), hsl(34 30% 80%), hsl(270 12% 78%))',
        }}
      />

      {/* Admin link top-left */}
      <Link 
        to="/auth" 
        className="absolute top-4 left-4 z-10 text-xs flex items-center gap-1 transition-colors"
        style={{ color: 'hsl(0 0% 60%)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(0 0% 40%)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(0 0% 60%)'}
      >
        <Settings className="h-3.5 w-3.5" />
        Admin
      </Link>

      <div className="w-full max-w-[900px] mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col items-center gap-4">
          {settings?.logo_url && (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          )}
          <h1
            className="text-2xl md:text-3xl lg:text-4xl text-center leading-tight"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'hsl(0 0% 28%)',
              letterSpacing: '-0.01em',
            }}
          >
            {settings?.site_title || 'The Scientific Community of Med225'}
          </h1>
        </div>
      </div>
    </header>
  );
}

export function AdminHeader() {
  const { data: settings } = useSiteSettings();
  
  return (
    <header
      className="relative"
      style={{
        background: 'linear-gradient(135deg, hsl(34 30% 93%), hsl(270 15% 88%))',
        borderBottom: '1px solid hsl(270 12% 82% / 0.5)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, hsl(270 12% 78%), hsl(34 30% 80%), hsl(270 12% 78%))',
        }}
      />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-lg font-serif text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                {settings?.site_title || 'The Scientific Community of Med225'}
              </p>
            </div>
          </div>
          <Link 
            to="/" 
            className="text-sm text-primary hover:underline"
          >
            View Public Site
          </Link>
        </div>
      </div>
    </header>
  );
}
