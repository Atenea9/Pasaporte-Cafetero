/**
 * db.service.ts
 * -------------------------------------------------
 * All Firestore read/write operations for PasaporteCafetero.
 *
 * Firestore collection schema:
 *
 *   usuarios/{cedula}           — one document per registered visitor
 *   transacciones/{id}          — all stamp/purchase transactions
 *   stands/{id}                 — exhibitor stands (managed by Admin)
 *   subastas/{id}               — live auction lots
 *   subastas/{id}/pujas/{id}    — bids per auction (subcollection)
 *   config/app                  — global settings: happyHour, eventActive …
 *
 * Real-time listeners (onSnapshot) are in their own hook file:
 *   src/hooks/useRealtimeAuction.ts
 * -------------------------------------------------
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Usuario, Transaccion } from '../context/AppContext';

// ─── Colección references ─────────────────────────────────────────────────────
const usuariosCol    = collection(db, 'usuarios');
const transCol       = collection(db, 'transacciones');
const standsCol      = collection(db, 'stands');
const subastasCol    = collection(db, 'subastas');
const configDocRef   = doc(db, 'config', 'app');

// ─── USUARIOS ────────────────────────────────────────────────────────────────

/** Fetch a single visitor by cédula. Returns null if not found. */
export async function getUsuario(cedula: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(usuariosCol, cedula));
  if (!snap.exists()) return null;
  return snap.data() as Usuario;
}

/** Create or fully overwrite a visitor document. */
export async function setUsuario(usuario: Usuario): Promise<void> {
  await setDoc(doc(usuariosCol, usuario.cedula), {
    ...usuario,
    updatedAt: serverTimestamp(),
  });
}

/** Add points and optionally a stamp to an existing visitor. */
export async function actualizarPuntosYSello(
  cedula: string,
  puntos: number,
  municipioId?: string,
): Promise<void> {
  const ref  = doc(usuariosCol, cedula);
  const data: Record<string, unknown> = {
    puntos:    increment(puntos),
    updatedAt: serverTimestamp(),
  };
  if (municipioId) {
    data.sellos = arrayUnion(municipioId);
  }
  await updateDoc(ref, data);
}

/** Fetch the top-N visitors sorted by points (leaderboard). */
export async function getLeaderboard(n = 50): Promise<Usuario[]> {
  const q    = query(usuariosCol, orderBy('puntos', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Usuario);
}

// ─── TRANSACCIONES ───────────────────────────────────────────────────────────

/** Persist a new transaction document. Returns the auto-generated doc ID. */
export async function addTransaccion(
  trans: Omit<Transaccion, 'id'>,
): Promise<string> {
  const ref = await addDoc(transCol, {
    ...trans,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all transactions for a visitor (sorted newest first). */
export async function getTransaccionesByUsuario(
  cedula: string,
): Promise<Transaccion[]> {
  const q    = query(transCol, where('cedula', '==', cedula), orderBy('fecha', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Transaccion);
}

// ─── STANDS ──────────────────────────────────────────────────────────────────

/** Fetch all active stands. */
export async function getStands() {
  const q    = query(standsCol, where('activo', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── SUBASTAS ────────────────────────────────────────────────────────────────

/** Fetch the currently active auction lot (if any). */
export async function getSubastaActiva() {
  const q    = query(subastasCol, where('activa', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/** Place a bid on an active auction. */
export async function pujar(
  subastaId: string,
  cedula: string,
  nombre: string,
  monto: number,
): Promise<void> {
  const pujasCol = collection(db, 'subastas', subastaId, 'pujas');
  await addDoc(pujasCol, {
    cedula,
    nombre,
    monto,
    timestamp: serverTimestamp(),
  });
  // Update the top-level lot with the current winning bid
  await updateDoc(doc(subastasCol, subastaId), {
    ofertaActual:   monto,
    mejorPostor:    nombre,
    mejorPostorId:  cedula,
    totalPujas:     increment(1),
  });
}

// ─── CONFIG GLOBAL ───────────────────────────────────────────────────────────

/** Read the app-wide config (happyHour flag, event dates, etc.). */
export async function getConfig(): Promise<Record<string, unknown>> {
  const snap = await getDoc(configDocRef);
  return snap.exists() ? (snap.data() as Record<string, unknown>) : {};
}

/** Toggle the Happy Hour flag from the Admin panel. */
export async function setHappyHour(activo: boolean): Promise<void> {
  await setDoc(configDocRef, { happyHour: activo }, { merge: true });
}
