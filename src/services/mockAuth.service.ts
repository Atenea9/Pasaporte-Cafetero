import { Platform } from 'react-native';
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

let _sessionCache: UserProfile | null = null;

// ─── localStorage helpers (web-only, synchronous) ──────────────────────────
function webSave(profile: UserProfile) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile)); } catch {}
  }
}
function webLoad(): UserProfile | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  return null;
}
function webClear() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.removeItem(SESSION_KEY); } catch {}
  }
}

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

    _sessionCache = mockUser;
    webSave(mockUser);
    // Also persist to AsyncStorage for native
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(mockUser)).catch(() => {});

    return mockUser;
  },

  async checkSession(): Promise<UserProfile | null> {
    // 1. In-memory first (fastest)
    if (_sessionCache) return _sessionCache;

    // 2. localStorage on web (synchronous)
    const fromWeb = webLoad();
    if (fromWeb) { _sessionCache = fromWeb; return fromWeb; }

    // 3. AsyncStorage for native
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const profile: UserProfile = JSON.parse(raw);
        _sessionCache = profile;
        return profile;
      }
    } catch {}

    return null;
  },

  async logout(): Promise<void> {
    _sessionCache = null;
    webClear();
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  },
};
