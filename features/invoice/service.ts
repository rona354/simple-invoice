import { invoiceRepository } from './repository'
import { calculateInvoiceTotals, dollarsToCents } from '@/shared/utils'
import { NotFoundError } from '@/shared/errors'
import { calculateDueDate } from './utils'
import type {
  Invoice,
  InvoiceInsert,
  InvoiceFilter,
  InvoiceFormInput,
  InvoiceWithProfile,
  LineItem,
} from './types'
import type { InvoiceStatus } from '@/shared/types'

export const invoiceService = {
  async create(
    userId: string,
    invoiceNumber: string,
    formData: InvoiceFormInput
  ): Promise<Invoice> {
    const lineItems = this.mapFormItemsToLineItems(formData.items)
    const totals = calculateInvoiceTotals(
      formData.items,
      formData.tax_rate,
      formData.discount_type,
      formData.discount_value
    )

    const invoiceData: InvoiceInsert = {
      user_id: userId,
      invoice_number: invoiceNumber,
      status: 'draft',
      client_name: formData.client_name,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      client_address: formData.client_address || null,
      client_tax_id: formData.client_tax_id || null,
      items: lineItems,
      subtotal_cents: totals.subtotalCents,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      discount_cents: totals.discountCents,
      tax_rate: formData.tax_rate,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      currency: formData.currency,
      due_date: formData.due_date,
      notes: formData.notes || null,
      payment_instructions: formData.payment_instructions || null,
    }

    return invoiceRepository.create(invoiceData)
  },

  async getById(id: string): Promise<Invoice> {
    const invoice = await invoiceRepository.findById(id)
    if (!invoice) {
      throw new NotFoundError('Invoice')
    }
    return invoice
  },

  async getByIdWithProfile(id: string): Promise<InvoiceWithProfile> {
    const invoice = await invoiceRepository.findByIdWithProfile(id)
    if (!invoice) {
      throw new NotFoundError('Invoice')
    }
    return invoice
  },

  async getByPublicId(publicId: string): Promise<InvoiceWithProfile> {
    const invoice = await invoiceRepository.findByPublicId(publicId)
    if (!invoice) {
      throw new NotFoundError('Invoice')
    }
    return invoice
  },

  async list(userId: string, filter: InvoiceFilter = {}): Promise<{ invoices: Invoice[]; total: number }> {
    return invoiceRepository.findMany(userId, filter)
  },

  async update(id: string, formData: Partial<InvoiceFormInput>): Promise<Invoice> {
    const updateData: Record<string, unknown> = {}

    if (formData.client_name !== undefined) {
      updateData.client_name = formData.client_name
    }
    if (formData.client_email !== undefined) {
      updateData.client_email = formData.client_email || null
    }
    if (formData.client_phone !== undefined) {
      updateData.client_phone = formData.client_phone || null
    }
    if (formData.client_address !== undefined) {
      updateData.client_address = formData.client_address || null
    }
    if (formData.client_tax_id !== undefined) {
      updateData.client_tax_id = formData.client_tax_id || null
    }
    if (formData.due_date !== undefined) {
      updateData.due_date = formData.due_date
    }
    if (formData.currency !== undefined) {
      updateData.currency = formData.currency
    }
    if (formData.notes !== undefined) {
      updateData.notes = formData.notes || null
    }
    if (formData.payment_instructions !== undefined) {
      updateData.payment_instructions = formData.payment_instructions || null
    }

    if (formData.items !== undefined) {
      const lineItems = this.mapFormItemsToLineItems(formData.items)
      const totals = calculateInvoiceTotals(
        formData.items,
        formData.tax_rate ?? 0,
        formData.discount_type ?? 'fixed',
        formData.discount_value ?? 0
      )

      updateData.items = lineItems
      updateData.subtotal_cents = totals.subtotalCents
      updateData.discount_cents = totals.discountCents
      updateData.tax_cents = totals.taxCents
      updateData.total_cents = totals.totalCents
    }

    if (formData.tax_rate !== undefined) {
      updateData.tax_rate = formData.tax_rate
    }
    if (formData.discount_type !== undefined) {
      updateData.discount_type = formData.discount_type
    }
    if (formData.discount_value !== undefined) {
      updateData.discount_value = formData.discount_value
    }

    return invoiceRepository.update(id, updateData)
  },

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const updateData: Record<string, unknown> = { status }

    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString()
    } else if (status === 'sent') {
      updateData.sent_date = new Date().toISOString()
    } else if (status === 'viewed') {
      updateData.viewed_date = new Date().toISOString()
    }

    return invoiceRepository.update(id, updateData)
  },

  async markAsViewed(id: string): Promise<Invoice> {
    const invoice = await this.getById(id)

    if (invoice.status === 'sent' && !invoice.viewed_date) {
      return invoiceRepository.update(id, {
        status: 'viewed',
        viewed_date: new Date().toISOString(),
      })
    }

    return invoice
  },

  async delete(id: string): Promise<void> {
    await invoiceRepository.delete(id)
  },

  async duplicate(id: string, userId: string, newInvoiceNumber: string): Promise<Invoice> {
    const original = await this.getById(id)

    const invoiceData: InvoiceInsert = {
      user_id: userId,
      invoice_number: newInvoiceNumber,
      status: 'draft',
      client_name: original.client_name,
      client_email: original.client_email,
      client_phone: original.client_phone,
      client_address: original.client_address,
      client_tax_id: original.client_tax_id,
      items: original.items,
      subtotal_cents: original.subtotal_cents,
      discount_type: original.discount_type,
      discount_value: original.discount_value,
      discount_cents: original.discount_cents,
      tax_rate: original.tax_rate,
      tax_cents: original.tax_cents,
      total_cents: original.total_cents,
      currency: original.currency,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: calculateDueDate(30),
      notes: original.notes,
      payment_instructions: original.payment_instructions,
    }

    return invoiceRepository.create(invoiceData)
  },

  mapFormItemsToLineItems(
    items: { description: string; quantity: number; unit_price: number }[]
  ): LineItem[] {
    return items.map((item) => ({
      id: crypto.randomUUID(),
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: dollarsToCents(item.unit_price),
      amount_cents: dollarsToCents(item.quantity * item.unit_price),
    }))
  },
}
