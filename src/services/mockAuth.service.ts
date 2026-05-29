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

// In-memory session cache — avoids relying on AsyncStorage in the critical path
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

    // Store in memory immediately — fire-and-forget AsyncStorage (can hang in web iframe)
    _sessionCache = mockUser;
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser)).catch(() => {});

    return mockUser;
  },

  async checkSession(): Promise<UserProfile | null> {
    // Return in-memory cache instantly if available (e.g. after login in same session)
    if (_sessionCache) return _sessionCache;

    try {
      // Race AsyncStorage against a 800ms timeout to avoid hanging in web iframe
      const session = await Promise.race([
        AsyncStorage.getItem(SESSION_KEY),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 800)),
      ]);
      if (session) {
        _sessionCache = JSON.parse(session);
        return _sessionCache;
      }
      return null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    _sessionCache = null;
    // Fire-and-forget — don't block logout on AsyncStorage
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  },
};
