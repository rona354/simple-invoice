'use client'

import { useTranslations } from '@/shared/i18n'

export function SettingsPageHeader() {
  const t = useTranslations()

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('settings.subtitle')}</p>
    </div>
  )
}

export function SettingsLogoSection({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('settings.businessLogo')}</h2>
      {children}
    </div>
  )
}

export function SettingsLoadError() {
  const t = useTranslations()

  return (
    <div className="text-center py-12">
      <p className="text-red-600">{t('settings.failedToLoad')}</p>
    </div>
  )
}
