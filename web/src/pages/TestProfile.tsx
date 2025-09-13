import { useUserProfile } from '../hooks/useUserProfile';
import { useUser } from '@clerk/clerk-react';

export default function TestProfile() {
  const { profile, loading, error, isAdmin, isSuperAdmin } = useUserProfile();
  const { user } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile Debug Information</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Clerk User:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile Loading State:</h2>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile Data:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Permissions:</h2>
        <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        <p>Is Super Admin: {isSuperAdmin ? 'Yes' : 'No'}</p>
        <p>Role: {profile?.role || 'Not loaded'}</p>
      </div>
    </div>
  );
}