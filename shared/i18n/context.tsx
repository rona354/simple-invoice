'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Locale } from './config'
import { defaultLocale, isValidLocale } from './config'
import { translate } from './translations'

const LOCALE_COOKIE = 'NEXT_LOCALE'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
    ?.split('=')[1]

  if (cookie && isValidLocale(cookie)) {
    return cookie
  }

  return defaultLocale
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365}`
}

interface LocaleProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(getInitialLocale())
    }
    setMounted(true)
  }, [initialLocale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleCookie(newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, params)
    },
    [locale]
  )

  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: initialLocale ?? defaultLocale, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}

export function useTranslations() {
  const { t } = useLocale()
  return t
}
