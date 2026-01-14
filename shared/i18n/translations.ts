import type { Locale } from './config'
import en from '@/messages/en.json'
import id from '@/messages/id.json'

export type Messages = typeof en

const messages: Record<Locale, Messages> = { en, id }

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? NestedKeyOf<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never
    }[keyof T]
  : never

export type TranslationKey = NestedKeyOf<Messages>

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const messagesForLocale = messages[locale]
  let text = getNestedValue(messagesForLocale as unknown as Record<string, unknown>, key)

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value))
    })
  }

  return text
}

export function createTranslator(locale: Locale) {
  return (key: string, params?: Record<string, string | number>) => translate(locale, key, params)
}
