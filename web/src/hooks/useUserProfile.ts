import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuthProvider';
import { userService } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'INVESTOR' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

// Create a singleton to prevent multiple simultaneous fetches
let profilePromise: Promise<any> | null = null;
let cachedProfile: UserProfile | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const fetchProfile = useCallback(async () => {
    console.log('[useUserProfile] Fetching profile, isSignedIn:', isSignedIn);
    
    if (!isSignedIn) {
      console.log('[useUserProfile] User not signed in, clearing profile');
      cachedProfile = null;
      setProfile(null);
      setLoading(false);
      return;
    }

    // Check if we have a recent cached profile
    const now = Date.now();
    if (cachedProfile && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('[useUserProfile] Using cached profile');
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }

    // If there's already a fetch in progress, wait for it
    if (profilePromise) {
      console.log('[useUserProfile] Waiting for existing fetch...');
      try {
        const response = await profilePromise;
        if (response?.status === 'success') {
          cachedProfile = response.data.user;
          lastFetchTime = Date.now();
          setProfile(cachedProfile);
        }
      } catch (err) {
        console.error('[useUserProfile] Error in existing fetch:', err);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[useUserProfile] Starting new profile fetch...');
      
      // Create a new promise for this fetch
      profilePromise = userService.getProfile();
      const response = await profilePromise;
      profilePromise = null; // Clear the promise after completion
      
      console.log('[useUserProfile] Profile response:', response);
      
      if (response.status === 'success') {
        console.log('[useUserProfile] Setting profile:', response.data.user);
        cachedProfile = response.data.user;
        lastFetchTime = Date.now();
        setProfile(cachedProfile);
        setError(null);
      } else {
        console.error('[useUserProfile] Unexpected response status:', response.status);
        setError('Failed to load profile');
      }
    } catch (err: any) {
      profilePromise = null; // Clear the promise on error
      console.error('[useUserProfile] Failed to fetch user profile:', err);
      console.error('[useUserProfile] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  console.log('[useUserProfile] Current state:', {
    profile: profile ? { email: profile.email, role: profile.role } : null,
    loading,
    error,
    isAdmin,
    isSuperAdmin,
  });

  return {
    profile,
    loading,
    error,
    isAdmin,
    isSuperAdmin,
    refetch: fetchProfile
  };
}