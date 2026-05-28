import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService, UserProfile } from '../services/mockAuth.service';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (identifier: string, type: 'phone' | 'email') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      // Direct call — no setTimeout race (freezes in Expo web iframe)
      const sessionUser = await mockAuthService.checkSession();
      setUser(sessionUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, type: 'phone' | 'email') => {
    setIsLoading(true);
    try {
      const loggedUser = await mockAuthService.login(identifier, type);
      setUser(loggedUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
