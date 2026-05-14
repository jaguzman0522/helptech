import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import cookie from 'cookie-cutter';

interface Role {
  id: number;
  name: string;
  permissions: Record<string, string[]>;
  is_system: boolean;
}

interface User {
  id: number;
  user_code: string;
  email: string;
  full_name: string;
  role_name: string;
  company_id: number;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

  useEffect(() => {
    const savedToken = cookie.get('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    setToken(newToken);
    cookie.set('token', newToken, { path: '/' });
    await fetchUser(newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    cookie.set('token', '', { expires: new Date(0), path: '/' });
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.role) return false;
    
    const perms = user.role.permissions;
    
    // SuperAdmin bypass
    if (perms['all'] && perms['all'].includes('all')) return true;
    
    // Check specific module and action
    return perms[module]?.includes(action) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
