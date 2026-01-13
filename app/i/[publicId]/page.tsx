import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicInvoice, PdfDownload } from '@/features/invoice'
import { Badge } from '@/shared/components/ui'
import { formatCurrency, formatDate } from '@/shared/utils'

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Invoice {invoice.invoice_number}
                </h1>
                <p className="text-sm text-gray-500">
                  From {invoice.profile.business_name || 'Unknown Business'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isPaid && (
                  <Badge variant="success">PAID</Badge>
                )}
                {isOverdue && (
                  <Badge variant="error">OVERDUE</Badge>
                )}
                <PdfDownload invoice={invoice} variant="outline" size="sm" />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  From
                </h2>
                <div className="text-sm">
                  <p className="font-semibold">{invoice.profile.business_name || 'Your Business'}</p>
                  {invoice.profile.business_address && <p>{invoice.profile.business_address}</p>}
                  {invoice.profile.business_city && (
                    <p>
                      {invoice.profile.business_city}
                      {invoice.profile.business_postal_code && `, ${invoice.profile.business_postal_code}`}
                    </p>
                  )}
                  {invoice.profile.business_country && <p>{invoice.profile.business_country}</p>}
                  {invoice.profile.business_email && <p className="mt-2">{invoice.profile.business_email}</p>}
                  {invoice.profile.business_phone && <p>{invoice.profile.business_phone}</p>}
                  {invoice.profile.tax_id && (
                    <p className="mt-2">{invoice.profile.tax_id_label}: {invoice.profile.tax_id}</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Bill To
                </h2>
                <div className="text-sm">
                  <p className="font-semibold">{invoice.client_name}</p>
                  {invoice.client_address && <p className="whitespace-pre-wrap">{invoice.client_address}</p>}
                  {invoice.client_email && <p className="mt-2">{invoice.client_email}</p>}
                  {invoice.client_phone && <p>{invoice.client_phone}</p>}
                  {invoice.client_tax_id && <p className="mt-2">Tax ID: {invoice.client_tax_id}</p>}
                </div>
              </section>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Invoice Number</p>
                <p className="mt-1 font-medium">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Issue Date</p>
                <p className="mt-1 font-medium">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Due Date</p>
                <p className={`mt-1 font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Description
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                      Qty
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                      Rate
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.unit_price_cents, invoice.currency)}
                      </td>
                      <td className="py-3 text-right">
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
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total_cents, invoice.currency)}</span>
                </div>
                {isPaid && invoice.paid_date && (
                  <div className="text-center pt-2">
                    <span className="inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Paid on {formatDate(invoice.paid_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(invoice.notes || invoice.payment_instructions) && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {invoice.notes && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.payment_instructions && (
                  <div>
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Payment Instructions
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{invoice.payment_instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Powered by Simple Invoice
        </p>
      </div>
    </div>
  )
}
