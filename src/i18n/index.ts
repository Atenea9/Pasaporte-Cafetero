import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import pt from './locales/pt.json';
import it from './locales/it.json';

const SUPPORTED = ['es', 'en', 'fr', 'de', 'zh', 'pt', 'it'] as const;
type SupportedLang = (typeof SUPPORTED)[number];

function detectLanguage(): SupportedLang {
  const locales = Localization.getLocales();
  const tag = locales[0]?.languageTag ?? 'es';
  const code = tag.split('-')[0] as SupportedLang;
  return SUPPORTED.includes(code) ? code : 'es';
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
  lng: detectLanguage(),
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
export { SUPPORTED };
export type { SupportedLang };
