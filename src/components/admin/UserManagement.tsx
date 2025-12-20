import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, User, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  isAdmin: boolean;
}

export function UserManagement() {
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: 'Enter an email',
        description: 'Please enter an email address to search.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      // Search profiles by email (partial match)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .ilike('email', `%${searchEmail}%`);

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        toast({
          title: 'No users found',
          description: 'No registered users match that email.',
        });
        return;
      }

      // Get admin roles for found users
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(roles?.map(r => r.user_id) || []);

      const usersWithRoles: UserProfile[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        isAdmin: adminUserIds.has(profile.id),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Search failed',
        description: 'Could not search for users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already an admin',
            description: 'This user is already an admin.',
          });
        } else {
          throw error;
        }
      } else {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isAdmin: true } : u
        ));
        toast({
          title: 'User promoted',
          description: 'User has been promoted to Admin.',
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Promotion failed',
        description: 'Could not promote user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const demoteToStudent = async (userId: string) => {
    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isAdmin: false } : u
      ));
      toast({
        title: 'User demoted',
        description: 'User has been demoted to Student.',
      });
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: 'Demotion failed',
        description: 'Could not demote user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            className="flex-1"
          />
          <Button onClick={searchUsers} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </div>

        {/* Results */}
        {users.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Found {users.length} user(s)
            </h4>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {user.isAdmin ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Admin' : 'Student'}
                    </Badge>
                    {user.isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => demoteToStudent(user.id)}
                        disabled={isUpdating === user.id}
                      >
                        {isUpdating === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Demote to Student'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => promoteToAdmin(user.id)}
                        disabled={isUpdating === user.id}
                      >
                        {isUpdating === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Promote to Admin'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state after search */}
        {users.length === 0 && searchEmail && !isSearching && (
          <p className="text-center text-muted-foreground py-8">
            No users found. Try a different search term.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
