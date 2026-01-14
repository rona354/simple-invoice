'use client'

import Link from 'next/link'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'

export function InvoicesPageHeader() {
  const t = useTranslations()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('invoice.invoices')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('dashboard.invoicesSubtitle')}</p>
      </div>
      <Link href="/invoices/new">
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t('invoice.newInvoice')}
        </Button>
      </Link>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  )
}
