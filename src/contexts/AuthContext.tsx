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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      // FIX: Agregamos un Timeout de 2 segundos. Si AsyncStorage se congela, esto fuerza el desbloqueo.
      const sessionUser = await Promise.race([
        mockAuthService.checkSession(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout loading session')), 2000)
        ),
      ]);
      setUser(sessionUser as UserProfile | null);
    } catch (error) {
      console.warn('Session load aborted or failed:', error);
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
    await mockAuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
