import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getInvoice, PdfDownload, getInvoiceDisplayStatus, InvoiceDisplay } from '@/features/invoice'
import { Button, Badge } from '@/shared/components/ui'

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
  const displayStatus = getInvoiceDisplayStatus(invoice.status, invoice.due_date)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <PdfDownload invoiceId={invoice.id} size="sm" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <InvoiceDisplay
          invoice={invoice}
          showStatus
          statusBadge={<Badge variant={getStatusVariant(displayStatus)}>{displayStatus}</Badge>}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Public link:{' '}
          <a
            href={invoice.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            {invoice.public_url}
          </a>
        </p>
      </div>
    </div>
  )
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'draft':
      return 'secondary'
    case 'sent':
      return 'warning'
    case 'viewed':
      return 'default'
    case 'paid':
      return 'success'
    case 'overdue':
      return 'error'
    case 'cancelled':
      return 'secondary'
    default:
      return 'default'
  }
}
