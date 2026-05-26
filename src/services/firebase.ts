/**
 * firebase.ts
 * -------------------------------------------------
 * Central Firebase initialisation for PasaporteCafetero.
 *
 * HOW TO SET UP:
 * 1. Create a project at https://console.firebase.google.com
 * 2. Enable Firestore, Authentication (Phone provider), and Storage.
 * 3. Copy your Web SDK config and replace the placeholder values below.
 * 4. Rename this file section or use environment variables in a .env file
 *    (with expo-constants) for production security.
 *
 * REQUIRED PACKAGES:
 *   npx expo install firebase
 * -------------------------------------------------
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ─── Replace with your actual Firebase project config ────────────────────────
const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};
// ─────────────────────────────────────────────────────────────────────────────

// Prevent re-initialisation in hot-reload environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
