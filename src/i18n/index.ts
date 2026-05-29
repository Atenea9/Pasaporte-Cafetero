import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import pt from './locales/pt.json';
import it from './locales/it.json';

const SUPPORTED = ['es', 'en', 'fr', 'de', 'zh', 'pt', 'it'] as const;
const LANG_STORAGE_KEY = '@app_language';
type SupportedLang = (typeof SUPPORTED)[number];

function detectDeviceLanguage(): SupportedLang {
  try {
    const Localization = require('expo-localization');
    const getLocales = Localization.getLocales ?? Localization.default?.getLocales;
    if (typeof getLocales !== 'function') return 'es';
    const locales = getLocales();
    const tag: string = locales?.[0]?.languageTag ?? 'es';
    const code = tag.split('-')[0] as SupportedLang;
    return SUPPORTED.includes(code) ? code : 'es';
  } catch {
    return 'es';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    zh: { translation: zh },
    pt: { translation: pt },
    it: { translation: it },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export async function initSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved as SupportedLang)) {
      await i18n.changeLanguage(saved);
    }
  } catch {
  }
}

export async function changeAndSaveLanguage(lng: string): Promise<void> {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANG_STORAGE_KEY, lng);
  } catch {
  }
}

export default i18n;
export { SUPPORTED };
export type { SupportedLang };
