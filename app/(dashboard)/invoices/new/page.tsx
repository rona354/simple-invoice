import { Metadata } from 'next'
import { InvoiceForm, InvoiceFormHeader } from '@/features/invoice'
import { getProfile } from '@/features/profile'

export const metadata: Metadata = {
  title: 'New Invoice - Simple Invoice',
  description: 'Create a new invoice',
}

export default async function NewInvoicePage() {
  const result = await getProfile()
  const profile = result.success ? result.data?.profile : null

  return (
    <div className="mx-auto max-w-3xl">
      <InvoiceFormHeader mode="new" />

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <InvoiceForm profile={profile} />
      </div>
    </div>
  )
}
