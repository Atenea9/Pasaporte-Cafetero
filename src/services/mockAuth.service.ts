import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type UserRole = 'visitante' | 'expositor' | 'comprador' | 'admin' | 'ceo';

export interface UserProfile {
  uid: string;
  role: UserRole;
  name?: string;
  phone?: string;
  email?: string;
}

const SESSION_KEY = '@mock_auth_session';

export const mockAuthService = {
  async login(identifier: string, type: 'phone' | 'email'): Promise<UserProfile> {
    await delay(800);

    let role: UserRole = 'visitante';
    if (identifier.includes('admin'))     role = 'admin';
    if (identifier.includes('ceo'))       role = 'ceo';
    if (identifier.includes('expositor')) role = 'expositor';
    if (identifier.includes('comprador')) role = 'comprador';

    const mockUser: UserProfile = {
      uid: `mock-uid-${Date.now()}`,
      role,
      name: `Usuario ${role}`,
      ...(type === 'phone' ? { phone: identifier } : { email: identifier }),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  async checkSession(): Promise<UserProfile | null> {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
