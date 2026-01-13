import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getInvoice, PdfDownload, getInvoiceDisplayStatus } from '@/features/invoice'
import { Button, Badge } from '@/shared/components/ui'
import { formatCurrency, formatDate } from '@/shared/utils'

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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            <Badge variant={getStatusVariant(displayStatus)}>{displayStatus}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Issued on {formatDate(invoice.issue_date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <PdfDownload invoice={invoice} />
        </div>
      </div>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="mb-2 text-sm font-medium text-gray-500">From</h2>
            <div className="text-sm">
              <p className="font-semibold">{invoice.profile.business_name || 'Your Business'}</p>
              {invoice.profile.business_address && <p>{invoice.profile.business_address}</p>}
              {invoice.profile.business_email && <p>{invoice.profile.business_email}</p>}
              {invoice.profile.business_phone && <p>{invoice.profile.business_phone}</p>}
              {invoice.profile.tax_id && (
                <p>{invoice.profile.tax_id_label}: {invoice.profile.tax_id}</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-gray-500">Bill To</h2>
            <div className="text-sm">
              <p className="font-semibold">{invoice.client_name}</p>
              {invoice.client_address && <p>{invoice.client_address}</p>}
              {invoice.client_email && <p>{invoice.client_email}</p>}
              {invoice.client_phone && <p>{invoice.client_phone}</p>}
              {invoice.client_tax_id && <p>Tax ID: {invoice.client_tax_id}</p>}
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm text-gray-500">Invoice Number</p>
            <p className="font-medium">{invoice.invoice_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issue Date</p>
            <p className="font-medium">{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium">{invoice.due_date ? formatDate(invoice.due_date) : '-'}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 text-left font-medium text-gray-500">Description</th>
                <th className="pb-2 text-right font-medium text-gray-500">Qty</th>
                <th className="pb-2 text-right font-medium text-gray-500">Rate</th>
                <th className="pb-2 text-right font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.unit_price_cents, invoice.currency)}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.amount_cents, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-gray-200 pt-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal_cents, invoice.currency)}</span>
            </div>
            {invoice.discount_cents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600">
                  -{formatCurrency(invoice.discount_cents, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_cents, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_cents, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.payment_instructions) && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {invoice.notes && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.payment_instructions && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">Payment Instructions</h3>
                <p className="text-sm whitespace-pre-wrap">{invoice.payment_instructions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          Back to Dashboard
        </Link>
        <div className="text-sm text-gray-500">
          Public link:{' '}
          <a
            href={invoice.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            {invoice.public_url}
          </a>
        </div>
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
