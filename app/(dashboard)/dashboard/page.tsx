import { Metadata } from 'next'
import Link from 'next/link'
import { getInvoices, InvoiceList } from '@/features/invoice'
import { Button } from '@/shared/components/ui'

export const metadata: Metadata = {
  title: 'Dashboard - Simple Invoice',
  description: 'View and manage your invoices',
}

export default async function DashboardPage() {
  const result = await getInvoices({ limit: 20 })

  const invoices = result.success ? result.data?.invoices ?? [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your invoices and track payments
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <InvoiceList invoices={invoices} />
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  )
}
