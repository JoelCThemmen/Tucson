import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const navigate = useNavigate();
  const { profile, loading, isAdmin, error } = useUserProfile();

  // Debug logging
  useEffect(() => {
    console.log('[ProtectedAdminRoute] State:', {
      loading,
      isAdmin,
      profile,
      error,
      role: profile?.role,
    });
  }, [loading, isAdmin, profile, error]);

  useEffect(() => {
    // Once loading is complete, check if user is admin
    if (!loading) {
      if (!isAdmin) {
        console.log('[ProtectedAdminRoute] Access denied: User is not an admin', { 
          profile,
          role: profile?.role,
          isAdmin 
        });
        navigate('/app');
      } else {
        console.log('[ProtectedAdminRoute] Access granted: User is admin', {
          profile,
          role: profile?.role,
          isAdmin
        });
      }
    }
  }, [loading, isAdmin, navigate, profile]);

  // Show loading state while checking permissions
  if (loading) {
    console.log('[ProtectedAdminRoute] Loading user profile...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error if profile failed to load
  if (error) {
    console.error('[ProtectedAdminRoute] Error loading profile:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading user profile: {error}</div>
      </div>
    );
  }

  // Don't render children if not admin
  if (!isAdmin) {
    console.log('[ProtectedAdminRoute] Not rendering - user is not admin');
    return null;
  }

  console.log('[ProtectedAdminRoute] Rendering admin content');
  return <>{children}</>;
}