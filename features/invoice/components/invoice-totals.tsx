'use client'

import { formatCurrency } from '@/shared/utils'

interface InvoiceTotalsProps {
  subtotalCents: number
  discountCents: number
  taxRate: number
  taxCents: number
  totalCents: number
  currency: string
  locale?: string
}

export function InvoiceTotals({
  subtotalCents,
  discountCents,
  taxRate,
  taxCents,
  totalCents,
  currency,
  locale = 'en-US',
}: InvoiceTotalsProps) {
  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatCurrency(subtotalCents, currency, locale)}</span>
        </div>

        {discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span className="text-red-600">
              -{formatCurrency(discountCents, currency, locale)}
            </span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax ({taxRate}%)</span>
            <span>{formatCurrency(taxCents, currency, locale)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span data-testid="total">
              {formatCurrency(totalCents, currency, locale)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
