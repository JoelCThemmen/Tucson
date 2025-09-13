import React, { useState } from 'react';
import { UserGroupIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUserProfile } from '../hooks/useUserProfile';
import UserManagementSection from '../components/admin/UserManagementSection';
import VerificationReviewSection from '../components/admin/VerificationReviewSection';

type TabType = 'users' | 'verifications';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { isAdmin, profile, loading } = useUserProfile();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-800 dark:text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'users' as TabType,
      name: 'User Management',
      icon: UserGroupIcon,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'verifications' as TabType,
      name: 'Verification Review',
      icon: DocumentMagnifyingGlassIcon,
      description: 'Review and approve investor verifications'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-800 dark:text-gray-300">Manage users and review verification requests</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md border border-gray-400 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-400 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium hover:text-gray-900 dark:hover:text-gray-300 focus:z-10 focus:outline-none
                      ${isActive 
                        ? 'text-primary-600 border-b-2 border-primary-600' 
                        : 'text-gray-900 dark:text-gray-400 border-b-2 border-transparent hover:border-gray-400 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <tab.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span>{tab.name}</span>
                    </div>
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-400 dark:border-gray-600">
            <p className="text-sm text-gray-800 dark:text-gray-300">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md">
          {activeTab === 'users' && (
            <div className="p-6">
              <UserManagementSection />
            </div>
          )}
          
          {activeTab === 'verifications' && (
            <div className="p-6">
              <VerificationReviewSection />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;