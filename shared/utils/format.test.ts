import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  centsToDollars,
  dollarsToCents,
} from './format'

describe('formatCurrency', () => {
  it('formats cents to USD by default', () => {
    expect(formatCurrency(10000)).toBe('$100.00')
    expect(formatCurrency(1050)).toBe('$10.50')
    expect(formatCurrency(99)).toBe('$0.99')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-5000)).toBe('-$50.00')
  })

  it('formats different currencies', () => {
    const eurResult = formatCurrency(10000, 'EUR', 'de-DE')
    expect(eurResult).toMatch(/100,00.*€/)
    expect(formatCurrency(10000, 'GBP', 'en-GB')).toBe('£100.00')
  })

  it('formats with different locales', () => {
    expect(formatCurrency(1234500, 'USD', 'en-US')).toBe('$12,345.00')
    const deResult = formatCurrency(1234500, 'USD', 'de-DE')
    expect(deResult).toMatch(/12\.345,00.*\$/)
  })
})

describe('formatDate', () => {
  it('formats Date objects', () => {
    const date = new Date('2024-06-15')
    const result = formatDate(date)
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats date strings', () => {
    const result = formatDate('2024-12-25')
    expect(result).toContain('Dec')
    expect(result).toContain('25')
    expect(result).toContain('2024')
  })
})

describe('formatNumber', () => {
  it('formats with thousands separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('handles decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })

  it('handles zero and negative', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-1000)).toBe('-1,000')
  })
})

describe('formatPercent', () => {
  it('formats percentages', () => {
    expect(formatPercent(10)).toBe('10%')
    expect(formatPercent(50)).toBe('50%')
    expect(formatPercent(100)).toBe('100%')
  })

  it('handles decimal percentages', () => {
    expect(formatPercent(12.5)).toBe('12.5%')
    expect(formatPercent(7.25)).toBe('7.25%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%')
  })
})

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(100)).toBe(1)
    expect(centsToDollars(1050)).toBe(10.5)
    expect(centsToDollars(99)).toBe(0.99)
  })

  it('handles zero', () => {
    expect(centsToDollars(0)).toBe(0)
  })

  it('handles negative', () => {
    expect(centsToDollars(-500)).toBe(-5)
  })
})

describe('dollarsToCents', () => {
  it('converts dollars to cents', () => {
    expect(dollarsToCents(1)).toBe(100)
    expect(dollarsToCents(10.5)).toBe(1050)
    expect(dollarsToCents(0.99)).toBe(99)
  })

  it('rounds to nearest cent', () => {
    expect(dollarsToCents(1.999)).toBe(200)
    expect(dollarsToCents(1.001)).toBe(100)
    expect(dollarsToCents(1.006)).toBe(101)
  })

  it('handles zero', () => {
    expect(dollarsToCents(0)).toBe(0)
  })
})
