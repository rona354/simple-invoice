import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicInvoice, PdfDownload, InvoiceDisplay } from '@/features/invoice'
import { Badge } from '@/shared/components/ui'

interface PageProps {
  params: Promise<{ publicId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params
  const result = await getPublicInvoice(publicId)
  const invoice = result.success ? result.data?.invoice : null

  return {
    title: invoice
      ? `Invoice ${invoice.invoice_number} - ${invoice.profile.business_name || 'Simple Invoice'}`
      : 'Invoice Not Found',
  }
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { publicId } = await params
  const result = await getPublicInvoice(publicId)

  if (!result.success || !result.data?.invoice) {
    notFound()
  }

  const invoice = result.data.invoice
  const isPaid = invoice.status === 'paid'
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid

  const getStatusBadge = () => {
    if (isPaid) return <Badge variant="success">PAID</Badge>
    if (isOverdue) return <Badge variant="error">OVERDUE</Badge>
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-end">
          <PdfDownload publicId={invoice.public_id} variant="outline" size="sm" />
        </div>

        <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          <InvoiceDisplay
            invoice={invoice}
            showStatus
            statusBadge={getStatusBadge()}
          />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Simple Invoice
        </p>
      </div>
    </div>
  )
}
