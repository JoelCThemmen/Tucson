import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function VerificationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-700/50 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Verification Submitted Successfully!
          </h1>
          
          <p className="text-gray-900 dark:text-gray-300 mb-8">
            Your accredited investor verification has been received and is being reviewed by our team.
          </p>

          {/* Timeline */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">What happens next?</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Document Review</p>
                  <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">
                    Our compliance team will review your submitted documents
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Verification Process</p>
                  <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">
                    We'll verify your information (24-72 hours)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notification</p>
                  <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">
                    You'll receive an email with your verification status
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Access Granted</p>
                  <p className="text-xs text-gray-900 dark:text-gray-300 mt-1">
                    Once approved, you'll have full access to investment opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg p-4 mb-8">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
              <div className="text-left">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Review Timeline
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-100">
                  Most verifications are completed within 24-72 hours. You can check your status anytime in your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => navigate('/verification/status')}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-400 dark:border-gray-600 text-base font-medium rounded-xl text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Check Verification Status
            </button>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-xs text-gray-800 dark:text-gray-400">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@tucson-invest.com" className="text-primary-600 hover:text-primary-700">
              support@tucson-invest.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}