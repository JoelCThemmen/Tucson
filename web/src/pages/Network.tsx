import React from 'react';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  UsersIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  SparklesIcon,
  TrophyIcon,
  HandRaisedIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const Network: React.FC = () => {
  // Mock data for network stats
  const networkStats = [
    { label: 'Active Investors', value: '50,000+', icon: UsersIcon },
    { label: 'Investment Firms', value: '500+', icon: BuildingOfficeIcon },
    { label: 'Countries', value: '45', icon: GlobeAltIcon },
    { label: 'Deals Closed', value: '$2.5B+', icon: TrophyIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Network</h1>
          <p className="text-gray-800 dark:text-gray-300">Connect with investors and opportunities</p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {networkStats.map((stat, i) => (
            <div key={i} className="bg-white border-2 border-gray-400 dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white border-2 border-gray-400 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6">
            <UserGroupIcon className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Investor Network Launching Soon
          </h2>
          
          <p className="text-gray-800 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Join an exclusive community of accredited investors, entrepreneurs, and industry leaders. 
            Build valuable connections and discover unique investment opportunities.
          </p>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Private Forums</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Exclusive discussion forums for verified investors
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <HandRaisedIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deal Flow</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Access to curated investment opportunities
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <AcademicCapIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Insights</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Learn from successful investors and industry experts
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <LightBulbIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Startup Showcase</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Discover and connect with innovative startups
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <SparklesIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Virtual Events</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Exclusive webinars and networking events
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md p-6">
              <TrophyIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Success Stories</h3>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                Learn from successful investment case studies
              </p>
            </div>
          </div>

          {/* Community Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-md p-6 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🤝 Syndicate Deals
              </h3>
              <p className="text-gray-800 dark:text-gray-300">
                Partner with other investors to access larger opportunities and share due diligence.
              </p>
            </div>
            
            <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg shadow-md p-6 border border-pink-200 dark:border-pink-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                💡 Mentorship Program
              </h3>
              <p className="text-gray-800 dark:text-gray-300">
                Connect with experienced investors who can guide your investment journey.
              </p>
            </div>
          </div>

          {/* Join Waitlist */}
          <div className="mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">
              Join the Waitlist
            </button>
            <p className="text-sm text-gray-900 dark:text-gray-400 mt-4">
              Be the first to know when our network launches
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Network;