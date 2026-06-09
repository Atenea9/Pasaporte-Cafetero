import AsyncStorage from '@react-native-async-storage/async-storage';

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

// In-memory session only — never restored from AsyncStorage so every fresh
// app launch always shows the general login screen (correct demo behaviour).
let _sessionCache: UserProfile | null = null;

export const mockAuthService = {
  async login(identifier: string, type: 'phone' | 'email'): Promise<UserProfile> {
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

    // Keep session in memory for the lifetime of this app session only
    _sessionCache = mockUser;

    return mockUser;
  },

  async checkSession(): Promise<UserProfile | null> {
    // Only return the in-memory cache — never restore from AsyncStorage.
    // This ensures every cold start shows the general login, not a stale role.
    return _sessionCache;
  },

  async logout(): Promise<void> {
    _sessionCache = null;
    // Best-effort cleanup of any previously stored values
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  },
};
