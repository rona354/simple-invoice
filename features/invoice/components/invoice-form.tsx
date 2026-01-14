'use client'

import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select } from '@/shared/components/ui'
import { CURRENCY_OPTIONS } from '@/shared/config'
import { ClientAutocomplete } from '@/features/client'
import { useInvoiceForm, useInvoiceTotals, useInvoiceSubmit } from '../hooks'
import { createInvoice, updateInvoice } from '../actions'
import { LineItemRow } from './line-item-row'
import { InvoiceTotals } from './invoice-totals'
import { useTranslations } from '@/shared/i18n'
import type { Invoice, Profile } from '../types'
import type { Client } from '@/features/client'

interface InvoiceFormProps {
  profile?: Profile | null
  invoice?: Invoice | null
}

export function InvoiceForm({ profile, invoice }: InvoiceFormProps) {
  const router = useRouter()
  const t = useTranslations()
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
        <h2 className="text-lg font-semibold text-gray-900">{t('invoice.clientInfo')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ClientAutocomplete
            value={watch('client_name')}
            onChange={(value) => setValue('client_name', value)}
            onClientSelect={handleClientSelect}
            error={errors.client_name?.message}
          />
          <Input
            label={t('invoice.clientEmail')}
            type="email"
            placeholder="client@example.com"
            error={errors.client_email?.message}
            {...register('client_email')}
          />
          <Input
            label={t('invoice.clientPhone')}
            type="tel"
            placeholder="+1 234 567 8900"
            error={errors.client_phone?.message}
            {...register('client_phone')}
          />
          <Input
            label={t('invoice.clientTaxId')}
            placeholder={t('invoice.clientTaxId')}
            error={errors.client_tax_id?.message}
            {...register('client_tax_id')}
          />
        </div>
        <Textarea
          label={t('invoice.clientAddress')}
          rows={2}
          placeholder={t('invoice.clientAddress')}
          error={errors.client_address?.message}
          {...register('client_address')}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('invoice.lineItems')}</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            {t('invoice.addItem')}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
            <div className="col-span-5">{t('invoice.description')}</div>
            <div className="col-span-2">{t('invoice.quantity')}</div>
            <div className="col-span-2">{t('invoice.rate')}</div>
            <div className="col-span-2 text-right">{t('invoice.amount')}</div>
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
        <h2 className="text-lg font-semibold text-gray-900">{t('invoice.invoiceDetails')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t('invoice.dueDate')}
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
          <Select
            label={t('invoice.currency')}
            error={errors.currency?.message}
            options={CURRENCY_OPTIONS}
            {...register('currency')}
          />
          <Input
            label={t('invoice.taxRate')}
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
                label={t('invoice.discount')}
                error={errors.discount_type?.message}
                options={[
                  { value: 'fixed', label: t('invoice.discountFixed') },
                  { value: 'percentage', label: t('invoice.discountPercentage') },
                ]}
                {...register('discount_type')}
              />
            </div>
            <div className="flex-1">
              <Input
                label={watch('discount_type') === 'percentage' ? t('invoice.discountPercent', { value: '' }) : t('invoice.discountAmount')}
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
        <h2 className="text-lg font-semibold text-gray-900">{t('invoice.additionalInfo')}</h2>
        <Textarea
          label={t('invoice.notesLabel')}
          rows={3}
          placeholder={t('invoice.notesPlaceholder')}
          error={errors.notes?.message}
          {...register('notes')}
        />
        <Textarea
          label={t('invoice.paymentInstructionsLabel')}
          rows={3}
          placeholder={t('invoice.paymentInstructionsPlaceholder')}
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditMode ? t('invoice.updateInvoice') : t('invoice.createInvoice')}
        </Button>
      </div>
    </form>
  )
}
