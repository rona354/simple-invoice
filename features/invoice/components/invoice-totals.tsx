'use client'

import { formatCurrency, getLanguageLocale } from '@/shared/utils'
import { useTranslations, useLocale } from '@/shared/i18n'

interface InvoiceTotalsProps {
  subtotalCents: number
  discountCents: number
  taxRate: number
  taxCents: number
  totalCents: number
  currency: string
}

export function InvoiceTotals({
  subtotalCents,
  discountCents,
  taxRate,
  taxCents,
  totalCents,
  currency,
}: InvoiceTotalsProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const formatLocale = getLanguageLocale(locale)

  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t('invoice.subtotal')}</span>
          <span>{formatCurrency(subtotalCents, currency, formatLocale)}</span>
        </div>

        {discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('invoice.discount')}</span>
            <span className="text-red-600">
              -{formatCurrency(discountCents, currency, formatLocale)}
            </span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('invoice.taxPercent', { value: taxRate })}</span>
            <span>{formatCurrency(taxCents, currency, formatLocale)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold">
            <span>{t('invoice.total')}</span>
            <span data-testid="total">
              {formatCurrency(totalCents, currency, formatLocale)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
