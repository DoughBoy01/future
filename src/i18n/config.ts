import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend) // Load translations via HTTP from public/locales
  .use(LanguageDetector) // Auto-detect user's language
  .use(initReactI18next) // React bindings
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV, // Show debug logs in development

    // Supported languages: English, Spanish, Japanese, Chinese
    supportedLngs: ['en', 'es', 'ja', 'zh'],

    // Namespaces for code splitting
    ns: ['common', 'home', 'camps', 'forms', 'auth', 'marketing', 'errors', 'advisor'],
    defaultNS: 'common',

    // Backend configuration - load from public folder
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Language detection configuration
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Cache user's language choice in localStorage
      caches: ['localStorage'],
      lookupLocalStorage: 'userLanguage',

      // Don't use cookies for GDPR compliance
      lookupCookie: undefined,
    },

    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already escapes values to prevent XSS
    },

    // React-specific configuration
    react: {
      useSuspense: true, // Use React Suspense for loading states
    },
  });

export default i18n;
