export const SUPPORTED_LOCALES = [
  'en-US', 'en-GB', 'id-ID', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP',
] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_OPTIONS = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'id-ID', label: 'Indonesian' },
  { value: 'de-DE', label: 'German' },
  { value: 'fr-FR', label: 'French' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'ja-JP', label: 'Japanese' },
] as const satisfies readonly { value: Locale; label: string }[]

export const SUPPORTED_DATE_FORMATS = [
  'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY',
] as const

export type DateFormat = (typeof SUPPORTED_DATE_FORMATS)[number]

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
] as const satisfies readonly { value: DateFormat; label: string }[]
