'use client'

import { InvoiceCard } from './invoice-card'
import { SkeletonCard } from '@/shared/components/ui'
import type { Invoice } from '../types'

interface InvoiceListProps {
  invoices: Invoice[]
  locale?: string
  isLoading?: boolean
}

export function InvoiceList({
  invoices,
  locale = 'en-US',
  isLoading = false,
}: InvoiceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No invoices</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new invoice.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} locale={locale} />
      ))}
    </div>
  )
}
