'use client'

import Link from 'next/link'
import { Card, StatusBadge } from '@/shared/components/ui'
import { formatCurrency, formatDate, getLanguageLocale } from '@/shared/utils'
import { useTranslations, useLocale } from '@/shared/i18n'
import { getInvoiceDisplayStatus } from '../utils'
import type { Invoice } from '../types'
import type { InvoiceStatus } from '@/shared/types'

interface InvoiceCardProps {
  invoice: Invoice
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const dateLocale = getLanguageLocale(locale)
  const displayStatus = getInvoiceDisplayStatus(
    invoice.status,
    invoice.due_date
  ) as InvoiceStatus

  return (
    <Link href={`/invoices/${invoice.id}`}>
      <Card className="p-4 hover:border-gray-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{invoice.invoice_number}</p>
            <p className="text-sm text-gray-500">{invoice.client_name}</p>
          </div>
          <StatusBadge status={displayStatus} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-semibold">
            {formatCurrency(invoice.total_cents, invoice.currency, dateLocale)}
          </p>
          <p className="text-sm text-gray-500">
            {invoice.due_date
              ? `${t('invoice.due')} ${formatDate(invoice.due_date, dateLocale)}`
              : formatDate(invoice.issue_date, dateLocale)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
