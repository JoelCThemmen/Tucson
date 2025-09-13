import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navigation from '../components/Navigation';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  LockClosedIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  SparklesIcon,
  BoltIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface VerificationData {
  isAccredited: boolean;
  currentVerification: any | null;
  verificationHistory: any[];
}

const benefits = [
  {
    icon: BuildingOfficeIcon,
    title: 'Private Equity Access',
    description: 'Invest in exclusive pre-IPO companies and venture capital opportunities',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Higher Returns',
    description: 'Access investments with potential for above-market returns',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: ChartBarIcon,
    title: 'Portfolio Diversification',
    description: 'Add alternative investments to reduce portfolio risk',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: UserGroupIcon,
    title: 'Exclusive Network',
    description: 'Join a community of sophisticated investors and entrepreneurs',
    gradient: 'from-orange-500 to-red-600',
  },
];

const qualificationCriteria = [
  {
    type: 'Income',
    icon: BanknotesIcon,
    requirements: [
      '$200,000+ annual income (individual)',
      '$300,000+ annual income (joint)',
      'Last 2 years + current year expectation',
    ],
  },
  {
    type: 'Net Worth',
    icon: ScaleIcon,
    requirements: [
      '$1 million+ net worth',
      'Excluding primary residence',
      'Including assets minus liabilities',
    ],
  },
  {
    type: 'Professional',
    icon: AcademicCapIcon,
    requirements: [
      'Licensed securities professional',
      'Series 7, 65, or 82 holder',
      'Investment advisor representative',
    ],
  },
];

const faqs = [
  {
    question: 'What is an accredited investor?',
    answer: 'An accredited investor is an individual or entity that meets specific financial criteria set by the SEC, allowing them to invest in private securities offerings not registered with regulatory authorities.',
  },
  {
    question: 'How long does verification take?',
    answer: 'Most verifications are completed within 24-48 hours after submitting all required documentation. Complex cases may take up to 5 business days.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes, we use bank-level encryption and comply with all data protection regulations. Your documents are securely stored and only accessed by authorized compliance personnel.',
  },
  {
    question: 'How long is verification valid?',
    answer: 'Accredited investor verification is typically valid for 90 days to 1 year, depending on the investment platform requirements. We\'ll notify you when renewal is needed.',
  },
];

const securityBadges = [
  { icon: LockClosedIcon, text: 'Bank-level Encryption' },
  { icon: ShieldCheckIcon, text: 'SOC 2 Compliant' },
  { icon: CheckBadgeIcon, text: 'SEC Regulated' },
  { icon: GlobeAltIcon, text: 'GDPR Compliant' },
];

export default function VerificationStatus() {
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verification/status');
      setVerificationData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'PENDING': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'IN_REVIEW': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'REJECTED': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-400 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return CheckCircleIcon;
      case 'PENDING': return ClockIcon;
      case 'IN_REVIEW': return DocumentTextIcon;
      case 'REJECTED': return XCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
          {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Accredited Investor Verification
          </h1>
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock exclusive investment opportunities reserved for sophisticated investors. 
            Join over 50,000+ verified investors accessing premium deals.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">50,000+</div>
            <div className="text-sm text-gray-800 dark:text-gray-300 mt-1">Verified Investors</div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">$2.5B+</div>
            <div className="text-sm text-gray-800 dark:text-gray-300 mt-1">Capital Deployed</div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">24-48h</div>
            <div className="text-sm text-gray-800 dark:text-gray-300 mt-1">Verification Time</div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <ShieldCheckIcon className="h-8 w-8 mr-3" />
              Your Verification Status
            </h2>
          </div>
          
          <div className="p-8">
            {verificationData?.isAccredited ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleSolid className="h-12 w-12 text-green-500 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verified Accredited Investor</h3>
                    <p className="text-gray-800 dark:text-gray-300 mt-1">You have full access to all investment opportunities</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  View Certificate
                </button>
              </div>
            ) : verificationData?.currentVerification ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${getStatusColor(verificationData.currentVerification.status).replace('text-', 'bg-').replace('600', '100')}`}>
                      {(() => {
                        const Icon = getStatusIcon(verificationData.currentVerification.status);
                        return <Icon className={`h-8 w-8 ${getStatusColor(verificationData.currentVerification.status).split(' ')[0]}`} />;
                      })()}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Verification {verificationData.currentVerification.status.toLowerCase().replace('_', ' ')}
                      </h3>
                      <p className="text-gray-800 dark:text-gray-300">
                        Submitted on {new Date(verificationData.currentVerification.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {verificationData.currentVerification.status === 'PENDING' && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-md p-4">
                    <p className="text-blue-800 dark:text-blue-200">
                      Your verification is being processed. We'll notify you once review is complete.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start Your Verification Journey
                </h3>
                <p className="text-gray-800 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Complete a simple verification process to unlock exclusive investment opportunities
                </p>
                <button
                  onClick={() => navigate('/verification')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Start Verification Process
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Become Accredited?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${benefit.gradient}`}></div>
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.gradient} mb-4`}>
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-800 dark:text-gray-300 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification Criteria */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Qualification Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {qualificationCriteria.map((criteria, index) => (
              <div key={index} className="border border-gray-400 dark:border-gray-600 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <criteria.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{criteria.type}</h3>
                </div>
                <ul className="space-y-2">
                  {criteria.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleSolid className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 dark:text-gray-300 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Security is Our Priority</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {securityBadges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-800/10 rounded-lg flex items-center justify-center mb-2">
                  <badge.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-white/80 text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDownIcon 
                    className={`h-5 w-5 text-gray-900 dark:text-gray-300 transition-transform ${
                      selectedFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {selectedFaq === index && (
                  <div className="px-6 pb-4 border-t border-gray-400 dark:border-gray-600 pt-4">
                    <p className="text-gray-800 dark:text-gray-200">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl shadow-lg p-8 border border-indigo-100 dark:border-indigo-700">
          <div className="flex items-start">
            <QuestionMarkCircleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                If you have questions about the verification process or need assistance with your application, 
                our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => window.location.href = 'mailto:support@tucson.com'}
                >
                  <EnvelopeIcon className="h-5 w-5 text-gray-900 dark:text-gray-400 mr-2" />
                  Email Support
                </button>
                <button 
                  onClick={fetchVerificationStatus}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5 text-gray-900 dark:text-gray-400 mr-2" />
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification History */}
        {verificationData?.verificationHistory && verificationData.verificationHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Verification History</h2>
            <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white border border-gray-300 dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                    {verificationData.verificationHistory.map((verification, index) => (
                      <tr key={index} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(verification.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {verification.verificationType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                            {verification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-400 dark:text-gray-500">
                          {verification.reviewNotes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </>
  );
}

// Add missing import for ChevronDownIcon
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);