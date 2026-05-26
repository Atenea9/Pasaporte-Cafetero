/**
 * auth.service.ts
 * -------------------------------------------------
 * Phone-number OTP authentication via Firebase Auth.
 *
 * Replaces the insecure PIN '2025' gate used in VendedorScreen
 * and the Admin panel with a real SMS one-time password flow.
 *
 * SETUP:
 *  1. In Firebase Console → Authentication → Sign-in method →
 *     enable "Phone".
 *  2. For web/Expo web the reCAPTCHA verifier is required.
 *     On native (iOS/Android) use expo-firebase-recaptcha or
 *     the bare workflow with @react-native-firebase/auth.
 *
 * USAGE EXAMPLE (in a component):
 *
 *   const { sendOTP, verifyOTP, currentUser } = usePhoneAuth();
 *
 *   // Step 1 – send OTP
 *   await sendOTP('+573156789012', recaptchaVerifierRef.current);
 *
 *   // Step 2 – user types the 6-digit code
 *   const success = await verifyOTP(code);
 * -------------------------------------------------
 */

import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

// Holds the verificationId between sendOTP and verifyOTP calls
let _verificationId: string | null = null;

/**
 * Step 1 – Send OTP to a Colombian phone number.
 * @param phoneNumber   E.164 format, e.g. "+573156789012"
 * @param appVerifier   A RecaptchaVerifier instance (web only).
 *                      Pass `undefined` on native — Firebase handles it.
 */
export async function sendOTP(
  phoneNumber: string,
  appVerifier?: RecaptchaVerifier,
): Promise<void> {
  const provider = new PhoneAuthProvider(auth);
  _verificationId = await provider.verifyPhoneNumber(
    phoneNumber,
    // On native Expo you can pass a dummy string; Firebase SDK manages reCAPTCHA
    appVerifier as RecaptchaVerifier,
  );
}

/**
 * Step 2 – Verify the OTP code the user typed.
 * Returns true if authentication succeeded.
 */
export async function verifyOTP(code: string): Promise<boolean> {
  if (!_verificationId) {
    console.error('verifyOTP called before sendOTP');
    return false;
  }
  try {
    const credential = PhoneAuthProvider.credential(_verificationId, code);
    await signInWithCredential(auth, credential);
    _verificationId = null;
    return true;
  } catch (err) {
    console.error('OTP verification failed:', err);
    return false;
  }
}

/** Sign the current user out. */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── Role helpers ─────────────────────────────────────────────────────────────
// In Firestore, store a `roles` collection or a custom claim via Cloud Functions.
// These helpers check the Firestore `usuarios/{uid}/role` field as a simple
// alternative that avoids Cloud Functions during the initial launch.

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type AppRole = 'admin' | 'vendedor' | 'comprador';

export async function getUserRole(uid: string): Promise<AppRole> {
  const snap = await getDoc(doc(db, 'roles', uid));
  if (!snap.exists()) return 'comprador';
  return (snap.data().role as AppRole) ?? 'comprador';
}
