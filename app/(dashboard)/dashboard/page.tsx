import { Metadata } from 'next'
import { getInvoices, InvoiceList, InvoicesPageHeader } from '@/features/invoice'

export const metadata: Metadata = {
  title: 'Dashboard - Simple Invoice',
  description: 'View and manage your invoices',
}

export default async function DashboardPage() {
  const result = await getInvoices({ limit: 20 })

  const invoices = result.success ? result.data?.invoices ?? [] : []

  return (
    <div className="space-y-6">
      <InvoicesPageHeader />
      <InvoiceList invoices={invoices} />
    </div>
  )
}
