/**
 * PasaporteCafetero — Firestore Schema Reference
 *
 * This file documents the Firestore data model. It is a TypeScript type reference
 * and is NOT imported at runtime. Use it as a living specification.
 *
 * Collections are at the root level. Sub-collections are noted with "/".
 *
 * Last updated: 2026-05-26
 */

// ─── ENUMS & CONSTANTS ───────────────────────────────────────────────────────

export type UserRole = 'visitante' | 'expositor' | 'comprador' | 'admin' | 'ceo';

export type MembershipLevel = 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';

export type StampCategory =
  | 'arabica'
  | 'robusta'
  | 'geisha'
  | 'typica'
  | 'bourbon'
  | 'maragogipe'
  | 'castillo'
  | 'tabi';

export type NotificationChannel = 'push' | 'sms' | 'whatsapp' | 'in_app';

export type AuctionStatus = 'upcoming' | 'active' | 'closed' | 'cancelled';

export const LEVEL_THRESHOLDS: Record<MembershipLevel, number> = {
  bronce:   0,
  plata:    500,
  oro:      1500,
  platino:  3000,
  diamante: 6000,
};

export const POINTS_PER_PURCHASE = 10; // pts per $1,000 COP
export const STAMP_BONUS_POINTS  = 50;
export const HAPPY_HOUR_DEFAULT_MULTIPLIER = 2;

// ─── ROOT COLLECTIONS ────────────────────────────────────────────────────────

/**
 * /usuarios/{uid}
 * Created on registration. uid = Firebase Auth UID.
 */
export interface UsuarioDoc {
  uid: string;
  cedula: string;               // national ID, indexed
  nombre: string;
  whatsapp: string;
  municipio: string;
  departamento: string;
  rol: UserRole;
  nivel: MembershipLevel;
  puntos: number;               // running total
  puntosHistorico: number;      // all-time total (never decremented)
  sellosCount: number;          // total stamps collected
  qrCode: string;               // base64 or URL
  fotoUrl?: string;             // profile photo URL (Storage)
  fcmToken?: string;            // Firebase Cloud Messaging token
  language: string;             // 'es' | 'en' | 'fr' | ...
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  // Expositor-only fields (rol === 'expositor')
  standId?: string;
  pinHash?: string;             // bcrypt hash of stand PIN
  // Comprador-only fields (rol === 'comprador')
  empresaCompradora?: string;
  paisOrigen?: string;
  certificaciones?: string[];   // e.g. ['FairTrade', 'Rainforest Alliance']
}

/**
 * /usuarios/{uid}/compras/{compraId}
 * Sub-collection: individual purchase records.
 */
export interface CompraDoc {
  compraId: string;
  standId: string;
  standNombre: string;
  monto: number;               // COP
  puntos: number;              // points awarded
  selloCategoria?: StampCategory;
  happyHourActive: boolean;
  multiplicador: number;       // 1 normally, >1 during happy hour
  escaneadoPor: string;        // uid of expositor who scanned
  timestamp: FirestoreTimestamp;
}

/**
 * /usuarios/{uid}/logros/{logroId}
 * Sub-collection: unlocked achievements.
 */
export interface LogroDoc {
  logroId: string;
  titulo: string;
  descripcion: string;
  icono: string;               // emoji or icon key
  puntosBonus: number;
  unlockedAt: FirestoreTimestamp;
}

// ─── STANDS ──────────────────────────────────────────────────────────────────

/**
 * /stands/{standId}
 */
