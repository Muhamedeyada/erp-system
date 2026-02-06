import axios, { AxiosInstance } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api: AxiosInstance = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorized: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: unknown; token: string }>('/auth/login', { email, password }),
  registerCompany: (data: { companyName: string; email: string; password: string; name?: string }) =>
    api.post('/auth/register-company', data),
  me: () => api.get('/auth/me'),
};

export const accountsApi = {
  list: (type?: string) =>
    api.get('/accounting/accounts', type ? { params: { type } } : undefined),
  get: (id: string) => api.get(`/accounting/accounts/${id}`),
  create: (data: { code: string; name: string; type: string; parentId?: string }) =>
    api.post('/accounting/accounts', data),
  update: (id: string, data: { name?: string; isActive?: boolean }) =>
    api.put(`/accounting/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounting/accounts/${id}`),
};

export const journalEntriesApi = {
  list: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/accounting/journal-entries', { params }),
  get: (id: string) => api.get(`/accounting/journal-entries/${id}`),
  create: (data: {
    date: string;
    description?: string;
    reference?: string;
    lines: Array<{ accountId: string; debit?: number; credit?: number; description?: string }>;
  }) => api.post('/accounting/journal-entries', data),
};

export const invoicesApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/accounting/invoices', { params }),
  get: (id: string) => api.get(`/accounting/invoices/${id}`),
  create: (data: {
    customerName: string;
    customerId?: number;
    date: string;
    dueDate: string;
    lines: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) => api.post('/accounting/invoices', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/accounting/invoices/${id}/status`, { status }),
};

export const paymentsApi = {
  list: (params?: { invoiceId?: string; method?: string }) =>
    api.get('/accounting/payments', { params }),
  get: (id: string) => api.get(`/accounting/payments/${id}`),
  create: (data: {
    invoiceId: string;
    amount: number;
    paymentDate: string;
    method: string;
    reference?: string;
  }) => api.post('/accounting/payments', data),
};

export const reportsApi = {
  trialBalance: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/accounting/reports/trial-balance', { params }),
};
