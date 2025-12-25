'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = authApi.getToken();
    if (token) {
      // Verify token and get user info
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      // You can add an endpoint to get current user info
      // For now, we'll just check if token exists
      const token = authApi.getToken();
      if (token) {
        // Decode JWT to get user info (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.user_id,
          username: payload.username || 'User',
          email: payload.email || '',
          first_name: payload.first_name || '',
          last_name: payload.last_name || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      authApi.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      authApi.setToken(response.access);
      
      // Decode token to get user info
      const payload = JSON.parse(atob(response.access.split('.')[1]));
      setUser({
        id: payload.user_id,
        username: payload.username || email,
        email: payload.email || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
      });
      
      router.push('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  const logout = () => {
    authApi.removeToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
