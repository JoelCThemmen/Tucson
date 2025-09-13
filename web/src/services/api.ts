import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Store the getToken function
let getTokenFunction: (() => Promise<string | null>) | null = null;

// Function to set the auth token getter
export const setAuthTokenGetter = (getToken: () => Promise<string | null>) => {
  getTokenFunction = getToken;
};

// Add request interceptor to add fresh token before each request
api.interceptors.request.use(
  async (config) => {
    if (getTokenFunction) {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to sign in
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// User service
export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (avatarUrl: string) => {
    const response = await api.post('/users/avatar', { avatarUrl });
    return response.data;
  },

  // Get preferences
  getPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  // Update preferences
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },
};

// Admin service
export const adminService = {
  // Get all users
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user statistics
  getUserStatistics: async () => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },

  // Invite user
  inviteUser: async (userData: any) => {
    const response = await api.post('/admin/users/invite', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Update user role (requires SUPER_ADMIN)
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get invitations
  getInvitations: async () => {
    const response = await api.get('/admin/invitations');
    return response.data;
  },

  // Revoke invitation
  revokeInvitation: async (invitationId: string) => {
    const response = await api.post(`/admin/invitations/${invitationId}/revoke`);
    return response.data;
  },

  // Sync Clerk users to database
  syncClerkUsers: async () => {
    const response = await api.post('/admin/users/sync-clerk');
    return response.data;
  },

  // Get verifications
  getVerifications: async (params?: any) => {
    const response = await api.get('/admin/verifications', { params });
    return response.data;
  },

  // Get verification statistics
  getVerificationStats: async () => {
    const response = await api.get('/admin/verifications/stats');
    return response.data;
  },

  // Get single verification details
  getVerificationDetail: async (verificationId: string) => {
    const response = await api.get(`/admin/verifications/${verificationId}`);
    return response.data;
  },

  // Review verification (approve/reject)
  reviewVerification: async (verificationId: string, data: any) => {
    const response = await api.put(`/admin/verifications/${verificationId}/review`, data);
    return response.data;
  },

  // Batch review verifications
  batchReviewVerifications: async (data: any) => {
    const response = await api.post('/admin/verifications/batch-review', data);
    return response.data;
  },

  // Get document
  getVerificationDocument: async (verificationId: string, documentId: string) => {
    const response = await api.get(`/admin/verifications/${verificationId}/documents/${documentId}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health/check');
  return response.data;
};

export { api };
export default api;