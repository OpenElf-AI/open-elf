import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // 暂时禁用登录重定向用于开发测试
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('admin_token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (phoneOrEmail: string, code: string) => 
    api.post('/auth/login-with-code', { phoneOrEmail, code }),
  sendCode: (phone: string) => 
    api.post('/auth/send-code', { phone, type: 'admin' }),
};

export const adminApi = {
  login: (username: string, password: string) => 
    api.post('/admin/login', { username, password }),
  create: (data: any) => 
    api.post('/admin/create', data),
  getList: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/admin/list', { params }),
  toggleActive: (id: string) => 
    api.post(`/admin/${id}/toggle-active`),
  getAuditLogs: (params?: { page?: number; limit?: number; action?: string; module?: string }) => 
    api.get('/admin/audit-logs', { params }),
};

export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users/admin/all', { params }),
  getUserById: (id: string) => api.get(`/users/admin/${id}`),
  verifyUser: (id: string, status: 'verified' | 'rejected') =>
    api.post(`/users/admin/${id}/verify`, { status }),
  getPendingVerifications: () => 
    api.get('/users/admin/all', { params: { verificationStatus: 'pending' } }),
};

export const agentApi = {
  getAgents: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    api.get('/agents', { params }),
  getAgentsAdmin: (params?: { page?: number; limit?: number; category?: string; search?: string; featured?: boolean; isListed?: boolean }) =>
    api.get('/agents/admin/all', { params }),
  getAgentById: (id: string) => api.get(`/agents/${id}`),
  toggleListing: (id: string, isListed: boolean) =>
    api.post(`/agents/${id}/toggle-listing`, { isListed }),
  toggleFeatured: (id: string, isFeatured: boolean) =>
    api.post(`/agents/${id}/toggle-featured`, { isFeatured }),
};

export const userAgentApi = {
  getUserAgents: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/user-agents', { params }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getUserGrowth: (days: number = 7) => api.get('/dashboard/user-growth', { params: { days } }),
  getOrderTrend: (days: number = 7) => api.get('/dashboard/order-trend', { params: { days } }),
  getAgentSales: (top: number = 5) => api.get('/dashboard/agent-sales', { params: { top } }),
};

export const creatorApi = {
  getList: (status?: string) => 
    api.get('/creator/list', { params: { status } }),
  audit: (id: string, status: string, rejectReason?: string) =>
    api.post('/creator/audit', { id, status, rejectReason }),
};

export const orderApi = {
  getList: (params?: { page?: number; limit?: number; status?: string; userId?: string }) =>
    api.get('/order/admin/list', { params }),
  getDetail: (outTradeNo: string) => api.get(`/order/admin/${outTradeNo}`),
};

export default api;