export interface StandDoc {
  standId: string;
  nombre: string;
  municipio: string;
  departamento: string;
  categoria: StampCategory;
  descripcion: string;
  logoUrl?: string;
  pin: string;                 // plain text PIN (admin-set, 4-6 digits)
  expositorUid: string;
  activo: boolean;
  ventasHoy: number;           // updated by Cloud Function
  clientesHoy: number;
  puntosOtorgadosHoy: number;
  rankingPos?: number;         // updated by Cloud Function on batch
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ─── RANKING ─────────────────────────────────────────────────────────────────

/**
 * /ranking/{uid}
 * Denormalized snapshot for fast leaderboard reads (updated by Cloud Function).
 */
export interface RankingDoc {
  uid: string;
  nombre: string;
  municipio: string;
  nivel: MembershipLevel;
  puntos: number;
  posicion: number;
  updatedAt: FirestoreTimestamp;
}

// ─── HAPPY HOUR ──────────────────────────────────────────────────────────────

/**
 * /config/happyHour
 * Single document — admin writes, all clients read.
 */
export interface HappyHourDoc {
  activo: boolean;
  multiplicador: number;       // e.g. 2 = double points
  iniciadoPor: string;         // admin uid
  startAt: FirestoreTimestamp;
  endAt: FirestoreTimestamp | null;
  duracionMinutos: number;
}

// ─── NOTIFICACIONES ──────────────────────────────────────────────────────────

/**
 * /notificaciones/{notifId}
 * Written by admin. Cloud Function picks up and sends via FCM.
 */
export interface NotificacionDoc {
  notifId: string;
  titulo: string;
  cuerpo: string;
  canal: NotificationChannel;
  targetRoles: UserRole[];     // empty array = all roles
  targetUids?: string[];       // specific UIDs override targetRoles
  enviada: boolean;
  enviadaPor: string;          // admin uid
  creadaAt: FirestoreTimestamp;
  enviadaAt?: FirestoreTimestamp;
}

// ─── SUBASTAS (Comprador flow) ───────────────────────────────────────────────

/**
 * /subastas/{subastaId}
 */
export interface SubastaDoc {
  subastaId: string;
  titulo: string;
  descripcion: string;
  standId: string;
  categoria: StampCategory;
  cantidadKg: number;
  precioPisoUSD: number;
  precioActualUSD: number;
  status: AuctionStatus;
  ganadoreUid?: string;
  ganadorEmpresa?: string;
  startAt: FirestoreTimestamp;
  endAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

/**
 * /subastas/{subastaId}/pujas/{pujaId}
 */
export interface PujaDoc {
  pujaId: string;
  compradorUid: string;
  empresa: string;
  montoUSD: number;
  timestamp: FirestoreTimestamp;
}

// ─── PREMIOS ─────────────────────────────────────────────────────────────────

/**
 * /premios/{premioId}
 * Redeemable prizes. Shown in PasaporteScreen and RankingScreen.
 */
export interface PremioDoc {
  premioId: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntosRequeridos: number;
  nivelRequerido: MembershipLevel;
  stock: number;              // -1 = unlimited
  activo: boolean;
  creadoAt: FirestoreTimestamp;
}

/**
 * /canjes/{canjeId}
 * Written when a visitante redeems a prize.
 */
export interface CanjeDoc {
  canjeId: string;
  usuarioUid: string;
  premioId: string;
  premioNombre: string;
  puntosUsados: number;
  timestamp: FirestoreTimestamp;
  validadoPor?: string;        // admin uid who validated
}

// ─── SELLOS ──────────────────────────────────────────────────────────────────

/**
 * /usuarios/{uid}/sellos/{selloId}
 * Awarded on purchase. stampCategory maps to the stamp album.
 */
export interface SelloDoc {
  selloId: string;
  standId: string;
  standNombre: string;
  categoria: StampCategory;
  compraId: string;
  timestamp: FirestoreTimestamp;
}

// ─── AGENDA ──────────────────────────────────────────────────────────────────

/**
 * /agenda/{eventoId}
 */
export interface AgendaEventoDoc {
  eventoId: string;
  titulo: string;
  descripcion: string;
  lugarNombre: string;
  fechaHoraInicio: FirestoreTimestamp;
  fechaHoraFin: FirestoreTimestamp;
  categorias: string[];
  ponentes?: string[];
  publicado: boolean;
}

// ─── ANALYTICS (written by Cloud Functions) ──────────────────────────────────

/**
 * /analytics/daily/{YYYY-MM-DD}
 * Aggregated daily snapshot.
 */
export interface DailyAnalyticsDoc {
  fecha: string;               // 'YYYY-MM-DD'
  totalVisitantes: number;
  nuevosRegistros: number;
  totalCompras: number;
  totalVentasCOP: number;
  puntosOtorgados: number;
  standsActivos: number;
  canjesRealizados: number;
  happyHourMinutos: number;
  topStands: Array<{ standId: string; nombre: string; ventas: number }>;
  createdAt: FirestoreTimestamp;
}

// ─── FIRESTORE TIMESTAMP ALIAS ───────────────────────────────────────────────

/** Represents a Firestore server timestamp or Date. */
export type FirestoreTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

// ─── FIRESTORE PATH HELPERS ──────────────────────────────────────────────────

export const PATHS = {
  usuario:        (uid: string) => `usuarios/${uid}`,
  compras:        (uid: string) => `usuarios/${uid}/compras`,
  compra:         (uid: string, id: string) => `usuarios/${uid}/compras/${id}`,
  logros:         (uid: string) => `usuarios/${uid}/logros`,
  sellos:         (uid: string) => `usuarios/${uid}/sellos`,
  stand:          (id: string) => `stands/${id}`,
  stands:         () => 'stands',
  ranking:        () => 'ranking',
  rankingDoc:     (uid: string) => `ranking/${uid}`,
  happyHour:      () => 'config/happyHour',
  notificacion:   (id: string) => `notificaciones/${id}`,
  notificaciones: () => 'notificaciones',
  subasta:        (id: string) => `subastas/${id}`,
  pujas:          (subastaId: string) => `subastas/${subastaId}/pujas`,
  premio:         (id: string) => `premios/${id}`,
  premios:        () => 'premios',
  canje:          (id: string) => `canjes/${id}`,
  agenda:         () => 'agenda',
  analytics:      (date: string) => `analytics/daily/${date}`,
} as const;
