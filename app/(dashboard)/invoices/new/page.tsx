import { Metadata } from 'next'
import { InvoiceForm } from '@/features/invoice'
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new invoice for your client
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <InvoiceForm profile={profile} />
      </div>
    </div>
  )
}
