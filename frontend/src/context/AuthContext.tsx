import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../services/api';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(savedToken);
        // Check expiration
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser({
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Invalid saved token:', err);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('token', response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  };

  const register = async (email: string, password: string) => {
    await authApi.register({ email, password });
    // Automatically log in after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
