import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { GuestInvoiceDisplay } from '@/features/guest/components/guest-invoice-display'
import { GuestPdfDownload } from '@/features/guest/components/guest-pdf-download'
import type { GuestInvoice } from '@/features/guest'

interface PageProps {
  params: Promise<{ invoiceId: string }>
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getGuestInvoice(invoiceId: string): Promise<GuestInvoice | null> {
  const { data, error } = await supabase
    .from('guest_attempts')
    .select('invoice_data')
    .eq('invoice_id', invoiceId)
    .single()

  if (error || !data?.invoice_data) {
    return null
  }

  return data.invoice_data as GuestInvoice
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { invoiceId } = await params
  const invoice = await getGuestInvoice(invoiceId)

  return {
    title: invoice
      ? `Invoice ${invoice.number} - ${invoice.from.name}`
      : 'Invoice Not Found',
  }
}

export default async function GuestPublicInvoicePage({ params }: PageProps) {
  const { invoiceId } = await params
  const invoice = await getGuestInvoice(invoiceId)

  if (!invoice) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-end">
          <GuestPdfDownload
            invoice={invoice}
            invoiceId={invoiceId}
          />
        </div>

        <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          <GuestInvoiceDisplay invoice={invoice} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Simple Invoice
        </p>
      </div>
    </div>
  )
}
