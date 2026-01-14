import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInvoice, InvoiceForm, InvoiceFormHeader } from '@/features/invoice'
import { getProfile } from '@/features/profile'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getInvoice(id)
  const invoice = result.success ? result.data?.invoice : null

  return {
    title: invoice
      ? `Edit Invoice ${invoice.invoice_number} - Simple Invoice`
      : 'Invoice Not Found',
  }
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params
  const [invoiceResult, profileResult] = await Promise.all([
    getInvoice(id),
    getProfile(),
  ])

  if (!invoiceResult.success || !invoiceResult.data?.invoice) {
    notFound()
  }

  const invoice = invoiceResult.data.invoice
  const profile = profileResult.success ? profileResult.data?.profile : null

  return (
    <div className="mx-auto max-w-3xl">
      <InvoiceFormHeader mode="edit" invoiceNumber={invoice.invoice_number} />

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <InvoiceForm profile={profile} invoice={invoice} />
      </div>
    </div>
  )
}
