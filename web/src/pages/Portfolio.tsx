import React from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  BanknotesIcon, 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  ClockIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Portfolio: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Portfolio</h1>
          <p className="text-gray-800 dark:text-gray-300">Track and manage your investment portfolio</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white border-2 border-gray-400 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
            <ChartBarIcon className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Management Coming Soon
          </h2>
          
          <p className="text-gray-800 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            We're building powerful portfolio management tools to help you track your investments, 
            analyze performance, and make informed decisions.
          </p>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Tracking</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Real-time portfolio valuation and performance metrics
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Asset Allocation</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Visualize and optimize your investment distribution
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <PresentationChartLineIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Deep insights with professional-grade analytics tools
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <BanknotesIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dividend Tracking</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Monitor and forecast dividend income streams
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <ClockIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Historical Data</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Access comprehensive historical performance data
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <LockClosedIcon className="h-8 w-8 text-red-600 dark:text-red-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Bank-level security for your portfolio data
              </p>
            </div>
          </div>

          {/* Beta Access */}
          <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-md p-6 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚀 Join the Beta
            </h3>
            <p className="text-gray-800 dark:text-gray-300 mb-4">
              Be among the first to access our portfolio management tools when they launch.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              Get Early Access
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;