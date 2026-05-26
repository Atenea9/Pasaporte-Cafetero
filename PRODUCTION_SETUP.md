# Pasaporte Cafetero del Tolima — Production Setup Guide

This document explains every fix applied to the project and the steps
required to take the app from its demo state to a fully functional
production deployment.

---

## ✅ Fix 1 — Replit Deployment (`.replit`)

**Problem:** Two blocking issues prevented publishing on Replit.

| # | Issue | Fix applied |
|---|-------|-------------|
| 1 | `deploymentTarget = "cloudrun"` is not a valid Replit target | Changed to `"static"` |
| 2 | No `build` or `run` command set for production | Added `build` command and `publicDir = "dist"` |

The corrected `.replit` file:

```toml
[deployment]
deploymentTarget = "static"
build = ["sh", "-c", "npm install && npx expo export --platform web"]
publicDir = "dist"
```

The `expo export --platform web` command was already confirmed working and
outputs static files to `dist/`, which Replit's static hosting serves directly.

---

## 🔴 Fix 2 — Real Backend (Firebase Firestore)

**Files added:** `src/services/firebase.ts`, `src/services/db.service.ts`

### Setup steps

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a project named `PasaporteCafetero2025` (or similar).
3. Enable **Firestore Database** in Native mode, region `us-central1`.
4. In Project Settings → Your apps → Web, register a Web app and copy the config.
5. Paste the config into `src/services/firebase.ts` replacing the placeholder values.
6. Install the package:
   ```bash
   npx expo install firebase
   ```

### Firestore collection structure

```
usuarios/
  {cedula}/                     ← visitor document
    nombre, whatsapp, municipio, puntos, sellos[], nivel, expoPushToken

transacciones/
  {auto-id}/                    ← one doc per stamp/purchase
    cedula, tipo, standId, puntos, monto, fecha, descripcion

stands/
  {id}/                         ← created by Admin
    nombre, municipioId, activo, productos[]

subastas/
  {id}/                         ← auction lot
    lote, descripcion, ofertaBase, ofertaActual, mejorPostor, activa
    pujas/ (subcollection)
      {auto-id}/ cedula, nombre, monto, timestamp

config/
  app/                          ← global flags
    happyHour: boolean, eventActive: boolean
```

### Firestore security rules (recommended starting point)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Visitors can read/write their own document
    match /usuarios/{cedula} {
      allow read, write: if request.auth != null && request.auth.uid == cedula;
    }
    // Vendedores (sellers) can write transactions
    match /transacciones/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role in ['vendedor', 'admin'];
    }
    // Config readable by all authenticated users
    match /config/app {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'admin';
    }
    match /subastas/{sid} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'admin';
      match /pujas/{pid} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
      }
    }
  }
}
```

---

## 🔴 Fix 3 — Real Authentication (Firebase Phone Auth)

**File added:** `src/services/auth.service.ts`

Replaces the insecure hardcoded PIN `2025` for Vendedor/Admin access.

### Setup steps

1. Firebase Console → Authentication → Sign-in method → enable **Phone**.
2. For development, add test numbers (e.g. `+57 315 123 4567` with code `123456`)
   so you don't burn SMS quota during testing.
3. In `VendedorScreen.tsx`, replace the `PinScreen` component with a phone
   OTP flow using `sendOTP` / `verifyOTP` from `auth.service.ts`.
4. Assign roles in the Firestore `roles/{uid}` collection:
   - `{ role: 'admin' }` for event administrators
   - `{ role: 'vendedor' }` for stand sellers
   - `{ role: 'comprador' }` for visitors (default)

---

## 🔴 Fix 4 — Real QR Scanner

**File added:** `src/components/QRScanner.tsx`

Replaces the deprecated `expo-barcode-scanner` (simulator) with `expo-camera`'s
`CameraView` + `onBarcodeScanned`.

### Setup steps

```bash
npx expo install expo-camera
```

`app.json` has already been updated — `expo-barcode-scanner` removed,
`expo-camera` added.

### Integration in `VendedorScreen.tsx`

```tsx
import QRScanner from '../components/QRScanner';

// Inside your component:
{scanning && (
  <QRScanner
    onScanned={(cedula) => { setScanning(false); handleLookupCedula(cedula); }}
    onClose={() => setScanning(false)}
  />
)}
```

The QR payload expected is JSON: `{ "cedula": "1234567890" }`, which is
what `react-native-qrcode-svg` generates in `PasaporteScreen` when you
pass the JSON string as the `value` prop.

---

## 🟡 Fix 5 — Real-time Auction (Firestore `onSnapshot`)

**File added:** `src/hooks/useRealtimeAuction.ts`

Replaces static mock auction data with live Firestore listeners.
Every connected device sees bid updates within ~300 ms — no WebSocket
server required.

### Integration

```tsx
import { useRealtimeAuction } from '../hooks/useRealtimeAuction';

function SubastaScreen() {
  const { subasta, pujas, loading } = useRealtimeAuction();
  // subasta.ofertaActual and pujas[] update automatically
}
```

---

## 🟡 Fix 6 — Offline Mode (AsyncStorage Queue)

**File added:** `src/services/offlineSync.service.ts`

### Setup steps

```bash
npx expo install @react-native-community/netinfo
```

In `AppContext.tsx`, add to the `AppProvider` component:

```tsx
import { initOfflineSync } from '../services/offlineSync.service';

useEffect(() => {
  const unsub = initOfflineSync();
  return () => unsub();
}, []);
```

All calls to `addTransaccion` and `actualizarPuntosYSello` in `db.service.ts`
should be wrapped with `enqueue(...)` first so they survive connectivity loss.

---

## 🟡 Fix 7 — Exportable PDF Passport

**File added:** `src/services/passport.export.ts`

### Setup steps

```bash
npx expo install expo-print expo-sharing
```

In `PasaporteScreen.tsx`, add a share button:

```tsx
import { exportPassportPDF } from '../services/passport.export';

<TouchableOpacity onPress={() => exportPassportPDF(usuario)}>
  <Text>📄 Exportar Pasaporte PDF</Text>
</TouchableOpacity>
```

---

## 🟡 Fix 8 — Push Notifications

**File added:** `src/services/notifications.service.ts`

### Setup steps

```bash
npx expo install expo-notifications expo-device
```

1. After visitor registration, call:
   ```ts
   await registerForPushNotifications(usuario.cedula);
   ```
2. `app.json` already has the `expo-notifications` plugin configured.
3. For iOS you'll need a physical device — notifications don't work in
   the iOS simulator.
4. For server-side sends (e.g. "Happy Hour started" to ALL users), use a
   Firebase Cloud Function that reads all `expoPushToken` fields and POSTs
   to `https://exp.host/--/api/v2/push/send`.

---

## Package installation summary

Run this once after cloning or downloading the updated project:

```bash
npm install
npx expo install \
  firebase \
  expo-camera \
  expo-notifications \
  expo-device \
  expo-print \
  expo-sharing \
  @react-native-community/netinfo
```

---

## Environment variables (recommended for production)

Never commit your Firebase API key to version control.
Create a `.env` file (git-ignored) and read it via `expo-constants`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

Then in `firebase.ts`:
```ts
apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
```

Expo automatically exposes `EXPO_PUBLIC_*` variables to the client bundle.
