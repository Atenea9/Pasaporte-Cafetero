import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STANDS } from '../data/mockData';

const STORAGE_KEY = 'app_state';

export interface Usuario {
  cedula: string;
  nombre: string;
  whatsapp: string;
  municipio: string;
  departamento: string;
  puntos: number;
  nivel: string;
  sellos: string[];
  creadoEn: number;
}

export interface Transaccion {
  id: string;
  tipo: string;
  standId?: string;
  standNombre?: string;
  municipioId?: string;
  puntos: number;
  monto?: number;
  selloOtorgado?: boolean;
  fecha: string;
  descripcion: string;
}

export interface Notificacion {
  id: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export interface AppState {
  usuario: Usuario | null;
  transacciones: Transaccion[];
  stands: any[];
  happyHour: boolean;
  notificaciones: Notificacion[];
}

type Action =
  | { type: 'SET_USUARIO'; payload: Usuario }
  | { type: 'AGREGAR_TRANSACCION'; payload: Transaccion }
  | { type: 'ACUNAR_SELLO'; payload: string }
  | { type: 'SUMAR_PUNTOS'; payload: number }
  | { type: 'TOGGLE_HAPPY_HOUR' }
  | { type: 'AGREGAR_NOTIF'; payload: Notificacion }
  | { type: 'RESTORE_STATE'; payload: AppState };

const DEMO_USER: Usuario = {
  cedula: '1107654321', nombre: 'Carlos Andrés Rojas',
  whatsapp: '3156789012', municipio: 'Chaparral',
  departamento: 'Tolima', puntos: 320, nivel: 'Conocedor',
  sellos: ['Ibagué', 'Planadas', 'Chaparral'], creadoEn: Date.now(),
};

const initialState: AppState = {
  usuario: DEMO_USER,
  transacciones: [],
  stands: STANDS,
  happyHour: false,
  notificaciones: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USUARIO':
      return { ...state, usuario: action.payload };
    case 'AGREGAR_TRANSACCION':
      return { ...state, transacciones: [action.payload, ...state.transacciones] };
    case 'ACUNAR_SELLO': {
      if (!state.usuario) return state;
      const sellos = state.usuario.sellos.includes(action.payload)
        ? state.usuario.sellos
        : [...state.usuario.sellos, action.payload];
      return { ...state, usuario: { ...state.usuario, sellos } };
    }
    case 'SUMAR_PUNTOS': {
      if (!state.usuario) return state;
      return {
        ...state,
        usuario: { ...state.usuario, puntos: state.usuario.puntos + action.payload },
      };
    }
    case 'TOGGLE_HAPPY_HOUR':
      return { ...state, happyHour: !state.happyHour };
    case 'AGREGAR_NOTIF':
      return { ...state, notificaciones: [action.payload, ...state.notificaciones] };
    case 'RESTORE_STATE': {
      const restored = action.payload;
      return {
        ...state,
        ...restored,
        usuario: restored.usuario ?? state.usuario,
      };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: AppState = JSON.parse(saved);
          dispatch({ type: 'RESTORE_STATE', payload: parsed });
        }
      } catch (e) {
        console.warn('Error restaurando estado:', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Error guardando estado:', e)
    );
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}

export const useAppContext = useApp;
