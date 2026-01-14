import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInvoice, getInvoiceDisplayStatus, InvoiceDisplay, InvoiceDetailActions, InvoicePublicLink } from '@/features/invoice'
import { StatusBadge } from '@/shared/components/ui'
import type { InvoiceStatus } from '@/shared/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getInvoice(id)
  const invoice = result.success ? result.data?.invoice : null

  return {
    title: invoice
      ? `Invoice ${invoice.invoice_number} - Simple Invoice`
      : 'Invoice Not Found',
  }
}

export default async function ViewInvoicePage({ params }: PageProps) {
  const { id } = await params
  const result = await getInvoice(id)

  if (!result.success || !result.data?.invoice) {
    notFound()
  }

  const invoice = result.data.invoice
  const displayStatus = getInvoiceDisplayStatus(invoice.status, invoice.due_date) as InvoiceStatus

  return (
    <div className="mx-auto max-w-4xl">
      <InvoiceDetailActions invoice={invoice} />

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <InvoiceDisplay
          invoice={invoice}
          showStatus
          statusBadge={<StatusBadge status={displayStatus} />}
        />
      </div>

      <InvoicePublicLink publicUrl={invoice.public_url} />
    </div>
  )
}
