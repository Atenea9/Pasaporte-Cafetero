import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY            ?? 'YOUR_API_KEY',
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN        ?? 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         process.env.FIREBASE_PROJECT_ID         ?? 'YOUR_PROJECT_ID',
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     ?? 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_SENDER_ID',
  appId:             process.env.FIREBASE_APP_ID             ?? 'YOUR_APP_ID',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
