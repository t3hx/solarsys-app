/**
 * @module i18n
 * @description Internationalisation (react-i18next) avec les memes fichiers JSON que la
 * version Vue. Langue detectee depuis le choix persiste (localStorage) puis le navigateur,
 * repli sur l'anglais.
 */
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '@/i18n/locales/en.json'
import fr from '@/i18n/locales/fr.json'

export const supportedLocales = ['en', 'fr'] as const
export type Locale = (typeof supportedLocales)[number]
export const LOCALE_STORAGE_KEY = 'solarsys_locale'

export const i18n = i18next

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    supportedLngs: [...supportedLocales],
    fallbackLng: 'en',
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  })

/** ~ Nom traduit d'un corps, ou le nom des donnees s'il n'y a pas de traduction. */
export function bodyDisplayName(id: string, fallback: string): string {
  const key = `bodies.${id}.name`
  return i18n.exists(key) ? i18n.t(key) : fallback
}
