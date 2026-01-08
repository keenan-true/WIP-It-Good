import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Managers
export const managersApi = {
  getAll: () => api.get('/managers'),
  getById: (id: string) => api.get(`/managers/${id}`),
  create: (data: any) => api.post('/managers', data),
  update: (id: string, data: any) => api.put(`/managers/${id}`, data),
  delete: (id: string) => api.delete(`/managers/${id}`),
};

// Staff
export const staffApi = {
  getAll: () => api.get('/staff'),
  getById: (id: string) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/staff/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Products
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Initiatives
export const initiativesApi = {
  getAll: () => api.get('/initiatives'),
  getById: (id: string) => api.get(`/initiatives/${id}`),
  create: (data: any) => api.post('/initiatives', data),
  update: (id: string, data: any) => api.put(`/initiatives/${id}`, data),
  delete: (id: string) => api.delete(`/initiatives/${id}`),
};

// Allocations
export const allocationsApi = {
  getAll: (params?: any) => api.get('/allocations', { params }),
  getById: (id: string) => api.get(`/allocations/${id}`),
  getSummary: (staffId: string, month: number, year: number) =>
    api.get(`/allocations/summary/${staffId}/${month}/${year}`),
  create: (data: any) => api.post('/allocations', data),
  update: (id: string, data: any) => api.put(`/allocations/${id}`, data),
  delete: (id: string) => api.delete(`/allocations/${id}`),
  batchUpsert: (allocations: any[]) => api.post('/allocations/batch', { allocations }),
};

export default api;
