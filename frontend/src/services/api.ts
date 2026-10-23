import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  PaginatedResult,
  SearchVehicleParams,
  User,
  Vehicle,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: on 401 unauthorized, evict token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: async (data: { email: string; password: string }): Promise<User> => {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
};

export const vehiclesApi = {
  getAll: async (page = 1, limit = 12): Promise<PaginatedResult<Vehicle>> => {
    const res = await api.get<PaginatedResult<Vehicle>>('/vehicles', {
      params: { page, limit },
    });
    return res.data;
  },
  search: async (params: SearchVehicleParams): Promise<PaginatedResult<Vehicle>> => {
    const res = await api.get<PaginatedResult<Vehicle>>('/vehicles/search', {
      params,
    });
    return res.data;
  },
  create: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
    const res = await api.post<Vehicle>('/vehicles', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.put<Vehicle>(`/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
  purchase: async (id: string): Promise<Vehicle> => {
    const res = await api.post<Vehicle>(`/vehicles/${id}/purchase`);
    return res.data;
  },
  restock: async (id: string, amount: number): Promise<Vehicle> => {
    const res = await api.post<Vehicle>(`/vehicles/${id}/restock`, { amount });
    return res.data;
  },
};
