import React from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  NewspaperIcon,
  BellAlertIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Markets: React.FC = () => {
  // Mock data for market preview
  const marketIndices = [
    { name: 'S&P 500', value: '4,783.45', change: '+1.23%', trending: 'up' },
    { name: 'NASDAQ', value: '15,123.67', change: '+2.15%', trending: 'up' },
    { name: 'DOW JONES', value: '38,456.12', change: '-0.45%', trending: 'down' },
    { name: 'RUSSELL 2000', value: '2,067.89', change: '+0.78%', trending: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Markets</h1>
          <p className="text-gray-800 dark:text-gray-300">Real-time market data and analysis</p>
        </div>

        {/* Market Indices Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {marketIndices.map((index, i) => (
            <div key={i} className="bg-white border-2 border-gray-400 dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-400">{index.name}</span>
                {index.trending === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{index.value}</span>
                <span className={`text-sm font-semibold ${
                  index.trending === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {index.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white border-2 border-gray-400 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
            <ChartBarIcon className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Market Analytics Coming Soon
          </h2>
          
          <p className="text-gray-800 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Get comprehensive market insights, real-time data feeds, and professional-grade analysis tools 
            to make informed investment decisions.
          </p>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <GlobeAltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Global Markets</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Access to international markets and exchanges worldwide
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <NewspaperIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Market News</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Real-time news and analysis from trusted sources
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <ChartPieIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sector Analysis</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Deep dive into sector performance and trends
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <BellAlertIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Price Alerts</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Custom alerts for price movements and market events
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <FireIcon className="h-8 w-8 text-red-600 dark:text-red-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trending Stocks</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Discover trending and high-momentum securities
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">After Hours</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Extended hours trading data and analysis
              </p>
            </div>
          </div>

          {/* Market Data Sources */}
          <div className="mt-12 bg-green-50 dark:bg-green-900/30 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📊 Professional Data Feeds
            </h3>
            <p className="text-gray-800 dark:text-gray-300 mb-4">
              Powered by institutional-grade data providers for accuracy and reliability.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
              Request Early Access
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;