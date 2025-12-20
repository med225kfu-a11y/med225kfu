import { useSiteSettings } from '@/hooks/useSiteSettings';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { data: settings } = useSiteSettings();
  
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-16 w-auto object-contain"
            />
          ) : (
            <GraduationCap className="h-12 w-12 text-primary" />
          )}
          <h1 className="text-2xl md:text-3xl font-serif text-foreground text-center">
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
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <GraduationCap className="h-8 w-8 text-primary" />
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