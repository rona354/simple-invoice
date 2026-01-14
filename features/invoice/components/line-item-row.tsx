'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Input } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'
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
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
        <Input
          placeholder="Description"
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
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
