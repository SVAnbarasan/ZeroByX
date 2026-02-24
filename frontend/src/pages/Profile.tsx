
import React, { useState, useEffect } from 'react';
import { useAuth } from '../integrations/supabase/AuthProvider';
import { supabase } from '../integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Not logged in</h1>
        <p className="mb-4">You need to log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>
      <Button onClick={handleSignOut} disabled={loading}>
        {loading ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
};

export default Profile;
