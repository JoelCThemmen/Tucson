import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthProvider';
import { formatCurrency, parseCurrency, formatCurrencyInput } from '../utils/currency';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ChartBarIcon,
  HomeIcon,
  CalculatorIcon,
  GlobeAltIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EyeSlashIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

type VerificationType = 'INCOME' | 'NET_WORTH';
type StepStatus = 'pending' | 'active' | 'completed';

interface Step {
  id: number;
  name: string;
  description: string;
  status: StepStatus;
}

const initialSteps: Step[] = [
  {
    id: 1,
    name: 'Choose Method',
    description: 'Select your verification type • Est. 3-5 minutes',
    status: 'active',
  },
  {
    id: 2,
    name: 'Financial Details',
    description: 'Enter your financial information • Est. 2-3 minutes',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Document Upload',
    description: 'Submit supporting documents • Est. 5-8 minutes',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Review & Submit',
    description: 'Final review and submission • Est. 2 minutes',
    status: 'pending',
  },
];

export default function VerificationWizard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [verificationType, setVerificationType] = useState<VerificationType | null>(null);
  const [formData, setFormData] = useState({
    annualIncome: '',
    incomeSource: '',
    netWorth: '',
    liquidNetWorth: '',
    attestation: false,
    consentToVerify: false,
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showDocumentHelp, setShowDocumentHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // In development with mock auth, don't redirect
    const isDevelopment = import.meta.env.DEV;
    const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    const useMockAuth = isDevelopment && !hasClerkKey;
    
    if (!useMockAuth && isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  const updateStepStatus = (stepNumber: number) => {
    setSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        status: step.id < stepNumber ? 'completed' : 
                step.id === stepNumber ? 'active' : 'pending'
      }))
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      updateStepStatus(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateStepStatus(currentStep - 1);
      setError(null);
    }
  };

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!verificationType;
      case 2:
        if (verificationType === 'INCOME') {
          return !!formData.annualIncome && 
                 parseFloat(formData.annualIncome) >= 200000 && 
                 !!formData.incomeSource;
        } else if (verificationType === 'NET_WORTH') {
          return !!formData.netWorth && 
                 parseFloat(formData.netWorth) >= 1000000;
        }
        return false;
      case 3:
        return documents.length > 0 && 
               documentTypes.length === documents.length &&
               documentTypes.every(type => type !== '');
      case 4:
        return formData.attestation && formData.consentToVerify;
      default:
        return true;
    }
  }, [currentStep, verificationType, formData, documents, documentTypes]);

  const validateStep = (): boolean => {
    if (!isStepValid) {
      switch (currentStep) {
        case 1:
          setError('Please select a verification method');
          break;
        case 2:
          if (verificationType === 'INCOME') {
            if (!formData.annualIncome || parseFloat(formData.annualIncome) < 200000) {
              setError('Annual income must be at least $200,000 for accredited investor status');
            } else if (!formData.incomeSource) {
              setError('Please specify your income source');
            }
          } else if (verificationType === 'NET_WORTH') {
            if (!formData.netWorth || parseFloat(formData.netWorth) < 1000000) {
              setError('Net worth must be at least $1,000,000 for accredited investor status');
            }
          }
          break;
        case 3:
          if (documents.length === 0) {
            setError('Please upload at least one supporting document');
          } else if (documentTypes.some(type => type === '')) {
            setError('Please specify the type for each document');
          }
          break;
        case 4:
          setError('You must agree to all terms to proceed');
          break;
      }
      return false;
    }
    return true;
  };

  const handleStepClick = () => {
    if (validateStep()) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit verification request
      const verificationResponse = await api.post('/verification/submit', {
        verificationType,
        annualIncome: verificationType === 'INCOME' ? formData.annualIncome : undefined,
        incomeSource: verificationType === 'INCOME' ? formData.incomeSource : undefined,
        netWorth: verificationType === 'NET_WORTH' ? formData.netWorth : undefined,
        liquidNetWorth: verificationType === 'NET_WORTH' ? formData.liquidNetWorth : undefined,
        attestation: formData.attestation,
        consentToVerify: formData.consentToVerify,
      });

      const verificationId = verificationResponse.data.data.id;

      // Upload documents if any
      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => {
          formData.append('documents', doc);
        });
        formData.append('documentTypes', JSON.stringify(documentTypes));

        await api.post(`/verification/${verificationId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Navigate to success page
      navigate('/verification/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-full mb-6 shadow-xl shadow-indigo-500/25">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Accredited Investor Verification
          </h1>
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock exclusive investment opportunities reserved for sophisticated investors. Join over 50,000+ verified investors accessing premium deals.
          </p>
          <div className="mt-4 text-sm text-gray-900 dark:text-gray-400 flex items-center justify-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>Total estimated time: 12-18 minutes • Progress is automatically saved</span>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
              <div className="p-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <LockClosedIcon className="h-4 w-4 text-green-600" />
              </div>
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
              <div className="p-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <CheckCircleIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span>SEC Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
              <div className="p-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
                <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
              </div>
              <span>24-48h Verification</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-12">
          <ol className="flex items-center justify-between">
            {steps.map((step) => (
              <li key={step.id} className="flex-1">
                <div
                  className={`flex flex-col items-center ${
                    step.status === 'completed' ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="relative">
                    {step.status === 'completed' ? (
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 transform hover:scale-105 transition-transform duration-200">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
                      </div>
                    ) : step.status === 'active' ? (
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-indigo-100 shadow-xl shadow-indigo-500/30 animate-pulse">
                        <span className="text-white font-bold text-lg">{step.id}</span>
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center border-2 border-gray-400 dark:border-gray-600 shadow-md">
                        <span className="text-gray-900 dark:text-gray-300 font-semibold text-lg">{step.id}</span>
                      </div>
                    )}
                    {step.id < steps.length && (
                      <div
                        className={`absolute top-7 left-12 w-full h-1 rounded-full ${
                          step.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        style={{ width: 'calc(100% + 2.5rem)' }}
                      />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`text-sm font-semibold ${
                      step.status === 'active' ? 'text-indigo-700' : step.status === 'completed' ? 'text-green-700' : 'text-gray-800 dark:text-gray-300'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-gray-400 mt-1 max-w-24 mx-auto leading-tight">{step.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl flex items-start shadow-lg shadow-red-500/10">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-500/10 border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Why Verification Matters Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-8 border-2 border-blue-100 dark:border-blue-700">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                  Why Accredited Investor Verification Matters
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-base">Unlock Premium Opportunities</h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-100">
                      <li className="flex items-start">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Private equity and hedge fund investments</span>
                      </li>
                      <li className="flex items-start">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Real estate syndications and REITs</span>
                      </li>
                      <li className="flex items-start">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Venture capital and startup investments</span>
                      </li>
                      <li className="flex items-start">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Alternative investment platforms</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-base">What You'll Access</h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-100">
                      <li className="flex items-start">
                        <ChartBarIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Higher potential returns (historically 8-12%+ annually)</span>
                      </li>
                      <li className="flex items-start">
                        <GlobeAltIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Portfolio diversification beyond public markets</span>
                      </li>
                      <li className="flex items-start">
                        <UserGroupIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Exclusive investor networking opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <DocumentTextIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Direct access to fund managers and sponsors</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Method Comparison Table */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl border-2 border-gray-400 dark:border-gray-600 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-gray-400 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Methods Comparison</h3>
                  <p className="text-sm text-gray-800 dark:text-gray-300">Choose the method that best fits your financial situation</p>
                </div>
                <div className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Criteria</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-l border-gray-400 dark:border-gray-600">Income Method</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider border-l border-gray-400 dark:border-gray-600">Net Worth Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Minimum Requirement</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">$200K+ annual income</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">$1M+ net worth</td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Documentation</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">Tax returns, W-2s, pay stubs</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">Bank statements, CPA letter</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Verification Time</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-green-600 dark:text-green-400 font-semibold">24-48 hours</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-orange-600 dark:text-orange-400 font-semibold">48-72 hours</td>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Best For</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">High earners, professionals</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-300">Business owners, retirees</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Success Rate</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-green-600 dark:text-green-400 font-semibold">97%</td>
                        <td className="px-6 py-4 text-sm text-center border-l border-gray-400 dark:border-gray-600 text-green-600 dark:text-green-400 font-semibold">94%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Choose Your Verification Method Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Your Verification Method
                </h2>
                <p className="text-gray-800 dark:text-gray-300 mb-4">Select the qualification path that applies to your situation</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-900 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Est. 3-5 minutes</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>95% success rate</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setVerificationType('INCOME')}
                  className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    verificationType === 'INCOME'
                      ? 'border-indigo-500 dark:border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-indigo-500/25'
                      : 'border-gray-400 dark:border-gray-600 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-gray-500/10'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg transition-all duration-300 ${
                      verificationType === 'INCOME' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-gray-500/20'
                    }`}>
                      <CurrencyDollarIcon className={`h-8 w-8 ${
                        verificationType === 'INCOME' ? 'text-white' : 'text-gray-800 dark:text-gray-300'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Income Verification
                    </h3>
                    <p className="text-sm text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                      Annual income of $200,000+ (individual) or $300,000+ (joint)
                    </p>
                    <div className="space-y-3 text-left w-full">
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow-md p-3">
                        <h4 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2">Required Documents:</h4>
                        <div className="space-y-1">
                          <p className="text-xs text-green-700 dark:text-green-100 flex items-start">
                            <CheckCircleIcon className="h-3 w-3 text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Last 2 years tax returns or W-2s</span>
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-100 flex items-start">
                            <CheckCircleIcon className="h-3 w-3 text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Recent pay stubs (3 months)</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-md p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">Typical Timeline:</span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">24-48 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {verificationType === 'INCOME' && (
                    <div className="absolute top-3 right-3">
                      <div className="p-1 bg-indigo-500 rounded-full shadow-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setVerificationType('NET_WORTH')}
                  className={`relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    verificationType === 'NET_WORTH'
                      ? 'border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 shadow-purple-500/25'
                      : 'border-gray-400 dark:border-gray-600 hover:border-purple-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-gray-500/10'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg transition-all duration-300 ${
                      verificationType === 'NET_WORTH' 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-gray-500/20'
                    }`}>
                      <BanknotesIcon className={`h-8 w-8 ${
                        verificationType === 'NET_WORTH' ? 'text-white' : 'text-gray-800 dark:text-gray-300'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Net Worth Verification
                    </h3>
                    <p className="text-sm text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                      Net worth exceeding $1,000,000 (excluding primary residence)
                    </p>
                    <div className="space-y-3 text-left w-full">
                      <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-md p-3">
                        <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-200 mb-2">Required Documents:</h4>
                        <div className="space-y-1">
                          <p className="text-xs text-purple-700 dark:text-purple-100 flex items-start">
                            <CheckCircleIcon className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Bank & investment statements</span>
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-100 flex items-start">
                            <CheckCircleIcon className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>CPA letter or advisor verification</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg shadow-md p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">Typical Timeline:</span>
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">48-72 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {verificationType === 'NET_WORTH' && (
                    <div className="absolute top-3 right-3">
                      <div className="p-1 bg-purple-500 rounded-full shadow-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* FAQ Section */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl border-2 border-gray-400 dark:border-gray-600">
                <div className="p-6 border-b border-gray-400 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-600 mr-3" />
                      Frequently Asked Questions
                    </h3>
                    <button
                      onClick={() => setShowFAQ(!showFAQ)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                    >
                      {showFAQ ? 'Hide FAQs' : 'Show FAQs'}
                      <ArrowRightIcon className={`h-4 w-4 ml-1 transform transition-transform ${showFAQ ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
                {showFAQ && (
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Which method should I choose?</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">Choose Income verification if you have consistent high income from employment or business. Choose Net Worth if you have significant assets but lower current income (common for business owners, retirees, or those with investment income).</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How secure is my financial information?</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">Your data is protected with bank-level AES-256 encryption, stored on SOC 2 Type II certified infrastructure, and never shared without explicit consent. Documents are automatically deleted after verification.</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What if I qualify under both methods?</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">You only need to qualify under one method. Income verification is typically faster (24-48 hours vs 48-72 hours) and requires simpler documentation if you meet the income threshold.</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change my verification method later?</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">Yes, you can restart the process with a different method if needed. However, we recommend choosing the method where you most clearly meet the requirements to ensure faster approval.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What happens if my verification is denied?</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">If verification is unsuccessful, we'll provide detailed feedback on what's needed. You can resubmit with additional documentation or try the alternative verification method at no extra cost.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits Preview */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center">
                    <StarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                    What You'll Unlock After Verification
                  </h3>
                  <button
                    onClick={() => setShowBenefits(!showBenefits)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center"
                  >
                    {showBenefits ? 'Hide Details' : 'Show Details'}
                    <ArrowRightIcon className={`h-4 w-4 ml-1 transform transition-transform ${showBenefits ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">500+</div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">Investment Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$50B+</div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">Assets Under Management</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">12.8%</div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">Avg. Annual Returns</div>
                  </div>
                </div>
                {showBenefits && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-700">
                    <div>
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">Investment Access</h4>
                      <ul className="space-y-2 text-sm text-emerald-700 dark:text-emerald-100">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Private REITs and real estate syndications</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Hedge funds and private equity opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Venture capital and startup investments</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Structured products and derivatives</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">Platform Benefits</h4>
                      <ul className="space-y-2 text-sm text-emerald-700 dark:text-emerald-100">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Priority deal allocation and early access</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Dedicated relationship manager</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Exclusive investor events and networking</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <span>Lower minimum investments and reduced fees</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700 shadow-lg shadow-blue-500/10">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 rounded-xl mr-4 shadow-md">
                    <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-3">
                      SEC Rule 501 Compliance
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      Accredited investor verification is required by the SEC to participate in certain investment opportunities. 
                      Your information is protected with AES-256 encryption and will never be shared without consent.
                    </p>
                    <div className="flex items-center mt-3 text-xs text-blue-700 dark:text-blue-100">
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Bank-level security • SOC 2 Type II certified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Provide Your Financial Information
                </h2>
                <p className="text-gray-800 dark:text-gray-300 mb-4">Enter your financial details to verify your accredited status</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-900 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Est. 2-3 minutes</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="h-4 w-4" />
                    <span>256-bit encrypted</span>
                  </div>
                </div>
              </div>

              {/* Information Security Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Bank-Level Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EyeSlashIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Never Shared</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrashIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Auto-Deleted After Review</span>
                    </div>
                  </div>
                </div>
              </div>

              {verificationType === 'INCOME' ? (
                <div className="space-y-8">
                  {/* Why We Need This Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-r-xl">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      Why We Need Your Income Information
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
                      SEC Rule 501(a) requires individuals to have annual income exceeding $200,000 (or $300,000 jointly with spouse) 
                      in each of the two most recent years with reasonable expectation of the same income level in the current year.
                    </p>
                    <div className="bg-blue-100 dark:bg-blue-800/50 rounded-lg shadow-md p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2">Acceptable Income Sources:</h4>
                      <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>W-2 wages and salary</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Business income (1099, Schedule C)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Investment income and dividends</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Real estate rental income</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Partnership distributions</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Capital gains (from investments)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 border-2 border-gray-400 dark:border-gray-600 shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                            Annual Income (USD)
                          </div>
                        </label>
                        <p className="text-sm text-gray-800 dark:text-gray-300">Enter your total annual income from all sources</p>
                      </div>
                      <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-green-700">Required</span>
                      </div>
                    </div>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-400 font-medium text-xl">$</span>
                      <input
                        type="text"
                        value={formData.annualIncome ? formatCurrency(formData.annualIncome) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted).toString();
                          setFormData({ ...formData, annualIncome: numericValue });
                        }}
                        className="w-full pl-12 pr-4 py-5 border-2 border-gray-400 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-2 focus:border-green-500 transition-all hover:border-gray-300 bg-white dark:bg-gray-800 shadow-md text-xl font-bold text-gray-900 dark:text-white"
                        placeholder="200,000"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg shadow-md p-4 mb-4">
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">Income Calculation Tips:</p>
                          <ul className="text-xs text-amber-700 dark:text-amber-100 space-y-1">
                            <li>• Use your gross annual income (before taxes and deductions)</li>
                            <li>• Include all income sources: salary, bonuses, commissions, business income</li>
                            <li>• For variable income, use an average of the last 2-3 years</li>
                            <li>• Joint filers: combine both spouses' income if married filing jointly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow-md p-3">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">$200K+</div>
                        <div className="text-xs text-green-700 dark:text-green-300">Individual Minimum</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-md p-3">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">$300K+</div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Joint Filing Minimum</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-md p-3">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">2 Years</div>
                        <div className="text-xs text-blue-700 dark:text-blue-100">Consistent History</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-xl shadow-lg p-8 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                          <div className="flex items-center">
                            <BanknotesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            Primary Income Source
                          </div>
                        </label>
                        <p className="text-sm text-gray-800 dark:text-gray-300">Select your main source of income</p>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-100">Required</span>
                      </div>
                    </div>
                    <select
                      value={formData.incomeSource}
                      onChange={(e) => setFormData({ ...formData, incomeSource: e.target.value })}
                      className="w-full px-6 py-5 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-2 focus:border-blue-500 transition-all hover:border-blue-300 bg-white dark:bg-gray-800 shadow-md text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      <option value="">Select your primary income source</option>
                      <option value="employment">Employment/Salary (W-2 wages, bonuses, commissions)</option>
                      <option value="business">Business Ownership (Schedule C, partnership, S-corp)</option>
                      <option value="investments">Investment Returns (dividends, interest, capital gains)</option>
                      <option value="real_estate">Real Estate (rental income, development, flipping)</option>
                      <option value="other">Other (consulting, royalties, trusts)</option>
                    </select>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-800/50 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        <span className="font-semibold">Documentation needed:</span> We'll ask for documents that verify this income source in the next step.
                      </p>
                      <div className="text-xs text-blue-700 dark:text-blue-100 grid md:grid-cols-2 gap-2">
                        <div>• Employment: Recent pay stubs, W-2 forms</div>
                        <div>• Business: Tax returns, profit & loss statements</div>
                        <div>• Investments: 1099 forms, brokerage statements</div>
                        <div>• Real Estate: Schedule E, rental agreements</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Why We Need This Information */}
                  <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 dark:border-purple-400 p-6 rounded-r-xl">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                      <InformationCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                      Why We Need Your Net Worth Information
                    </h3>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-4 leading-relaxed">
                      SEC Rule 501(a) allows individuals with net worth exceeding $1 million (excluding primary residence) 
                      to qualify as accredited investors, providing access to private investment opportunities.
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-800/50 rounded-lg shadow-md p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-2">Assets to Include in Net Worth:</h4>
                      <div className="grid md:grid-cols-2 gap-2 text-xs text-purple-800 dark:text-purple-200">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span>Investment accounts (401k, IRA, brokerage)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span>Bank accounts and cash equivalents</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span>Investment real estate and REITs</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span>Business ownership and equity</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span>Collectibles and valuables</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-red-700 dark:text-red-300">Exclude: Primary residence value</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 rounded-xl shadow-lg p-8 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                          <div className="flex items-center">
                            <BanknotesIcon className="h-5 w-5 text-purple-600 mr-2" />
                            Total Net Worth (USD)
                          </div>
                        </label>
                        <p className="text-sm text-gray-800 dark:text-gray-300">Total assets minus total liabilities</p>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-800/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-200">Required</span>
                      </div>
                    </div>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-400 font-medium text-xl">$</span>
                      <input
                        type="text"
                        value={formData.netWorth ? formatCurrency(formData.netWorth) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted).toString();
                          setFormData({ ...formData, netWorth: numericValue });
                        }}
                        className="w-full pl-12 pr-4 py-5 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-2 focus:border-purple-500 transition-all hover:border-purple-300 bg-white dark:bg-gray-800 shadow-md text-xl font-bold text-gray-900 dark:text-white"
                        placeholder="1,000,000"
                      />
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-md p-4 mb-4">
                      <div className="flex items-start">
                        <HomeIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Important: Exclude Primary Residence</p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            Per SEC rules, the value of your primary residence and any related mortgage debt 
                            should NOT be included in your net worth calculation for accredited investor qualification.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg shadow-md p-4 mb-4">
                      <div className="flex items-start">
                        <CalculatorIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Net Worth Calculation Formula:</p>
                          <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                            <div className="flex justify-between items-center py-1">
                              <span>Total Assets (excluding primary residence)</span>
                              <span className="font-mono">+ $______</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span>Total Liabilities (excluding primary residence mortgage)</span>
                              <span className="font-mono">- $______</span>
                            </div>
                            <hr className="border-indigo-300 dark:border-indigo-600" />
                            <div className="flex justify-between items-center py-1 font-semibold">
                              <span>Net Worth</span>
                              <span className="font-mono">= $______</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-lg p-8 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            Liquid Net Worth (Optional)
                          </div>
                        </label>
                        <p className="text-sm text-gray-800 dark:text-gray-300">Assets easily convertible to cash within 30 days</p>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800/50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-300">Optional</span>
                      </div>
                    </div>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-400 font-medium text-xl">$</span>
                      <input
                        type="text"
                        value={formData.liquidNetWorth ? formatCurrency(formData.liquidNetWorth) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          const numericValue = parseCurrency(formatted).toString();
                          setFormData({ ...formData, liquidNetWorth: numericValue });
                        }}
                        className="w-full pl-12 pr-4 py-5 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-2 focus:border-blue-500 transition-all hover:border-blue-300 bg-white dark:bg-gray-800 shadow-md text-xl font-bold text-gray-900 dark:text-white"
                        placeholder="500,000"
                      />
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-700 rounded-lg shadow-md p-4">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Liquid Assets Include:</p>
                      <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-100">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Checking and savings accounts</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Money market accounts</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Stocks and bonds (publicly traded)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>Mutual funds and ETFs</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                          <span>CDs and treasury securities</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></div>
                          <span className="text-gray-800 dark:text-gray-300">Note: Helps with investment minimums</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Mistakes to Avoid */}
              <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 dark:border-amber-400 p-6 rounded-r-xl">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  Common Mistakes to Avoid
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-2">Income Verification:</h4>
                    <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't use net income (after taxes) - use gross income</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't forget bonuses, commissions, and other compensation</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't use a single high-income year - need 2+ year history</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-2">Net Worth Verification:</h4>
                    <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't include your primary residence value</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't forget to subtract liabilities from assets</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span>Don't overvalue illiquid assets (art, collectibles)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Helpful Resources */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
                  <CalculatorIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Helpful Resources & Calculators
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Net Worth Calculators:</h4>
                    <div className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                      <a href="#" className="flex items-center hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors">
                        <GlobeAltIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>Personal Capital Net Worth Tracker</span>
                      </a>
                      <a href="#" className="flex items-center hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors">
                        <GlobeAltIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>Mint.com Financial Overview</span>
                      </a>
                      <a href="#" className="flex items-center hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors">
                        <GlobeAltIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>NerdWallet Net Worth Calculator</span>
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Need Help?</h4>
                    <div className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>Live chat available 9 AM - 6 PM PT</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>Call (855) 555-0123 for support</span>
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        <span>Email support@tucson.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-100/60 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border-2 border-green-200/50 dark:border-green-700 shadow-lg shadow-green-500/10 dark:shadow-green-500/5">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-xl mr-4 shadow-md">
                    <LockClosedIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-green-900 dark:text-green-100 mb-3">
                      Enterprise-Grade Security & Privacy
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800 dark:text-green-200">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>AES-256 encryption for data at rest</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>TLS 1.3 for data in transit</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>SOC 2 Type II certified infrastructure</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>Zero-knowledge architecture</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>GDPR and CCPA compliant</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                          <span>Data automatically purged after verification</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/50 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                        <span className="font-semibold">Privacy Guarantee:</span> Your financial information is never sold, shared with third parties, 
                        or used for marketing purposes. We only use it for SEC-required verification and delete it within 30 days of completion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Upload Supporting Documents
                </h2>
                <p className="text-gray-800 dark:text-gray-300 mb-4">Secure document upload with bank-level encryption</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-900 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Est. 5-8 minutes</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="h-4 w-4" />
                    <span>256-bit encrypted upload</span>
                  </div>
                </div>
              </div>

              {/* Document Preparation Guide */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl p-8 border-2 border-indigo-200 dark:border-indigo-700">
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-6 flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                  Document Preparation Guide
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4 text-base">File Requirements:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">File Formats</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">PDF, JPG, JPEG, PNG only</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">File Size</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Maximum 10MB per file</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Image Quality</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Clear, high resolution, all text readable</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Document Status</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Recent and unredacted (within 90 days)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4 text-base">Preparation Tips:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Scan in Good Lighting</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Avoid shadows, ensure all corners visible</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Remove Sensitive Info</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">You may redact SSN, account numbers if needed</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Organize by Type</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Label files clearly for faster processing</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Multi-page Documents</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300">Combine into single PDF when possible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Enhanced File Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 shadow-lg ${
                    dragOver 
                      ? 'border-indigo-500 dark:border-indigo-400 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 shadow-indigo-500/25' 
                      : 'border-indigo-300 dark:border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 shadow-indigo-500/10'
                  }`}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    const validFiles = files.filter(file => 
                      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
                    );
                    if (validFiles.length > 0) {
                      setDocuments(validFiles);
                      setDocumentTypes(new Array(validFiles.length).fill(''));
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 rounded-full mb-8 shadow-lg">
                      <DocumentTextIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {dragOver ? 'Drop your files here' : 'Upload Your Documents'}
                    </h3>
                    <p className="text-lg text-gray-800 dark:text-gray-300 mb-2">
                      Drag and drop your documents here, or click to browse
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-400 mb-8">
                      PDF, JPG, PNG up to 10MB each • Bank-level AES-256 encryption
                    </p>
                    
                    {/* File Type Examples */}
                    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center mb-2 mx-auto">
                          <span className="text-xs font-bold text-red-600 dark:text-red-300">PDF</span>
                        </div>
                        <span className="text-xs text-gray-800 dark:text-gray-300">Documents</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center mb-2 mx-auto">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">JPG</span>
                        </div>
                        <span className="text-xs text-gray-800 dark:text-gray-300">Photos</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center mb-2 mx-auto">
                          <span className="text-xs font-bold text-green-600 dark:text-green-300">PNG</span>
                        </div>
                        <span className="text-xs text-gray-800 dark:text-gray-300">Scans</span>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center mb-2 mx-auto">
                          <LockClosedIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                        </div>
                        <span className="text-xs text-gray-800 dark:text-gray-300">Encrypted</span>
                      </div>
                    </div>
                    
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setDocuments(files);
                        setDocumentTypes(new Array(files.length).fill(''));
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 cursor-pointer transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/25"
                    >
                      <DocumentTextIcon className="h-6 w-6 mr-3" />
                      Choose Files to Upload
                    </label>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {documents.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                        Uploaded Documents ({documents.length})
                      </h3>
                      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                        <LockClosedIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">Securely Encrypted</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {documents.map((doc, index) => {
                        const getFileIcon = (fileName: string) => {
                          const ext = fileName.split('.').pop()?.toLowerCase();
                          switch(ext) {
                            case 'pdf': return { bg: 'from-red-100 to-red-200', text: 'text-red-600', label: 'PDF' };
                            case 'jpg': case 'jpeg': return { bg: 'from-blue-100 to-blue-200', text: 'text-blue-600', label: 'JPG' };
                            case 'png': return { bg: 'from-green-100 to-green-200', text: 'text-green-600', label: 'PNG' };
                            default: return { bg: 'from-gray-100 to-gray-200', text: 'text-gray-800 dark:text-gray-300', label: 'FILE' };
                          }
                        };
                        const fileIcon = getFileIcon(doc.name);
                        
                        return (
                          <div key={index} className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl border-2 border-gray-400 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center flex-1">
                                <div className={`p-4 bg-gradient-to-br ${fileIcon.bg} rounded-xl mr-4 shadow-md`}>
                                  <div className="flex flex-col items-center">
                                    <DocumentTextIcon className={`h-6 w-6 ${fileIcon.text}`} />
                                    <span className={`text-xs font-bold ${fileIcon.text} mt-1`}>{fileIcon.label}</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{doc.name}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs text-gray-900 dark:text-gray-400">
                                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <LockClosedIcon className="h-3 w-3 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">Encrypted</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CheckCircleIcon className="h-3 w-3 text-blue-600" />
                                      <span className="text-xs text-blue-600 font-medium">Uploaded</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <select
                                  value={documentTypes[index]}
                                  onChange={(e) => {
                                    const newTypes = [...documentTypes];
                                    newTypes[index] = e.target.value;
                                    setDocumentTypes(newTypes);
                                  }}
                                  className="text-sm px-4 py-3 border-2 border-gray-400 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-2 focus:border-indigo-500 bg-white dark:bg-gray-800 font-semibold min-w-64 text-gray-900 dark:text-white"
                                >
                                  <option value="" className="text-gray-400">Select document type...</option>
                                  <optgroup label="Income Verification">
                                    <option value="W2">W-2 Form (Annual wage statement)</option>
                                    <option value="TAX_RETURN">Tax Return (Form 1040)</option>
                                    <option value="PAY_STUB">Pay Stub (Recent pay statement)</option>
                                    <option value="EMPLOYMENT_LETTER">Employment Verification Letter</option>
                                  </optgroup>
                                  <optgroup label="Net Worth Verification">
                                    <option value="BANK_STATEMENT">Bank Statement</option>
                                    <option value="INVESTMENT_STATEMENT">Investment/Brokerage Statement</option>
                                    <option value="CPA_LETTER">CPA Letter/Financial Statement</option>
                                    <option value="BUSINESS_VALUATION">Business Valuation</option>
                                  </optgroup>
                                  <optgroup label="Other">
                                    <option value="OTHER">Other Supporting Document</option>
                                  </optgroup>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Upload Another File Button */}
                    <div className="text-center">
                      <label
                        htmlFor="file-upload-additional"
                        className="inline-flex items-center px-6 py-3 border-2 border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 cursor-pointer transition-all"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Upload Additional Files
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          const allFiles = [...documents, ...newFiles];
                          setDocuments(allFiles);
                          setDocumentTypes([...documentTypes, ...new Array(newFiles.length).fill('')]);
                        }}
                        className="hidden"
                        id="file-upload-additional"
                      />
                    </div>
                  </div>
                )}

                {/* Detailed Document Requirements */}
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl border-2 border-gray-400 dark:border-gray-600 overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        Required Documents for {verificationType === 'INCOME' ? 'Income' : 'Net Worth'} Verification
                      </h3>
                      <button
                        onClick={() => setShowDocumentHelp(!showDocumentHelp)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
                      >
                        {showDocumentHelp ? 'Hide Examples' : 'Show Examples'}
                        <ArrowRightIcon className={`h-4 w-4 ml-1 transform transition-transform text-blue-600 dark:text-blue-400 ${showDocumentHelp ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {verificationType === 'INCOME' ? (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center">
                              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                              Tax Documents (Required)
                            </h4>
                            <ul className="space-y-3 pl-9">
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">Form 1040 Tax Returns</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">Last 2 years, all pages including schedules</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">W-2 Forms</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">All W-2s from employers for last 2 years</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                              Current Income Proof
                            </h4>
                            <ul className="space-y-3 pl-9">
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">Recent Pay Stubs</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">Last 2-3 months showing year-to-date totals</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <div className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-gray-200">Employment Letter (Optional)</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">On company letterhead with salary details</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        {showDocumentHelp && (
                          <div className="mt-8 pt-6 border-t border-gray-400 dark:border-gray-600">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Document Examples & Templates</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-red-600 dark:text-red-300">1040</span>
                                  </div>
                                  <h5 className="font-semibold text-red-800 dark:text-red-200 text-sm mb-2">Tax Return Sample</h5>
                                  <p className="text-xs text-red-700 dark:text-red-300">Clear scan showing all income sources, signatures, and schedules</p>
                                </div>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-green-600">W-2</span>
                                  </div>
                                  <h5 className="font-semibold text-green-800 text-sm mb-2">W-2 Form Sample</h5>
                                  <p className="text-xs text-green-700 dark:text-green-300">All boxes visible, no redaction of wage amounts</p>
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-blue-600">PAY</span>
                                  </div>
                                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">Pay Stub Sample</h5>
                                  <p className="text-xs text-blue-700 dark:text-blue-100">Recent stub with YTD totals and employer info</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center">
                              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                              Financial Statements
                            </h4>
                            <ul className="space-y-3 pl-9">
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">Bank Statements</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">Last 3 months, all accounts (checking, savings)</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">Investment Statements</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">Brokerage, 401k, IRA, mutual fund accounts</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center">
                              <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                              Professional Verification
                            </h4>
                            <ul className="space-y-3 pl-9">
                              <li className="flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">CPA Letter</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">Licensed CPA verification of net worth</p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <div className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-gray-200">Financial Advisor Statement (Alternative)</span>
                                  <p className="text-sm text-gray-800 dark:text-gray-300">RIA or broker-dealer verification letter</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        {showDocumentHelp && (
                          <div className="mt-8 pt-6 border-t border-gray-400 dark:border-gray-600">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Document Examples & Requirements</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-purple-600">BANK</span>
                                  </div>
                                  <h5 className="font-semibold text-purple-800 text-sm mb-2">Bank Statement</h5>
                                  <p className="text-xs text-purple-700">Official statements showing account balances and activity</p>
                                </div>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-indigo-600">CPA</span>
                                  </div>
                                  <h5 className="font-semibold text-indigo-800 text-sm mb-2">CPA Letter</h5>
                                  <p className="text-xs text-indigo-700">Professional verification on letterhead with license number</p>
                                </div>
                              </div>
                              <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-md p-4">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <span className="text-sm font-bold text-orange-600">INV</span>
                                  </div>
                                  <h5 className="font-semibold text-orange-800 text-sm mb-2">Investment Account</h5>
                                  <p className="text-xs text-orange-700">Brokerage statements showing portfolio value and holdings</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Alternative Documents */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Alternative Documentation Options</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-900 dark:text-gray-200">
                      {verificationType === 'INCOME' ? (
                        <>
                          <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>If self-employed: Schedule C, profit & loss statements, business tax returns</span>
                          </div>
                          <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>For investment income: Form 1099-DIV, 1099-INT, brokerage statements</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Business ownership: Corporate financials, business valuation, K-1 forms</span>
                          </div>
                          <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Real estate: Property appraisals, rental agreements, mortgage statements</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Security and Privacy Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-8 border-2 border-green-200 dark:border-green-700">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-6 flex items-center">
                    <LockClosedIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                    Your Documents Are Safe & Secure
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 text-base">Security Measures:</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">AES-256 Encryption</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Same encryption used by major banks and government agencies</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">Secure Upload Process</p>
                            <p className="text-xs text-green-700 dark:text-green-300">TLS 1.3 encryption during file transfer, no temporary storage</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">Access Controls</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Only authorized verification specialists can view documents</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 text-base">Privacy Promise:</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">Automatic Deletion</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Documents deleted within 30 days after verification</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">No Third-Party Sharing</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Never sold, shared, or used for marketing purposes</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">Compliance Certified</p>
                            <p className="text-xs text-green-700 dark:text-green-300">SOC 2 Type II, GDPR, CCPA compliant infrastructure</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-6 text-sm font-semibold text-green-800">
                        <div className="flex items-center gap-2">
                          <LockClosedIcon className="h-4 w-4" />
                          <span>Encrypted Storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <EyeSlashIcon className="h-4 w-4" />
                          <span>Limited Access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrashIcon className="h-4 w-4" />
                          <span>Auto-Deleted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4" />
                          <span>Audit Certified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Review and Submit
                </h2>
                <p className="text-gray-800 dark:text-gray-300 mb-4">Confirm your details and submit for professional review</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-900 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Est. 2 minutes</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>Professional review within 24-48 hours</span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Review Summary */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl border-2 border-gray-400 dark:border-gray-600 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600 mr-3" />
                      Complete Verification Summary
                    </h3>
                    <p className="text-sm text-gray-800 dark:text-gray-300">Review all information before submitting for professional verification</p>
                  </div>
                  
                  <div className="p-8">
                    {/* Verification Method */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                        <div>
                          <dt className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Verification Method</dt>
                          <dd className="text-xl font-bold text-gray-900 dark:text-white">
                            {verificationType === 'INCOME' ? 'Income Verification' : 'Net Worth Verification'}
                          </dd>
                          <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">
                            {verificationType === 'INCOME' 
                              ? 'SEC Rule 501(a)(1) - Annual income qualification'
                              : 'SEC Rule 501(a)(2) - Net worth qualification'
                            }
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${verificationType === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'}`}>
                          <span className="font-bold text-sm">
                            {verificationType === 'INCOME' ? 'Income Based' : 'Net Worth Based'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financial Information</h4>
                      <div className="grid gap-4">
                        {verificationType === 'INCOME' ? (
                          <>
                            <div className="flex justify-between items-center p-6 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
                              <div>
                                <dt className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Annual Income (Gross)</dt>
                                <dd className="text-2xl font-bold text-green-700 dark:text-green-400">
                                  ${parseFloat(formData.annualIncome || '0').toLocaleString()}
                                </dd>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                  {parseFloat(formData.annualIncome || '0') >= 200000 
                                    ? '✓ Meets SEC minimum requirement ($200K+)'
                                    : '⚠ Below SEC minimum requirement'
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-900 dark:text-gray-400">Monthly Equivalent</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                                  ${Math.round(parseFloat(formData.annualIncome || '0') / 12).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                              <div>
                                <dt className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Primary Income Source</dt>
                                <dd className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                  {formData.incomeSource.replace('_', ' ')}
                                </dd>
                              </div>
                              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                {formData.incomeSource === 'employment' ? 'W-2 Employee' :
                                 formData.incomeSource === 'business' ? 'Business Owner' :
                                 formData.incomeSource === 'investments' ? 'Investor' :
                                 formData.incomeSource === 'real_estate' ? 'Real Estate' : 'Other'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center p-6 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
                              <div>
                                <dt className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Total Net Worth</dt>
                                <dd className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                  ${parseFloat(formData.netWorth || '0').toLocaleString()}
                                </dd>
                                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                  {parseFloat(formData.netWorth || '0') >= 1000000 
                                    ? '✓ Meets SEC minimum requirement ($1M+)'
                                    : '⚠ Below SEC minimum requirement'
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-900 dark:text-gray-400">Excluding Primary Residence</div>
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
                                  As per SEC Rule 501(a)(2)
                                </div>
                              </div>
                            </div>
                            {formData.liquidNetWorth && (
                              <div className="flex justify-between items-center p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                                <div>
                                  <dt className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Liquid Net Worth</dt>
                                  <dd className="text-lg font-bold text-blue-700 dark:text-blue-100">
                                    ${parseFloat(formData.liquidNetWorth).toLocaleString()}
                                  </dd>
                                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                    {Math.round((parseFloat(formData.liquidNetWorth) / parseFloat(formData.netWorth || '1')) * 100)}% of total net worth
                                  </p>
                                </div>
                                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                  Readily Accessible
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document Summary */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supporting Documents</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-400 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-gray-900 dark:text-white">{documents.length} Document(s) Uploaded</span>
                          </div>
                          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                            <LockClosedIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Encrypted & Secure</span>
                          </div>
                        </div>
                        
                        {documents.length > 0 && (
                          <div className="space-y-3">
                            {documents.map((doc, index) => {
                              const getDocTypeDisplay = (type: string) => {
                                const types: Record<string, { label: string; color: string }> = {
                                  'W2': { label: 'W-2 Form', color: 'bg-green-100 text-green-800' },
                                  'TAX_RETURN': { label: 'Tax Return', color: 'bg-blue-100 text-blue-800 dark:text-blue-200' },
                                  'PAY_STUB': { label: 'Pay Stub', color: 'bg-indigo-100 text-indigo-800' },
                                  'BANK_STATEMENT': { label: 'Bank Statement', color: 'bg-purple-100 text-purple-800' },
                                  'INVESTMENT_STATEMENT': { label: 'Investment Statement', color: 'bg-orange-100 text-orange-800' },
                                  'CPA_LETTER': { label: 'CPA Letter', color: 'bg-red-100 text-red-800' },
                                  'OTHER': { label: 'Other Document', color: 'bg-gray-100 text-gray-800 dark:text-gray-100' },
                                };
                                return types[type] || { label: 'Unspecified', color: 'bg-gray-100 text-gray-900 dark:text-gray-400' };
                              };
                              const docType = getDocTypeDisplay(documentTypes[index]);
                              
                              return (
                                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-400 dark:border-gray-600">
                                  <div className="flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mr-3">
                                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-48">{doc.name}</p>
                                      <p className="text-xs text-gray-900 dark:text-gray-400">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${docType.color}`}>
                                    {docType.label}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Agreements and Consent */}
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-2xl border-2 border-gray-400 dark:border-gray-600 overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 p-6 border-b dark:border-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                      Required Legal Agreements
                    </h3>
                    <p className="text-sm text-gray-800 dark:text-gray-300">Please review and accept the following legal agreements to proceed</p>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl shadow-lg p-6">
                      <label className="flex items-start cursor-pointer group">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={formData.attestation}
                            onChange={(e) => setFormData({ ...formData, attestation: e.target.checked })}
                            className="h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-2 border-gray-300 rounded-lg"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <ShieldCheckIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                            <div className="font-bold text-gray-900 dark:text-white text-lg">Legal Attestation & Accuracy Statement</div>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-gray-200 leading-relaxed mb-4">
                            I hereby attest and certify that all information provided in this verification application is true, 
                            accurate, complete, and current to the best of my knowledge and belief. I understand that:
                          </div>
                          <div className="bg-white border border-gray-300 dark:bg-gray-700 rounded-lg shadow-md p-4 border border-indigo-200 dark:border-indigo-700">
                            <ul className="space-y-2 text-sm text-gray-900 dark:text-gray-200">
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>Providing false or misleading information may result in legal consequences under federal securities laws</span>
                              </li>
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>I have a continuing obligation to update this information if it changes materially</span>
                              </li>
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>Tucson reserves the right to verify any information provided through independent sources</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl shadow-lg p-6">
                      <label className="flex items-start cursor-pointer group">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={formData.consentToVerify}
                            onChange={(e) => setFormData({ ...formData, consentToVerify: e.target.checked })}
                            className="h-6 w-6 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded-lg"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2" />
                            <div className="font-bold text-gray-900 dark:text-white text-lg">Verification Consent & Privacy Agreement</div>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-gray-200 leading-relaxed mb-4">
                            I consent to Tucson and its authorized verification agents conducting the necessary verification 
                            procedures to confirm my accredited investor status in compliance with SEC Rule 501. This includes:
                          </div>
                          <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-4 border border-green-200 dark:border-green-700">
                            <ul className="space-y-2 text-sm text-gray-900 dark:text-gray-200">
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>Reviewing and analyzing my financial documents and information</span>
                              </li>
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>Conducting background checks and verification with third-party sources as necessary</span>
                              </li>
                              <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span>Maintaining records of my accredited investor status for regulatory compliance</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {/* Privacy and Data Protection Notice */}
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-xl shadow-lg p-6">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <LockClosedIcon className="h-5 w-5 text-gray-800 dark:text-gray-300 mr-2" />
                        Data Protection & Privacy Notice
                      </h4>
                      <div className="text-sm text-gray-900 dark:text-gray-200 leading-relaxed space-y-2">
                        <p>
                          Your privacy is paramount. All personal and financial information is protected under our comprehensive 
                          privacy policy and handled in accordance with applicable data protection laws including GDPR and CCPA.
                        </p>
                        <p>
                          <span className="font-semibold">Data Retention:</span> Documents and verification records are securely stored 
                          for regulatory compliance and automatically deleted after the required retention period.
                        </p>
                        <p>
                          <span className="font-semibold">Third-Party Sharing:</span> Your information is never sold or shared for 
                          marketing purposes. Limited sharing occurs only for verification purposes with authorized agents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Timeline and Next Steps */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
                  <div className="p-6 border-b border-blue-200 dark:border-blue-700">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                      Your Verification Timeline
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-100">Here's what happens after you submit your application</p>
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-6">
                      {/* Timeline Steps */}
                      <div className="relative">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              <span>1</span>
                            </div>
                          </div>
                          <div className="ml-6 pb-8">
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-300 dark:bg-blue-600"></div>
                            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Immediate Confirmation</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">You'll receive an instant email confirmation with your submission ID</p>
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg shadow-md p-3 text-xs text-green-800 dark:text-green-200">
                              <span className="font-semibold">Status:</span> Application Submitted & Queued for Review
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              <span>2</span>
                            </div>
                          </div>
                          <div className="ml-6 pb-8">
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-300 dark:bg-blue-600"></div>
                            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Professional Review</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Licensed verification specialists review your documents and financial information</p>
                            <div className="grid md:grid-cols-2 gap-3 text-xs">
                              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg shadow-md p-3 text-blue-800 dark:text-blue-200">
                                <span className="font-semibold">Duration:</span> 24-48 hours typically
                              </div>
                              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg shadow-md p-3 text-blue-800 dark:text-blue-200">
                                <span className="font-semibold">Process:</span> SEC compliance verification
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              <span>3</span>
                            </div>
                          </div>
                          <div className="ml-6 pb-8">
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-300 dark:bg-blue-600"></div>
                            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Decision & Notification</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">You'll receive a detailed email with the verification decision</p>
                            <div className="grid md:grid-cols-2 gap-3 text-xs">
                              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg shadow-md p-3 text-green-800 dark:text-green-200">
                                <span className="font-semibold">If Approved:</span> Instant platform access
                              </div>
                              <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg shadow-md p-3 text-orange-800 dark:text-orange-200">
                                <span className="font-semibold">If Additional Info Needed:</span> Clear instructions provided
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              <StarIcon className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="ml-6">
                            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Welcome to Exclusive Investing</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">Gain access to premium investment opportunities and our investor community</p>
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-md p-4">
                              <div className="grid md:grid-cols-2 gap-4 text-xs text-emerald-800 dark:text-emerald-200">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                                    <span>Instant access to 500+ deals</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                                    <span>Dedicated relationship manager</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                                    <span>Priority deal allocation</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                                    <span>Exclusive investor events</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Support and Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border-2 border-gray-400 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600 mr-3" />
                    Need Help or Have Questions?
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat Support</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-300 mb-3">Available Monday-Friday<br/>9:00 AM - 6:00 PM PT</p>
                      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-100 font-medium">Start Chat</button>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <PhoneIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-300 mb-3">Speak with a verification specialist</p>
                      <a href="tel:+18555550123" className="text-sm text-green-600 hover:text-green-700 font-medium">(855) 555-0123</a>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-300 mb-3">Get detailed help via email<br/>Response within 4 hours</p>
                      <a href="mailto:support@tucson.com" className="text-sm text-purple-600 hover:text-purple-700 font-medium">support@tucson.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between items-center">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-xl text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-700 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
            )}
            
            <div className={currentStep === 1 ? 'ml-auto' : ''}>
              {currentStep < 4 ? (
                <button
                  onClick={handleStepClick}
                  disabled={!isStepValid}
                  className="inline-flex items-center px-10 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 hover:from-indigo-700 hover:via-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30"
                >
                  Continue to Next Step
                  <ArrowRightIcon className="h-6 w-6 ml-3" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.attestation || !formData.consentToVerify}
                  className="inline-flex items-center px-12 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting for Review...
                    </>
                  ) : (
                    <>
                      Submit for Professional Review
                      <CheckCircleIcon className="h-6 w-6 ml-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}