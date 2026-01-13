import { describe, it, expect } from 'vitest'
import {
  lineItemFormSchema,
  invoiceFormSchema,
  invoiceStatusSchema,
  updateStatusSchema,
  invoiceIdSchema,
} from './schema'

describe('lineItemFormSchema', () => {
  it('validates valid line item', () => {
    const result = lineItemFormSchema.safeParse({
      description: 'Service',
      quantity: 1,
      unit_price: 100,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty description', () => {
    const result = lineItemFormSchema.safeParse({
      description: '',
      quantity: 1,
      unit_price: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero quantity', () => {
    const result = lineItemFormSchema.safeParse({
      description: 'Service',
      quantity: 0,
      unit_price: 100,
    })
    expect(result.success).toBe(false)
  })

  it('allows zero price', () => {
    const result = lineItemFormSchema.safeParse({
      description: 'Free service',
      quantity: 1,
      unit_price: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative price', () => {
    const result = lineItemFormSchema.safeParse({
      description: 'Service',
      quantity: 1,
      unit_price: -10,
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceFormSchema', () => {
  const validInvoice = {
    client_name: 'Acme Corp',
    items: [{ description: 'Service', quantity: 1, unit_price: 100 }],
    due_date: '2024-07-15',
  }

  it('validates minimal invoice', () => {
    const result = invoiceFormSchema.safeParse(validInvoice)
    expect(result.success).toBe(true)
  })

  it('validates full invoice', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      client_email: 'acme@example.com',
      client_phone: '+1234567890',
      client_address: '123 Main St',
      client_tax_id: 'TAX123',
      tax_rate: 10,
      discount_type: 'percentage',
      discount_value: 5,
      currency: 'EUR',
      notes: 'Thank you',
      payment_instructions: 'Bank transfer',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty client name', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      client_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      client_email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })

  it('allows empty string for email', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      client_email: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty items array', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      items: [],
    })
    expect(result.success).toBe(false)
  })

  it('applies defaults', () => {
    const result = invoiceFormSchema.safeParse(validInvoice)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tax_rate).toBe(0)
      expect(result.data.discount_type).toBe('fixed')
      expect(result.data.discount_value).toBe(0)
      expect(result.data.currency).toBe('USD')
    }
  })

  it('rejects tax rate over 100', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      tax_rate: 150,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid currency length', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      currency: 'US',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid discount type', () => {
    const result = invoiceFormSchema.safeParse({
      ...validInvoice,
      discount_type: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceStatusSchema', () => {
  it('accepts valid statuses', () => {
    const statuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']
    statuses.forEach((status) => {
      expect(invoiceStatusSchema.safeParse(status).success).toBe(true)
    })
  })

  it('rejects invalid status', () => {
    expect(invoiceStatusSchema.safeParse('invalid').success).toBe(false)
  })
})

describe('updateStatusSchema', () => {
  it('validates valid update', () => {
    const result = updateStatusSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'paid',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = updateStatusSchema.safeParse({
      id: 'invalid-uuid',
      status: 'paid',
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceIdSchema', () => {
  it('validates UUID', () => {
    const result = invoiceIdSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID', () => {
    const result = invoiceIdSchema.safeParse({
      id: '12345',
    })
    expect(result.success).toBe(false)
  })
})
