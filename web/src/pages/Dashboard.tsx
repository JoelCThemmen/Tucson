import { useUser } from '../hooks/useAuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { healthCheck, api } from '../services/api';

// Mock data - replace with actual API calls
const portfolioMetrics = {
  totalValue: 2456789.32,
  dayChange: 12543.21,
  dayChangePercent: 0.51,
  weekChange: 45678.90,
  weekChangePercent: 1.89,
  monthChange: 134567.89,
  monthChangePercent: 5.80,
};

const holdings = [
  { name: 'Tech Growth Fund', value: 524780, change: 2.34, allocation: 21.3 },
  { name: 'Real Estate Trust', value: 412350, change: -0.87, allocation: 16.8 },
  { name: 'Energy Sector ETF', value: 387920, change: 3.12, allocation: 15.8 },
  { name: 'Healthcare Innovation', value: 298450, change: 1.45, allocation: 12.2 },
  { name: 'International Bonds', value: 276890, change: 0.23, allocation: 11.3 },
];

const recentActivity = [
  { type: 'buy', asset: 'AAPL', amount: 5000, time: '2 hours ago' },
  { type: 'sell', asset: 'GOOGL', amount: 3200, time: '5 hours ago' },
  { type: 'dividend', asset: 'MSFT', amount: 450, time: '1 day ago' },
  { type: 'buy', asset: 'TSLA', amount: 8900, time: '2 days ago' },
];

