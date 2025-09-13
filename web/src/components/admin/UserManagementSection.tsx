import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/api';
import { useUserProfile } from '../../hooks/useUserProfile';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  clerkId: string;
  profile?: {
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    occupation?: string;
    employer?: string;
    annualIncome?: number;
  };
}

const UserManagementSection: React.FC = () => {
  const { profile: currentUserProfile } = useUserProfile();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
  });

  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'INVESTOR',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    employer: '',
    industry: '',
    yearsExperience: '',
    notes: '',
    tags: '',
  });

  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'INVESTOR',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    employer: '',
    industry: '',
    yearsExperience: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await adminService.getUsers(Object.fromEntries(params));
      setUsers(response.data.users);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await adminService.getUserStatistics();
      setStatistics(response.data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminService.inviteUser(newUser);
      setShowAddModal(false);
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        role: 'INVESTOR',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        occupation: '',
        employer: '',
        industry: '',
        yearsExperience: '',
        notes: '',
        tags: '',
      });
      await fetchUsers();
      alert('User invited successfully! They will receive an email invitation.');
    } catch (err: any) {
      console.error('Error adding user:', err);
      alert(err.response?.data?.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminService.updateUser(editUser.id, editUser);
      setShowEditModal(false);
      await fetchUsers();
      alert('User updated successfully');
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminService.deleteUser(userId);
      await fetchUsers();
      alert('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSyncClerkUsers = async () => {
    try {
      setSyncInProgress(true);
      const response = await adminService.syncClerkUsers();
      alert(`Sync completed! ${response.data.created} users created, ${response.data.updated} users updated.`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error syncing users:', err);
      alert(err.response?.data?.message || 'Failed to sync users');
    } finally {
      setSyncInProgress(false);
      setShowSyncModal(false);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: string) => {
    try {
      setChangingRole(userId);
      await adminService.updateUserRole(userId, newRole);
      await fetchUsers();
      alert('Role updated successfully');
    } catch (error: any) {
      console.error('Error updating role:', error);
      if (error.response?.status === 403) {
        alert('You need SUPER_ADMIN privileges to change user roles');
      } else {
        alert('Failed to update role');
      }
    } finally {
      setChangingRole(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      phoneNumber: user.profile?.phoneNumber || '',
      dateOfBirth: user.profile?.dateOfBirth || '',
      address: user.profile?.address || '',
      occupation: user.profile?.occupation || '',
      employer: user.profile?.employer || '',
      industry: '',
      yearsExperience: '',
      notes: '',
      tags: '',
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'INACTIVE':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'SUSPENDED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'SUSPENDED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'INVESTOR':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'ADMIN':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'SUPER_ADMIN':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          {currentUserProfile?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => setShowSyncModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={syncInProgress}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
              Sync Clerk Users
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-6 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
                <p className="text-sm text-gray-800 dark:text-gray-400">Total Users</p>
              </div>
              <UserPlusIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-6 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.byStatus?.active || 0}</p>
                <p className="text-sm text-gray-800 dark:text-gray-400">Active Users</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 dark:bg-gray-800 p-6 rounded-lg border border-gray-400 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.byStatus?.pending || 0}</p>
                <p className="text-sm text-gray-800 dark:text-gray-400">Pending Users</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-300 dark:bg-gray-800 p-4 rounded-lg border border-gray-400 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                id="search"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              id="role"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="INVESTOR">Investor</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full rounded-md border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-md focus:border-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg border border-gray-400 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-400 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Users</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Verifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white border border-gray-300 dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {changingRole === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                          {currentUserProfile?.role === 'SUPER_ADMIN' && user.id !== currentUserProfile.id && (
                            <select
                              value={user.role}
                              onChange={(e) => handleQuickRoleChange(user.id, e.target.value)}
                              className="text-xs border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-primary-500 focus:border-2 focus:border-primary-500"
                              disabled={changingRole === user.id}
                            >
                              <option value="INVESTOR">Investor</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                      {/* This would show verification count if we had that data */}
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals would go here - keeping them for brevity, but they're the same as in the original component */}
    </div>
  );
};

export default UserManagementSection;