import { useEffect } from 'react';
import { useAuth } from './useAuthProvider';
import { setAuthTokenGetter } from '../services/api';

export const useApi = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Set the token getter function for axios to use
      setAuthTokenGetter(async () => {
        try {
          const token = await getToken();
          console.log('Getting Clerk token for request');
          return token;
        } catch (error) {
          console.error('Failed to get auth token:', error);
          return null;
        }
      });
    } else if (isLoaded && !isSignedIn) {
      setAuthTokenGetter(() => Promise.resolve(null));
    }
  }, [isLoaded, isSignedIn, getToken]);

  return { isReady: isLoaded };
};