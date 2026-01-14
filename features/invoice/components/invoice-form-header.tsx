'use client'

import { useTranslations } from '@/shared/i18n'

interface InvoiceFormHeaderProps {
  mode: 'new' | 'edit'
  invoiceNumber?: string
}

export function InvoiceFormHeader({ mode, invoiceNumber }: InvoiceFormHeaderProps) {
  const t = useTranslations()

  const title = mode === 'edit'
    ? `${t('invoice.editInvoice')} ${invoiceNumber}`
    : t('invoice.newInvoice')

  const subtitle = mode === 'edit'
    ? t('invoice.editInvoiceSubtitle')
    : t('invoice.newInvoiceSubtitle')

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}