const marketInsights = [
  { title: 'Fed Announces Rate Decision', category: 'Economy', time: '30 min ago', trending: true },
  { title: 'Tech Stocks Rally on AI News', category: 'Technology', time: '2 hours ago', trending: true },
  { title: 'Oil Prices Surge 5%', category: 'Commodities', time: '4 hours ago', trending: false },
];

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [chartData, setChartData] = useState<number[]>([]);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [verificationStatus, setVerificationStatus] = useState<{
    isAccredited: boolean;
    hasPendingVerification: boolean;
  } | null>(null);

  useEffect(() => {
    checkApiHealth();
    checkVerificationStatus();
    // Generate mock chart data
    const data = Array.from({ length: 20 }, () => Math.random() * 100 + 50);
    setChartData(data);
  }, [selectedPeriod]);

  const checkApiHealth = async () => {
    try {
      await healthCheck();
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await api.get('/verification/status');
      const data = response.data.data;
      setVerificationStatus({
        isAccredited: data.isAccredited,
        hasPendingVerification: data.currentVerification?.status === 'PENDING' || 
                               data.currentVerification?.status === 'IN_REVIEW',
      });
    } catch (error) {
      // If error, assume not verified
      setVerificationStatus({ isAccredited: false, hasPendingVerification: false });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const periodMetrics = {
    day: { change: portfolioMetrics.dayChange, percent: portfolioMetrics.dayChangePercent },
    week: { change: portfolioMetrics.weekChange, percent: portfolioMetrics.weekChangePercent },
    month: { change: portfolioMetrics.monthChange, percent: portfolioMetrics.monthChangePercent },
  };

  const currentMetrics = periodMetrics[selectedPeriod];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-300 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-700 shadow-md rounded-lg mb-8">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName || 'Investor'}
              </h1>
              <p className="text-gray-900 dark:text-gray-300 mt-1">
                Here's your portfolio performance at a glance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  apiStatus === 'online' ? 'bg-success-500' : 
                  apiStatus === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                } animate-pulse`} />
                <span className="text-sm text-gray-900 dark:text-gray-300">
                  API {apiStatus === 'checking' ? 'Checking...' : apiStatus}
                </span>
              </div>
              <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-900 dark:text-white shadow-md">
                Export Report
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all text-sm font-medium shadow-md">
                New Investment
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content - Remove duplicate container */}
        {/* Verification Prompt */}
        {verificationStatus && !verificationStatus.isAccredited && !verificationStatus.hasPendingVerification && (
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-warning-900/20 dark:to-warning-800/20 border border-amber-400 dark:border-warning-700 rounded-xl shadow-lg p-6 mb-8 animate-fade-in shadow-md">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-700 dark:text-warning-400 mr-4 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-warning-100 mb-2">
                  Complete Your Accredited Investor Verification
                </h3>
                <p className="text-sm text-amber-800 dark:text-warning-200 mb-4">
                  Unlock access to exclusive investment opportunities by verifying your accredited investor status. 
                  This process is required by SEC regulations for certain investment types.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/verification')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-warning-600 hover:bg-warning-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500"
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Start Verification
                  </button>
                  <button
                    onClick={() => navigate('/verification/status')}
                    className="text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-warning-300 dark:hover:text-warning-200"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Verification Notice */}
        {verificationStatus?.hasPendingVerification && (
          <div className="bg-blue-100 dark:bg-info-900/20 border border-blue-400 dark:border-info-600 rounded-xl shadow-lg p-6 mb-8 animate-fade-in shadow-md">
            <div className="flex items-start">
              <ClockIcon className="h-6 w-6 text-blue-700 mr-4 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-info-100 mb-2">
                  Verification In Progress
                </h3>
                <p className="text-sm text-blue-800 dark:text-info-200 mb-4">
                  Your accredited investor verification is being reviewed. This typically takes 24-72 hours.
                </p>
                <button
                  onClick={() => navigate('/verification/status')}
                  className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-info-300 dark:hover:text-info-200"
                >
                  Check Status
                  <ArrowUpIcon className="h-4 w-4 ml-1 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verified Badge */}
        {verificationStatus?.isAccredited && (
          <div className="bg-green-100 dark:bg-success-900/20 border border-green-400 dark:border-success-600 rounded-xl shadow-lg p-4 mb-8 animate-fade-in shadow-md">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-green-700 mr-3" />
              <p className="text-sm font-medium text-green-800 dark:text-success-200">
                You are a verified accredited investor • Full access to all investment opportunities
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Value Card */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-2">Total Portfolio Value</p>
              <h2 className="text-5xl font-bold">{formatCurrency(portfolioMetrics.totalValue)}</h2>
            </div>
            <BriefcaseIcon className="h-12 w-12 text-primary-300" />
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-white/20 text-white'
                    : 'text-primary-200 hover:bg-white/10'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Change Metrics */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {currentMetrics.change >= 0 ? (
                <ArrowUpIcon className="h-5 w-5 text-success-400" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-red-400" />
              )}
              <span className="text-2xl font-semibold">
                {formatCurrency(Math.abs(currentMetrics.change))}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full ${
              currentMetrics.percent >= 0 
                ? 'bg-success-500/20 text-success-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {currentMetrics.percent >= 0 ? '+' : ''}{currentMetrics.percent.toFixed(2)}%
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-6 h-24 flex items-end gap-1">
            {chartData.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-white/20 rounded-t transition-all hover:bg-white/30"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today\'s Gain', value: '+2.34%', icon: ArrowTrendingUpIcon, color: 'text-green-700' },
            { label: 'Available Cash', value: '$45,678', icon: BanknotesIcon, color: 'text-primary-600' },
            { label: 'Active Positions', value: '12', icon: ChartBarIcon, color: 'text-purple-600' },
            { label: 'Network Rank', value: '#234', icon: UserGroupIcon, color: 'text-amber-600' },
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-400 dark:border-gray-700 shadow-md hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-900 dark:text-gray-300 font-medium">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md">
              <div className="p-6 border-b border-gray-400 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Holdings</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {holdings.map((holding, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-400 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{holding.name}</h4>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(holding.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-900 dark:text-gray-300 font-medium">
                              {holding.allocation}% of portfolio
                            </span>
                            <span className={`text-sm font-medium ${
                              holding.change >= 0 ? 'text-green-700' : 'text-red-600'
                            }`}>
                              {holding.change >= 0 ? '+' : ''}{holding.change}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Insights */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md">
              <div className="p-6 border-b border-gray-400 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'buy' ? 'bg-green-200 dark:bg-green-900/30' :
                          activity.type === 'sell' ? 'bg-red-200 dark:bg-red-900/30' :
                          'bg-blue-200 dark:bg-blue-900/30'
                        }`}>
                          {activity.type === 'buy' ? (
                            <ArrowDownIcon className="h-5 w-5 text-green-700" />
                          ) : activity.type === 'sell' ? (
                            <ArrowUpIcon className="h-5 w-5 text-red-600" />
                          ) : (
                            <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.type === 'buy' ? 'Bought' : 
                             activity.type === 'sell' ? 'Sold' : 'Dividend'} {activity.asset}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-300">{activity.time}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {activity.type === 'dividend' ? '+' : ''}{formatCurrency(activity.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md">
              <div className="p-6 border-b border-gray-400 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Insights</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {marketInsights.map((insight, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {insight.trending && (
                            <BoltIcon className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-900 dark:text-gray-400 font-medium">{insight.category}</span>
                            <span className="text-xs text-gray-800 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-900 dark:text-gray-400">{insight.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}