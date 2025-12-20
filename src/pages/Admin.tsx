import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminHeader } from '@/components/Header';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { UnitsManager } from '@/components/admin/UnitsManager';
import { LessonsManager } from '@/components/admin/LessonsManager';
import { UserManagement } from '@/components/admin/UserManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogOut, Settings, BookOpen, Users } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
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

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Admin Dashboard</h2>
          <Button variant="outline" onClick={() => signOut().then(() => navigate('/'))}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-8">
            <SiteSettingsManager />
            <UnitsManager />
            <LessonsManager />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}