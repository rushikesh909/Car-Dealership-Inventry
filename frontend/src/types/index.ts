export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchVehicleParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number;
  limit?: number;
}
