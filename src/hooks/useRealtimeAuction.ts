/**
 * useRealtimeAuction.ts
 * -------------------------------------------------
 * Real-time auction hook — replaces polling / mock state.
 *
 * Uses Firestore onSnapshot so every connected device sees
 * bid updates within ~300 ms without WebSocket infrastructure.
 *
 * USAGE:
 *   const { subasta, pujas, loading } = useRealtimeAuction();
 *   // subasta = current lot data (ofertaActual, mejorPostor …)
 *   // pujas   = last 20 bids, newest first
 * -------------------------------------------------
 */

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Subasta {
  id:             string;
  lote:           string;
  descripcion:    string;
  ofertaBase:     number;
  ofertaActual:   number;
  mejorPostor:    string;
  mejorPostorId:  string;
  totalPujas:     number;
  cierreEn:       Date | null;
  activa:         boolean;
  imagenUrl?:     string;
}

export interface Puja {
  id:        string;
  cedula:    string;
  nombre:    string;
  monto:     number;
  timestamp: Date;
}

export function useRealtimeAuction() {
  const [subasta, setSubasta] = useState<Subasta | null>(null);
  const [pujas,   setPujas]   = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // Listen to the currently active auction lot
    const subastasRef = collection(db, 'subastas');
    const qSubasta    = query(subastasRef, where('activa', '==', true), limit(1));

    const unsubSubasta = onSnapshot(
      qSubasta,
      (snap) => {
        if (snap.empty) {
          setSubasta(null);
          setLoading(false);
          return;
        }
        const d   = snap.docs[0];
        const raw = d.data();
        setSubasta({
          id:            d.id,
          lote:          raw.lote          ?? '',
          descripcion:   raw.descripcion   ?? '',
          ofertaBase:    raw.ofertaBase    ?? 0,
          ofertaActual:  raw.ofertaActual  ?? raw.ofertaBase ?? 0,
          mejorPostor:   raw.mejorPostor   ?? '—',
          mejorPostorId: raw.mejorPostorId ?? '',
          totalPujas:    raw.totalPujas    ?? 0,
          cierreEn:      raw.cierreEn?.toDate() ?? null,
          activa:        raw.activa        ?? false,
          imagenUrl:     raw.imagenUrl,
        });
        setLoading(false);
      },
      (err) => {
        console.error('useRealtimeAuction error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubSubasta();
  }, []);

  // When we have an active auction ID, subscribe to its bids subcollection
  useEffect(() => {
    if (!subasta?.id) { setPujas([]); return; }

    const pujasRef = collection(db, 'subastas', subasta.id, 'pujas');
    const qPujas   = query(pujasRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubPujas = onSnapshot(qPujas, (snap) => {
      const list: Puja[] = snap.docs.map(d => {
        const raw = d.data();
        return {
          id:        d.id,
          cedula:    raw.cedula    ?? '',
          nombre:    raw.nombre    ?? '',
          monto:     raw.monto     ?? 0,
          timestamp: raw.timestamp?.toDate() ?? new Date(),
        };
      });
      setPujas(list);
    });

    return () => unsubPujas();
  }, [subasta?.id]);

  return { subasta, pujas, loading, error };
}

// ─── Happy Hour real-time listener ───────────────────────────────────────────

export function useHappyHour(): boolean {
  const [isHappyHour, setIsHappyHour] = useState(false);

  useEffect(() => {
    const configRef = doc(db, 'config', 'app');
    const unsub = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        setIsHappyHour(!!snap.data().happyHour);
      }
    });
    return () => unsub();
  }, []);

  return isHappyHour;
}
