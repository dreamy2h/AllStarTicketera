import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permissionCode: string) => boolean;
  canAny: (permissionCodes: string[]) => boolean;
  canAll: (permissionCodes: string[]) => boolean;
  canManagePartners: boolean;
  canCreateEvents: boolean;
  canViewMetrics: boolean;
  canScanTickets: boolean;
  canManageRoles: boolean;
  canManageRanks: boolean;
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

  // Dynamic permission check: true if user is admin, has '*' or has explicit code
  const can = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (Array.isArray(user.permissions)) {
      if (user.permissions.includes('*')) return true;
      return user.permissions.includes(permissionCode.toLowerCase());
    }
    return false;
  };

  const canAny = (permissionCodes: string[]): boolean => {
    return permissionCodes.some((code) => can(code));
  };

  const canAll = (permissionCodes: string[]): boolean => {
    return permissionCodes.every((code) => can(code));
  };

  const isAdmin = user?.role === 'admin';
  const isLeader = user?.role === 'leader';
  const canManagePartners = can('partners:manage');
  const canCreateEvents = can('events:create');
  const canViewMetrics = can('metrics:view');
  const canScanTickets = can('scanner:access');
  const canManageRoles = can('roles:manage');
  const canManageRanks = can('ranks:manage') || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        can,
        canAny,
        canAll,
        canManagePartners,
        canCreateEvents,
        canViewMetrics,
        canScanTickets,
        canManageRoles,
        canManageRanks,
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
