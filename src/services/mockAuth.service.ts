import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type UserRole = 'visitante' | 'expositor' | 'comprador' | 'admin' | 'ceo';

export interface UserProfile {
  uid: string;
  role: UserRole;
  name?: string;
  phone?: string;
  email?: string;
}

const SESSION_KEY = '@mock_auth_session';

const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string }> = {
  'visitor@demo.com':    { role: 'visitante',  name: 'Carlos Andrés Rojas'  },
  'buyer@demo.com':      { role: 'comprador',  name: 'James Whitfield'      },
  'expositor@demo.com':  { role: 'expositor',  name: 'María Castaño'        },
  'admin@demo.com':      { role: 'admin',      name: 'Administrador Feria'  },
  'ceo@demo.com':        { role: 'ceo',        name: 'Director General'     },
  'stevenpolania23@outlook.com': { role: 'ceo', name: 'Steven Polania'      },
};

export const mockAuthService = {
  async login(identifier: string, type: 'phone' | 'email'): Promise<UserProfile> {
    // No artificial delay — setTimeout freezes in Expo web iframe
    const normalizedId = identifier.toLowerCase().trim();
    let role: UserRole = 'visitante';
    let name: string | undefined;

    if (DEMO_ACCOUNTS[normalizedId]) {
      role = DEMO_ACCOUNTS[normalizedId].role;
      name = DEMO_ACCOUNTS[normalizedId].name;
    } else {
      if (normalizedId.includes('admin'))     role = 'admin';
      if (normalizedId.includes('ceo'))       role = 'ceo';
      if (normalizedId.includes('expositor')) role = 'expositor';
      if (normalizedId.includes('comprador')) role = 'comprador';
      name = `Usuario ${role}`;
    }

    const mockUser: UserProfile = {
      uid: `mock-uid-${Date.now()}`,
      role,
      name,
      ...(type === 'phone' ? { phone: identifier } : { email: identifier }),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  async checkSession(): Promise<UserProfile | null> {
    try {
      const session = await AsyncStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
