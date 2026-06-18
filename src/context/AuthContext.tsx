import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  editor: { password: 'edit123', role: 'editor', displayName: 'Editor User' },
  viewer: { password: 'view123', role: 'viewer', displayName: 'Viewer User' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('orbit-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, password: string, role: UserRole) => {
    const key = role === 'editor' ? 'editor' : 'viewer';
    const demo = DEMO_USERS[key];
    if (username === key && password === demo.password) {
      const u: User = { username: key, role: demo.role, displayName: demo.displayName };
      setUser(u);
      sessionStorage.setItem('orbit-user', JSON.stringify(u));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('orbit-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isEditor: user?.role === 'editor' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
