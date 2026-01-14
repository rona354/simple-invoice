export const locales = ['en', 'id'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Indonesia',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  id: '🇮🇩',
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleFromString(value: string | null | undefined): Locale {
  if (value && isValidLocale(value)) {
    return value
  }
  return defaultLocale
}
