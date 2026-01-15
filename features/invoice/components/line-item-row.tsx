'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'
import { useTranslations } from '@/shared/i18n'
import type { InvoiceFormData } from '../schema'

interface LineItemRowProps {
  index: number
  register: UseFormRegister<InvoiceFormData>
  onRemove: () => void
  canRemove: boolean
  currency: string
  locale?: string
  amount: number
}

export function LineItemRow({
  index,
  register,
  onRemove,
  canRemove,
  currency,
  locale = 'en-US',
  amount,
}: LineItemRowProps) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
        <Input
          placeholder={t('invoice.descriptionPlaceholder')}
          {...register(`items.${index}.description`)}
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Qty"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Rate"
          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
        />
      </div>
      <div className="col-span-2 flex items-center justify-end h-10 text-sm font-medium">
        {formatCurrency(amount, currency, locale)}
      </div>
      <div className="col-span-1 flex items-center justify-center h-10">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
            aria-label={t('invoice.removeItem')}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
