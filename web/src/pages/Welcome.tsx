import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, setActive } = useSignUp();

  useEffect(() => {
    const handleInvitation = async () => {
      // Check if this is an invitation flow
      const ticket = searchParams.get('__clerk_ticket');
      const status = searchParams.get('__clerk_status');
      
      if (status === 'sign_up' && ticket) {
        // This is an invitation - redirect to sign-up with the ticket
        // Clerk will handle the invitation flow automatically
        navigate(`/sign-up?__clerk_ticket=${ticket}&__clerk_status=${status}`);
      } else if (status === 'signed_in') {
        // User completed sign-up, redirect to dashboard
        navigate('/app');
      } else {
        // Regular welcome page - maybe for users who signed up normally
        // For now, just redirect to sign-in
        navigate('/sign-in');
      }
    };

    handleInvitation();
  }, [navigate, searchParams, signUp, setActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Tucson!</h1>
          <p className="text-gray-600 mb-6">
            Setting up your account...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}