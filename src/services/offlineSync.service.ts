/**
 * offlineSync.service.ts
 * -------------------------------------------------
 * Offline-first transaction queue for unreliable fair Wi-Fi.
 *
 * HOW IT WORKS:
 *  1. Every stamp/purchase is written to an AsyncStorage queue
 *     BEFORE attempting the Firestore write.
 *  2. A NetInfo listener watches connectivity.
 *  3. When the device comes back online, flushQueue() replays
 *     every pending operation against Firestore in order.
 *  4. Successfully synced items are removed from the queue.
 *
 * INSTALL REQUIRED PACKAGE:
 *   npx expo install @react-native-community/netinfo
 *
 * USAGE (in AppContext or a top-level component):
 *   import { initOfflineSync } from '../services/offlineSync.service';
 *   useEffect(() => initOfflineSync(), []);
 * -------------------------------------------------
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo       from '@react-native-community/netinfo';
import { addTransaccion, actualizarPuntosYSello } from './db.service';
import type { Transaccion } from '../context/AppContext';

const QUEUE_KEY = '@offline_queue';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueuedOp {
  id:        string;   // local UUID
  type:      'transaccion' | 'puntos';
  payload:   unknown;
  createdAt: number;
  attempts:  number;
}

// ─── Queue helpers ────────────────────────────────────────────────────────────

async function readQueue(): Promise<QueuedOp[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedOp[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add an operation to the local queue (called before every Firestore write). */
export async function enqueue(type: QueuedOp['type'], payload: unknown): Promise<void> {
  const queue = await readQueue();
  queue.push({
    id:        `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    createdAt: Date.now(),
    attempts:  0,
  });
  await writeQueue(queue);
}

/** Attempt to sync all queued operations against Firestore. */
export async function flushQueue(): Promise<void> {
  const queue = await readQueue();
  if (queue.length === 0) return;

  const remaining: QueuedOp[] = [];

  for (const op of queue) {
    try {
      if (op.type === 'transaccion') {
        const t = op.payload as Omit<Transaccion, 'id'>;
        await addTransaccion(t);
      } else if (op.type === 'puntos') {
        const { cedula, puntos, municipioId } = op.payload as {
          cedula: string; puntos: number; municipioId?: string;
        };
        await actualizarPuntosYSello(cedula, puntos, municipioId);
      }
      // Successfully synced — do NOT push to remaining
    } catch (err) {
      console.warn(`[OfflineSync] op ${op.id} failed (attempt ${op.attempts + 1}):`, err);
      remaining.push({ ...op, attempts: op.attempts + 1 });
    }
  }

  await writeQueue(remaining);

  if (remaining.length > 0) {
    console.warn(`[OfflineSync] ${remaining.length} ops still pending after flush.`);
  } else {
    console.log('[OfflineSync] All queued operations synced successfully.');
  }
}

/** Returns the number of unsynced operations (for a status badge in the UI). */
export async function pendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

// ─── NetInfo listener ─────────────────────────────────────────────────────────

/**
 * Call once at app startup (e.g., inside AppProvider's useEffect).
 * Returns an unsubscribe function for cleanup.
 */
export function initOfflineSync(): () => void {
  const unsub = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      flushQueue().catch(console.error);
    }
  });
  // Also attempt a flush on startup in case the device is already online
  flushQueue().catch(console.error);
  return unsub;
}
