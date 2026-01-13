import { describe, it, expect } from 'vitest'
import {
  calculateLineItemAmount,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateInvoiceTotals,
} from './calculations'

describe('calculateLineItemAmount', () => {
  it('calculates amount in cents', () => {
    expect(calculateLineItemAmount(1, 100)).toBe(10000)
    expect(calculateLineItemAmount(2, 50)).toBe(10000)
    expect(calculateLineItemAmount(3, 33.33)).toBe(9999)
  })

  it('handles fractional quantities', () => {
    expect(calculateLineItemAmount(0.5, 100)).toBe(5000)
    expect(calculateLineItemAmount(1.5, 20)).toBe(3000)
  })

  it('handles zero', () => {
    expect(calculateLineItemAmount(0, 100)).toBe(0)
    expect(calculateLineItemAmount(10, 0)).toBe(0)
  })

  it('rounds to nearest cent', () => {
    expect(calculateLineItemAmount(1, 10.005)).toBe(1001)
    expect(calculateLineItemAmount(1, 10.004)).toBe(1000)
  })
})

describe('calculateSubtotal', () => {
  it('sums line items', () => {
    const items = [
      { quantity: 1, unit_price: 100 },
      { quantity: 2, unit_price: 50 },
    ]
    expect(calculateSubtotal(items)).toBe(20000)
  })

  it('handles empty array', () => {
    expect(calculateSubtotal([])).toBe(0)
  })

  it('handles single item', () => {
    expect(calculateSubtotal([{ quantity: 3, unit_price: 25 }])).toBe(7500)
  })
})

describe('calculateDiscount', () => {
  it('calculates fixed discount', () => {
    expect(calculateDiscount(10000, 'fixed', 10)).toBe(1000)
    expect(calculateDiscount(10000, 'fixed', 100)).toBe(10000)
  })

  it('calculates percentage discount', () => {
    expect(calculateDiscount(10000, 'percentage', 10)).toBe(1000)
    expect(calculateDiscount(10000, 'percentage', 25)).toBe(2500)
    expect(calculateDiscount(10000, 'percentage', 50)).toBe(5000)
  })

  it('returns 0 for zero or negative discount', () => {
    expect(calculateDiscount(10000, 'fixed', 0)).toBe(0)
    expect(calculateDiscount(10000, 'percentage', 0)).toBe(0)
    expect(calculateDiscount(10000, 'fixed', -10)).toBe(0)
  })

  it('rounds percentage discounts', () => {
    expect(calculateDiscount(10000, 'percentage', 33)).toBe(3300)
    expect(calculateDiscount(10001, 'percentage', 33)).toBe(3300)
  })
})

describe('calculateTax', () => {
  it('calculates tax on amount', () => {
    expect(calculateTax(10000, 10)).toBe(1000)
    expect(calculateTax(10000, 7.5)).toBe(750)
    expect(calculateTax(10000, 20)).toBe(2000)
  })

  it('returns 0 for zero or negative rate', () => {
    expect(calculateTax(10000, 0)).toBe(0)
    expect(calculateTax(10000, -5)).toBe(0)
  })

  it('rounds to nearest cent', () => {
    expect(calculateTax(10001, 10)).toBe(1000)
    expect(calculateTax(10005, 10)).toBe(1001)
  })
})

describe('calculateInvoiceTotals', () => {
  const items = [
    { quantity: 2, unit_price: 100 },
    { quantity: 1, unit_price: 50 },
  ]

  it('calculates totals without discount or tax', () => {
    const result = calculateInvoiceTotals(items)
    expect(result).toEqual({
      subtotalCents: 25000,
      discountCents: 0,
      taxCents: 0,
      totalCents: 25000,
    })
  })

  it('calculates with tax only', () => {
    const result = calculateInvoiceTotals(items, 10)
    expect(result).toEqual({
      subtotalCents: 25000,
      discountCents: 0,
      taxCents: 2500,
      totalCents: 27500,
    })
  })

  it('calculates with fixed discount only', () => {
    const result = calculateInvoiceTotals(items, 0, 'fixed', 50)
    expect(result).toEqual({
      subtotalCents: 25000,
      discountCents: 5000,
      taxCents: 0,
      totalCents: 20000,
    })
  })

  it('calculates with percentage discount only', () => {
    const result = calculateInvoiceTotals(items, 0, 'percentage', 20)
    expect(result).toEqual({
      subtotalCents: 25000,
      discountCents: 5000,
      taxCents: 0,
      totalCents: 20000,
    })
  })

  it('applies tax after discount', () => {
    const result = calculateInvoiceTotals(items, 10, 'percentage', 20)
    expect(result).toEqual({
      subtotalCents: 25000,
      discountCents: 5000,
      taxCents: 2000,
      totalCents: 22000,
    })
  })

  it('handles empty items', () => {
    const result = calculateInvoiceTotals([])
    expect(result).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      taxCents: 0,
      totalCents: 0,
    })
  })
})
