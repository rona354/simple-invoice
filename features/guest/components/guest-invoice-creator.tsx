'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button, Input, Textarea, Select, Spinner } from '@/shared/components/ui'
import { LanguageSwitcher } from '@/shared/components/language-switcher'
import { Logo } from '@/shared/layout'
import { CURRENCY_OPTIONS } from '@/shared/config'
import { formatCurrency, calculateInvoiceTotals } from '@/shared/utils'
import { useTranslations } from '@/shared/i18n'
import { guestInvoiceFormSchema, type GuestInvoiceFormData } from '../schema'
import { saveGuestInvoice, getGuestInvoice, markGuestPdfGenerated, hasUsedGuestInvoice } from '../storage'
import { generateFingerprint, generateInvoiceId } from '../fingerprint'
import type { GuestInvoice } from '../types'
import { GuestLimitReached } from './guest-limit-reached'
import { ConversionModal } from './conversion-modal'
import { GuestWhatsAppSend } from './guest-whatsapp-send'
import { GuestPdfShare } from './guest-pdf-share'

function buildGuestInvoice(data: GuestInvoiceFormData, invoiceId: string): GuestInvoice {
  return {
    number: `GUEST-${invoiceId.slice(0, 8).toUpperCase()}`,
    date: new Date().toISOString().split('T')[0],
    due_date: data.due_date,
    from: {
      name: data.from_name,
      email: data.from_email || undefined,
      address: data.from_address || undefined,
    },
    to: {
      name: data.to_name,
      email: data.to_email || undefined,
      phone: data.to_phone || undefined,
      address: data.to_address || undefined,
    },
    items: data.items,
    notes: data.notes || undefined,
    tax_rate: data.tax_rate,
    currency: data.currency,
  }
}

