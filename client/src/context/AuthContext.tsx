import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  canManagePartners: boolean;
  canCreateEvents: boolean;
  canViewMetrics: boolean;
  canScanTickets: boolean;
  isAdmin: boolean;
  isLeader: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('allstar_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    const savedToken = localStorage.getItem('allstar_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Error al verificar sesión guardada:', err);
      localStorage.removeItem('allstar_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('allstar_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('allstar_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  const isAdmin = user?.role === 'admin';
  const isLeader = user?.role === 'leader';
  const canManagePartners = isAdmin || hasPermission('manage_partners');
  const canCreateEvents = isAdmin || hasPermission('create_events');
  const canViewMetrics = isAdmin || hasPermission('view_metrics');
  const canScanTickets = isAdmin || hasPermission('door_scanner');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasPermission,
        canManagePartners,
        canCreateEvents,
        canViewMetrics,
        canScanTickets,
        isAdmin,
        isLeader,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
