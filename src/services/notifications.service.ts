/**
 * notifications.service.ts
 * -------------------------------------------------
 * Push notifications via expo-notifications (Expo Push / FCM).
 *
 * INSTALL:
 *   npx expo install expo-notifications expo-device
 *
 * SETUP:
 *   1. In app.json add:
 *        "plugins": ["expo-notifications"]
 *      and configure android.googleServicesFile / ios.googleServicesFile
 *      with your Firebase google-services.json / GoogleService-Info.plist.
 *   2. In Firestore, store each user's push token at:
 *        usuarios/{cedula}/expoPushToken
 *   3. Send notifications from a server / Cloud Function using the
 *      Expo Push API: https://exp.host/--/api/v2/push/send
 *
 * CLIENT-SIDE (this file) — registers the token and handles
 * foreground notification display.
 *
 * EVENTS THAT TRIGGER NOTIFICATIONS:
 *   - Visitor earns a new stamp            → stampEarned()
 *   - Happy Hour starts/ends               → happyHourAlert()
 *   - Visitor's auction bid is outbid      → outbidAlert()
 * -------------------------------------------------
 */

import * as Notifications from 'expo-notifications';
import * as Device        from 'expo-device';
import { Platform }       from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db }             from './firebase';

// Display banners in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

/**
 * Request permission and register the device's Expo push token.
 * Persists the token to Firestore so the backend/Cloud Function can
 * send targeted notifications to this visitor.
 *
 * Call once after the user registers (RegistroScreen).
 */
export async function registerForPushNotifications(cedula: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Push] Must be a physical device for push notifications.');
    return null;
  }

  // Android channel (required for Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:      'Pasaporte Cafetero',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C8860A',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted.');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    // Replace with your Expo project ID from app.json or EAS dashboard
    projectId: 'YOUR_EXPO_PROJECT_ID',
  });

  const token = tokenData.data;

  // Persist to Firestore so Cloud Functions can reach this device
  try {
    await updateDoc(doc(db, 'usuarios', cedula), { expoPushToken: token });
  } catch (err) {
    console.warn('[Push] Failed to save token to Firestore:', err);
  }

  return token;
}

// ─── Local notification helpers ───────────────────────────────────────────────
// These fire instantly on the device without a server round-trip.
// Useful for immediate feedback like "¡Obtuviste un sello nuevo!".

/** Notify the visitor they earned a new stamp. */
export async function stampEarned(municipioName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Nuevo sello obtenido! ☕',
      body:  `Acabas de sellar tu pasaporte con ${municipioName}. ¡Sigue coleccionando!`,
      data:  { screen: 'pasaporte' },
    },
    trigger: null, // fire immediately
  });
}

/** Alert that Happy Hour has started. */
export async function happyHourAlert(activo: boolean): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: activo ? '🎉 ¡Happy Hour activado!' : 'Happy Hour terminó',
      body:  activo
        ? '¡Doble puntos por los próximos 30 minutos! Visita los stands ahora.'
        : 'El Happy Hour terminó. Revisa tu puntaje acumulado.',
      data: { screen: 'home' },
    },
    trigger: null,
  });
}

/** Notify a bidder they have been outbid. */
export async function outbidAlert(nuevaOferta: number, nuevoPostor: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📦 Tu oferta fue superada',
      body:  `${nuevoPostor} ofreció $${nuevaOferta.toLocaleString('es-CO')} COP. ¡Puja de nuevo!`,
      data:  { screen: 'subasta' },
    },
    trigger: null,
  });
}
