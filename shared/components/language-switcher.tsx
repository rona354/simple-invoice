'use client'

import { useState } from 'react'
import { useLocale } from '@/shared/i18n'
import { locales, localeFlags, localeNames, type Locale } from '@/shared/i18n'
import { cn } from '@/shared/utils'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  function handleSelect(newLocale: Locale) {
    setLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        aria-label="Select language"
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        <ChevronIcon className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelect(loc)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100',
                  locale === loc ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                )}
              >
                <span className="text-base">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}
