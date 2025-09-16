import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, LoginResponse, Request, DashboardStats } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response handler
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response.data.data as T;
};

// Generic error handler
const handleError = (error: any): never => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error('An unexpected error occurred');
  }
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password });
      return handleResponse<LoginResponse>(response);
    } catch (error) {
      throw handleError(error);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return handleResponse(response);
    } catch (error) {
      throw handleError(error);
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile', data);
      return handleResponse(response);
    } catch (error) {
      throw handleError(error);
    }
  },

  changePassword: async (data: any) => {
    try {
      const response = await api.put('/auth/change-password', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Requests API
export const requestsAPI = {
  getRequests: async (params?: any): Promise<{ data: { requests: Request[] }, meta?: any }> => {
    try {
      const response = await api.get('/requests', { params });
      return response.data as { data: { requests: Request[] }, meta?: any };
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  getRequestById: async (id: number): Promise<{ request: Request }> => {
    try {
      const response = await api.get(`/requests/${id}`);
      return handleResponse<{ request: Request }>(response);
    } catch (error) {
      throw handleError(error);
    }
  },

  createRequest: async (data: any): Promise<{ request: Request }> => {
    try {
      const response = await api.post('/requests', data);
      return handleResponse<{ request: Request }>(response);
    } catch (error) {
      throw handleError(error);
    }
  },

  updateRequestStatus: async (id: number, data: any) => {
    try {
      const response = await api.put(`/requests/${id}/status`, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  assignTechnician: async (id: number, technicianId: number) => {
    try {
      const response = await api.put(`/requests/${id}/assign`, { technicianId });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  addCost: async (id: number, data: any) => {
    try {
      const response = await api.post(`/requests/${id}/costs`, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  closeRequest: async (id: number, data: any) => {
    try {
      const response = await api.put(`/requests/${id}/close`, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Customers API
export const customersAPI = {
  getCustomers: async (params?: any) => {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  createCustomer: async (data: any) => {
    try {
      const response = await api.post('/customers', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: any) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  createProduct: async (data: any) => {
    try {
      const response = await api.post('/products', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Departments API
export const departmentsAPI = {
  getDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: any) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },
  
  createUser: async (userData: any) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },
  
  updateUser: async (id: number, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (params?: any): Promise<{ data: DashboardStats }> => {
    try {
      const response = await api.get('/dashboard/stats', { params });
      return response.data as { data: DashboardStats };
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },
};

// Export API
export const exportAPI = {
  exportAllRequests: async (): Promise<Blob> => {
    try {
      const response = await api.get('/export/requests/all', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  exportRequestsByStatus: async (status: string): Promise<Blob> => {
    try {
      const response = await api.get(`/export/requests/status/${status}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  exportOverdueRequests: async (): Promise<Blob> => {
    try {
      const response = await api.get('/export/requests/overdue', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  exportRequestsByDepartment: async (departmentId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/export/requests/department/${departmentId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  exportRequestsByWarranty: async (warrantyStatus: string): Promise<Blob> => {
    try {
      const response = await api.get(`/export/requests/warranty/${warrantyStatus}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },

  exportDashboardStats: async (): Promise<Blob> => {
    try {
      const response = await api.get('/export/dashboard/stats', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return Promise.reject(handleError(error));
    }
  },
};

// Helper function to download blob as file
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Reports API
export const reportsAPI = {
  getReports: async (params?: any) => {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};


export default api;
