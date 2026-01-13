'use client'

import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select } from '@/shared/components/ui'
import { CURRENCY_OPTIONS } from '@/shared/config'
import { ClientAutocomplete } from '@/features/client'
import { useInvoiceForm, useInvoiceTotals, useInvoiceSubmit } from '../hooks'
import { createInvoice, updateInvoice } from '../actions'
import { LineItemRow } from './line-item-row'
import { InvoiceTotals } from './invoice-totals'
import type { Invoice, Profile } from '../types'
import type { Client } from '@/features/client'

interface InvoiceFormProps {
  profile?: Profile | null
  invoice?: Invoice | null
}

export function InvoiceForm({ profile, invoice }: InvoiceFormProps) {
  const router = useRouter()
  const { form, fields, addItem, removeItem, isEditMode } = useInvoiceForm({
    profile,
    invoice,
  })
  const totals = useInvoiceTotals(form)
  const { isSubmitting, error, handleSubmit } = useInvoiceSubmit()

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const currency = watch('currency')
  const items = watch('items')

  function handleClientSelect(client: Client) {
    setValue('client_name', client.name)
    setValue('client_email', client.email ?? '')
    setValue('client_phone', client.phone ?? '')
    setValue('client_address', formatClientAddress(client))
    setValue('client_tax_id', client.tax_id ?? '')
  }

  function formatClientAddress(client: Client): string {
    const parts = [
      client.address,
      client.city,
      client.postal_code,
      client.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  async function onSubmit(data: Parameters<typeof createInvoice>[0]) {
    const result = await handleSubmit(async () => {
      if (isEditMode && invoice) {
        return updateInvoice(invoice.id, data)
      }
      return createInvoice(data)
    })

    if (result) {
      const targetId = isEditMode && invoice ? invoice.id : result.id
      router.push(`/invoices/${targetId}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={formHandleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ClientAutocomplete
            value={watch('client_name')}
            onChange={(value) => setValue('client_name', value)}
            onClientSelect={handleClientSelect}
            error={errors.client_name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="client@example.com"
            error={errors.client_email?.message}
            {...register('client_email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 234 567 8900"
            error={errors.client_phone?.message}
            {...register('client_phone')}
          />
          <Input
            label="Tax ID"
            placeholder="Tax ID / VAT number"
            error={errors.client_tax_id?.message}
            {...register('client_tax_id')}
          />
        </div>
        <Textarea
          label="Address"
          rows={2}
          placeholder="Street, City, Country"
          error={errors.client_address?.message}
          {...register('client_address')}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1" />
          </div>

          {fields.map((field, index) => {
            const qty = items[index]?.quantity ?? 0
            const price = items[index]?.unit_price ?? 0
            const amount = Math.round(qty * price * 100)

            return (
              <LineItemRow
                key={field.id}
                index={index}
                register={register}
                onRemove={() => removeItem(index)}
                canRemove={fields.length > 1}
                currency={currency}
                amount={amount}
              />
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Due Date"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
          <Select
            label="Currency"
            error={errors.currency?.message}
            options={CURRENCY_OPTIONS}
            {...register('currency')}
          />
          <Input
            label="Tax Rate (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            error={errors.tax_rate?.message}
            {...register('tax_rate', { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-2">
            <div className="w-32">
              <Select
                label="Discount"
                error={errors.discount_type?.message}
                options={[
                  { value: 'fixed', label: 'Fixed' },
                  { value: 'percentage', label: 'Percentage' },
                ]}
                {...register('discount_type')}
              />
            </div>
            <div className="flex-1">
              <Input
                label={watch('discount_type') === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                type="number"
                step="0.01"
                min="0"
                error={errors.discount_value?.message}
                {...register('discount_value', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </section>

      <InvoiceTotals
        subtotalCents={totals.subtotalCents}
        discountCents={totals.discountCents}
        taxRate={watch('tax_rate')}
        taxCents={totals.taxCents}
        totalCents={totals.totalCents}
        currency={currency}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
        <Textarea
          label="Notes"
          rows={3}
          placeholder="Any additional notes for the client"
          error={errors.notes?.message}
          {...register('notes')}
        />
        <Textarea
          label="Payment Instructions"
          rows={3}
          placeholder="Bank details, payment methods, etc."
          error={errors.payment_instructions?.message}
          {...register('payment_instructions')}
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditMode ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  )
}
