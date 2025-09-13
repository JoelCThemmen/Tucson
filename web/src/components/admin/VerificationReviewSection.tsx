import React, { useState, useEffect } from 'react';
import {
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/api';
import { format } from 'date-fns';
import VerificationDetailModal from './VerificationDetailModal';

interface Verification {
  id: string;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  verificationType: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  annualIncome?: number;
  netWorth?: number;
  documents: any[];
}

const VerificationReviewSection: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchVerifications();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.search) params.search = filters.search;

      const response = await adminService.getVerifications(params);
      setVerifications(response.data.verifications);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminService.getVerificationStats();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleBulkAction = async (action: string, notes?: string) => {
    if (selectedItems.length === 0) {
      alert('Please select verifications to perform bulk action');
      return;
    }

    try {
      setLoading(true);
      await adminService.batchReviewVerifications({
        verificationIds: selectedItems,
        status: action,
        notes,
      });
      
      setSelectedItems([]);
      await fetchVerifications();
      await fetchStatistics();
      alert(`${selectedItems.length} verifications ${action.toLowerCase()} successfully`);
    } catch (error: any) {
      console.error('Error with bulk action:', error);
      alert(error.response?.data?.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      IN_REVIEW: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      EXPIRED: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    };

    const icons = {
      PENDING: <ClockIcon className="h-4 w-4" />,
      IN_REVIEW: <DocumentMagnifyingGlassIcon className="h-4 w-4" />,
      APPROVED: <CheckCircleIcon className="h-4 w-4" />,
      REJECTED: <XCircleIcon className="h-4 w-4" />,
      EXPIRED: <ExclamationTriangleIcon className="h-4 w-4" />,
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      INCOME: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      NET_WORTH: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      PROFESSIONAL: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
      ENTITY: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${styles[type as keyof typeof styles] || styles.INCOME}`}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
              <p className="text-sm text-gray-800 dark:text-gray-400">Total</p>
            </div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
              <p className="text-sm text-gray-800 dark:text-gray-400">Pending</p>
            </div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statistics.inReview}</p>
              <p className="text-sm text-gray-800 dark:text-gray-400">In Review</p>
            </div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
              <p className="text-sm text-gray-800 dark:text-gray-400">Approved</p>
            </div>
          </div>
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              <p className="text-sm text-gray-800 dark:text-gray-400">Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="INCOME">Income</option>
              <option value="NET_WORTH">Net Worth</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTITY">Entity</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end space-x-2">
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('APPROVED')}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Approve ({selectedItems.length})
                </button>
                <button
                  onClick={() => handleBulkAction('REJECTED')}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Reject ({selectedItems.length})
                </button>
              </>
            )}
            <button
              onClick={fetchVerifications}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              <FunnelIcon className="h-4 w-4 inline mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg border border-gray-400 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-400 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verification Requests</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === verifications.length && verifications.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(verifications.map(v => v.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white border border-gray-300 dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                {verifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(verification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, verification.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== verification.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {verification.user.firstName && verification.user.lastName
                            ? `${verification.user.firstName} ${verification.user.lastName}`
                            : verification.user.email
                          }
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-400">{verification.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(verification.verificationType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(verification.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {verification.annualIncome 
                        ? `$${verification.annualIncome.toLocaleString()}`
                        : verification.netWorth
                        ? `$${verification.netWorth.toLocaleString()}`
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                      {verification.documents.length} docs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                      {format(new Date(verification.submittedAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 px-4 py-3 border-t border-gray-400 dark:border-gray-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-900 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <VerificationDetailModal
          verification={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onStatusUpdate={() => {
            setSelectedVerification(null);
            fetchVerifications();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
};

export default VerificationReviewSection;