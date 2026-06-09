import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STANDS } from '../data/mockData';

const STORAGE_KEY = 'app_state';

export interface Usuario {
  cedula: string;
  nombre: string;
  whatsapp: string;
  pais: string;
  estado: string;
  ciudad: string;
  municipio?: string;
  departamento?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string;
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

export interface CatalogoProducto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  caracteristicas: string[];
  disponible: boolean;
  standNombre?: string;
  municipioId?: string;
}

export interface AppState {
  usuario: Usuario | null;
  transacciones: Transaccion[];
  stands: any[];
  happyHour: boolean;
  notificaciones: Notificacion[];
  catalogoProductos: CatalogoProducto[];
}

type Action =
  | { type: 'SET_USUARIO'; payload: Usuario }
  | { type: 'UPDATE_FOTO'; payload: string }
  | { type: 'AGREGAR_TRANSACCION'; payload: Transaccion }
  | { type: 'ACUNAR_SELLO'; payload: string }
  | { type: 'SUMAR_PUNTOS'; payload: number }
  | { type: 'TOGGLE_HAPPY_HOUR' }
  | { type: 'AGREGAR_NOTIF'; payload: Notificacion }
  | { type: 'RESTORE_STATE'; payload: AppState }
  | { type: 'AGREGAR_PRODUCTO'; payload: CatalogoProducto }
  | { type: 'EDITAR_PRODUCTO'; payload: CatalogoProducto }
  | { type: 'ELIMINAR_PRODUCTO'; payload: string }
  | { type: 'TOGGLE_DISPONIBLE_PRODUCTO'; payload: string };

const initialState: AppState = {
  usuario: null,
  transacciones: [],
  stands: STANDS,
  happyHour: false,
  notificaciones: [],
  catalogoProductos: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USUARIO':
      return { ...state, usuario: action.payload };
    case 'UPDATE_FOTO':
      if (!state.usuario) return state;
      return { ...state, usuario: { ...state.usuario, fotoPerfil: action.payload } };
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
        catalogoProductos: restored.catalogoProductos ?? [],
      };
    }
    case 'AGREGAR_PRODUCTO':
      return { ...state, catalogoProductos: [...state.catalogoProductos, action.payload] };
    case 'EDITAR_PRODUCTO':
      return {
        ...state,
        catalogoProductos: state.catalogoProductos.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'ELIMINAR_PRODUCTO':
      return {
        ...state,
        catalogoProductos: state.catalogoProductos.filter(p => p.id !== action.payload),
      };
    case 'TOGGLE_DISPONIBLE_PRODUCTO':
      return {
        ...state,
        catalogoProductos: state.catalogoProductos.map(p =>
          p.id === action.payload ? { ...p, disponible: !p.disponible } : p
        ),
      };
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