export function GuestInvoiceCreator() {
  const t = useTranslations()
  const [invoiceId, setInvoiceId] = useState<string>('')
  const [fingerprint, setFingerprint] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const defaultDueDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }, [])

  const form = useForm<GuestInvoiceFormData>({
    resolver: zodResolver(guestInvoiceFormSchema),
    defaultValues: {
      from_name: '',
      from_email: '',
      from_address: '',
      to_name: '',
      to_email: '',
      to_phone: '',
      to_address: '',
      items: [{ id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0 }],
      tax_rate: 0,
      currency: 'USD',
      notes: '',
      due_date: defaultDueDate,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = form.watch('items')
  const watchedTaxRate = form.watch('tax_rate')
  const watchedCurrency = form.watch('currency')

  const totals = useMemo(() => {
    const itemsForCalc = watchedItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
    return calculateInvoiceTotals(itemsForCalc, watchedTaxRate, 'fixed', 0)
  }, [watchedItems, watchedTaxRate])

  const watchedValues = form.watch()
  const liveInvoice = useMemo<GuestInvoice | null>(() => {
    if (!invoiceId || !watchedValues.from_name) return null
    return buildGuestInvoice(watchedValues, invoiceId)
  }, [invoiceId, watchedValues])

  useEffect(() => {
    async function init() {
      const fp = await generateFingerprint()
      setFingerprint(fp)

      if (hasUsedGuestInvoice()) {
        setLimitReached(true)
        return
      }

      const existing = getGuestInvoice()
      if (existing) {
        setInvoiceId(existing.invoiceId)
        const inv = existing.invoice
        form.reset({
          from_name: inv.from.name,
          from_email: inv.from.email ?? '',
          from_address: inv.from.address ?? '',
          to_name: inv.to.name,
          to_email: inv.to.email ?? '',
          to_phone: inv.to.phone ?? '',
          to_address: inv.to.address ?? '',
          items: inv.items.map((i) => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
          tax_rate: inv.tax_rate,
          currency: inv.currency,
          notes: inv.notes ?? '',
          due_date: inv.due_date,
        })
      } else {
        setInvoiceId(generateInvoiceId())
      }
    }
    init()
  }, [form])

  const saveToStorage = useCallback(
    (data: GuestInvoiceFormData) => {
      if (!invoiceId || !fingerprint) return

      const guestInvoice = buildGuestInvoice(data, invoiceId)
      saveGuestInvoice(guestInvoice, invoiceId, fingerprint, 'draft')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    [invoiceId, fingerprint]
  )

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (invoiceId && fingerprint && value.from_name) {
        setSaveStatus('saving')
        const timeoutId = setTimeout(() => {
          saveToStorage(value as GuestInvoiceFormData)
        }, 1000)
        return () => clearTimeout(timeoutId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, invoiceId, fingerprint, saveToStorage])

  async function handleDownload() {
    const isValid = await form.trigger()
    if (!isValid) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      const data = form.getValues()
      saveToStorage(data)

      const guestInvoice = buildGuestInvoice(data, invoiceId)

      const response = await fetch('/api/guest/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: guestInvoice,
          fingerprint,
          invoiceId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          setLimitReached(true)
          return
        }
        throw new Error(errorData.message || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${guestInvoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      markGuestPdfGenerated()
      setShowConversionModal(true)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  function addItem() {
    append({ id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0 })
  }

  if (limitReached) {
    return <GuestLimitReached />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {saveStatus === 'saving' && t('guest.saving')}
              {saveStatus === 'saved' && t('guest.saved')}
            </span>
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t('auth.signIn')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {t('guest.freeModeBanner')}{' '}
          <Link href="/signup" className="font-medium underline">
            {t('guest.signUpCta')}
          </Link>
        </div>

        <form className="space-y-8">
          {downloadError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{downloadError}</div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('guest.yourDetails')}</h2>
              <Input
                label={`${t('guest.businessName')} *`}
                placeholder={t('guest.fromName')}
                error={form.formState.errors.from_name?.message}
                {...form.register('from_name')}
              />
              <Input
                label={t('guest.fromEmail')}
                type="email"
                placeholder="your@email.com"
                error={form.formState.errors.from_email?.message}
                {...form.register('from_email')}
              />
              <Textarea
                label={t('guest.fromAddress')}
                rows={2}
                placeholder={t('invoice.clientAddress')}
                {...form.register('from_address')}
              />
            </section>

            <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('guest.to')}</h2>
              <Input
                label={`${t('guest.toName')} *`}
                placeholder={t('guest.toName')}
                error={form.formState.errors.to_name?.message}
                {...form.register('to_name')}
              />
              <Input
                label={t('guest.toEmail')}
                type="email"
                placeholder="client@email.com"
                error={form.formState.errors.to_email?.message}
                {...form.register('to_email')}
              />
              <Input
                label={t('guest.toPhone')}
                type="tel"
                placeholder="+1 234 567 8900"
                {...form.register('to_phone')}
              />
              <Textarea
                label={t('guest.toAddress')}
                rows={2}
                placeholder={t('invoice.clientAddress')}
                {...form.register('to_address')}
              />
            </section>
          </div>

          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
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
                const qty = watchedItems[index]?.quantity ?? 0
                const price = watchedItems[index]?.unit_price ?? 0
                const amount = Math.round(qty * price * 100)

                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        placeholder={t('invoice.description')}
                        error={form.formState.errors.items?.[index]?.description?.message}
                        {...form.register(`items.${index}.description`)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end text-sm">
                      {formatCurrency(amount, watchedCurrency)}
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('invoice.subtotal')}</span>
                  <span>{formatCurrency(totals.subtotalCents, watchedCurrency)}</span>
                </div>
                {totals.taxCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('invoice.taxPercent', { value: watchedTaxRate })}</span>
                    <span>{formatCurrency(totals.taxCents, watchedCurrency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>{t('invoice.total')}</span>
                  <span>{formatCurrency(totals.totalCents, watchedCurrency)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('invoice.invoiceDetails')}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label={`${t('invoice.dueDate')} *`}
                type="date"
                error={form.formState.errors.due_date?.message}
                {...form.register('due_date')}
              />
              <Select
                label={t('invoice.currency')}
                options={CURRENCY_OPTIONS}
                {...form.register('currency')}
              />
              <Input
                label={t('invoice.taxRate')}
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...form.register('tax_rate', { valueAsNumber: true })}
              />
            </div>
            <Textarea
              label={t('invoice.notesLabel')}
              rows={3}
              placeholder={t('invoice.notesPlaceholder')}
              {...form.register('notes')}
            />
          </section>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              {liveInvoice && fingerprint && invoiceId && (
                <GuestWhatsAppSend
                  invoice={liveInvoice}
                  fingerprint={fingerprint}
                  invoiceId={invoiceId}
                  disabled={!form.formState.isValid}
                  size="md"
                />
              )}
              {liveInvoice && fingerprint && invoiceId && (
                <GuestPdfShare
                  invoice={liveInvoice}
                  fingerprint={fingerprint}
                  invoiceId={invoiceId}
                  disabled={!form.formState.isValid}
                  size="md"
                />
              )}
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full max-w-md"
            >
              {isDownloading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {t('guest.generatingPdf')}
                </>
              ) : (
                t('guest.downloadPdf')
              )}
            </Button>
          </div>
        </form>
      </main>

      <ConversionModal
        open={showConversionModal}
        onClose={() => {
          setShowConversionModal(false)
          setLimitReached(true)
        }}
      />
    </div>
  )
}
