'use client'

import { useState, useMemo, useCallback } from 'react'
import { useForm, useFieldArray, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceFormSchema, type InvoiceFormData } from './schema'
import { calculateInvoiceTotals } from '@/shared/utils'
import type { Profile, Invoice } from './types'

interface UseInvoiceFormOptions {
  profile?: Profile | null
  invoice?: Invoice | null
}

export function useInvoiceForm({ profile, invoice }: UseInvoiceFormOptions = {}) {
  const defaultDueDate = useMemo(() => {
    const terms = profile?.default_payment_terms ?? 30
    const date = new Date()
    date.setDate(date.getDate() + terms)
    return date.toISOString().split('T')[0]
  }, [profile?.default_payment_terms])

  const defaultValues: InvoiceFormData = useMemo(() => {
    if (invoice) {
      return {
        client_name: invoice.client_name,
        client_email: invoice.client_email || '',
        client_phone: invoice.client_phone || '',
        client_address: invoice.client_address || '',
        client_tax_id: invoice.client_tax_id || '',
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price_cents / 100,
        })),
        tax_rate: invoice.tax_rate,
        discount_type: invoice.discount_type,
        discount_value: invoice.discount_value,
        due_date: invoice.due_date || defaultDueDate,
        currency: invoice.currency,
        notes: invoice.notes || '',
        payment_instructions: invoice.payment_instructions || '',
      }
    }

    return {
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      client_tax_id: '',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
      tax_rate: profile?.default_tax_rate ?? 0,
      discount_type: 'fixed' as const,
      discount_value: 0,
      due_date: defaultDueDate,
      currency: profile?.default_currency ?? 'USD',
      notes: profile?.default_notes ?? '',
      payment_instructions: profile?.default_payment_instructions ?? '',
    }
  }, [invoice, profile, defaultDueDate])

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const addItem = useCallback(() => {
    append({ description: '', quantity: 1, unit_price: 0 })
  }, [append])

  const removeItem = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }, [fields.length, remove])

  return {
    form,
    fields,
    addItem,
    removeItem,
    isEditMode: !!invoice,
  }
}

export function useInvoiceTotals(form: UseFormReturn<InvoiceFormData>) {
  const items = form.watch('items')
  const taxRate = form.watch('tax_rate')
  const discountType = form.watch('discount_type')
  const discountValue = form.watch('discount_value')
  const currency = form.watch('currency')

  const totals = useMemo(() => {
    return calculateInvoiceTotals(items, taxRate, discountType, discountValue)
  }, [items, taxRate, discountType, discountValue])

  return {
    ...totals,
    currency,
  }
}

export function useInvoiceSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async <T>(
      action: () => Promise<{ success: boolean; error?: string; data?: T }>
    ): Promise<T | null> => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await action()

        if (!result.success) {
          setError(result.error || 'An error occurred')
          return null
        }

        return result.data ?? null
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  return {
    isSubmitting,
    error,
    setError,
    handleSubmit,
  }
}
