'use client'

import Link from 'next/link'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'
import { WhatsAppSend } from './whatsapp-send'
import { PdfShare } from '../pdf/pdf-share'
import { PdfDownload } from '../pdf/pdf-download'
import type { Invoice } from '../types'

interface InvoiceDetailActionsProps {
  invoice: Invoice
}

export function InvoiceDetailActions({ invoice }: InvoiceDetailActionsProps) {
  const t = useTranslations()

  return (
    <div className="mb-6 flex items-center justify-between">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
        {t('common.backToDashboard')}
      </Link>
      <div className="flex gap-2">
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-400 h-8 px-3 text-sm"
        >
          {t('common.edit')}
        </Link>
        <WhatsAppSend invoice={invoice} size="sm" />
        <PdfShare invoiceId={invoice.id} invoiceNumber={invoice.invoice_number} size="sm" />
        <PdfDownload invoiceId={invoice.id} size="sm" />
      </div>
    </div>
  )
}

interface InvoicePublicLinkProps {
  publicUrl: string
}

export function InvoicePublicLink({ publicUrl }: InvoicePublicLinkProps) {
  const t = useTranslations()

  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-gray-500">
        {t('common.publicLink')}{' '}
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          {publicUrl}
        </a>
      </p>
    </div>
  )
}
