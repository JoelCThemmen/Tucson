import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Navigation from '../components/Navigation';
import { setAuthTokenGetter } from '../services/api';

export default function MainLayout() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the auth token getter for API calls
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      {/* Main content with padding for fixed navigation */}
      <main className="pt-16">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}