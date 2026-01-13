import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateDueDate, isOverdue, getInvoiceDisplayStatus } from './utils'

describe('calculateDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates due date with default 30 days', () => {
    expect(calculateDueDate()).toBe('2024-07-15')
  })

  it('calculates due date with custom payment terms', () => {
    expect(calculateDueDate(7)).toBe('2024-06-22')
    expect(calculateDueDate(14)).toBe('2024-06-29')
    expect(calculateDueDate(60)).toBe('2024-08-14')
  })

  it('handles month boundaries', () => {
    vi.setSystemTime(new Date('2024-01-25'))
    expect(calculateDueDate(10)).toBe('2024-02-04')
  })

  it('handles year boundaries', () => {
    vi.setSystemTime(new Date('2024-12-20'))
    expect(calculateDueDate(30)).toBe('2025-01-19')
  })

  it('handles zero payment terms', () => {
    expect(calculateDueDate(0)).toBe('2024-06-15')
  })
})

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when due date is past', () => {
    expect(isOverdue('2024-06-14', 'sent')).toBe(true)
    expect(isOverdue('2024-06-01', 'sent')).toBe(true)
    expect(isOverdue('2024-05-15', 'draft')).toBe(true)
  })

  it('returns false when due date is today or future', () => {
    expect(isOverdue('2024-06-15', 'sent')).toBe(false)
    expect(isOverdue('2024-06-16', 'sent')).toBe(false)
    expect(isOverdue('2024-07-01', 'sent')).toBe(false)
  })

  it('returns false when status is paid', () => {
    expect(isOverdue('2024-06-01', 'paid')).toBe(false)
  })

  it('returns false when status is cancelled', () => {
    expect(isOverdue('2024-06-01', 'cancelled')).toBe(false)
  })

  it('returns false when due date is null', () => {
    expect(isOverdue(null, 'sent')).toBe(false)
    expect(isOverdue(null, 'draft')).toBe(false)
  })
})

describe('getInvoiceDisplayStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns overdue for sent invoices past due date', () => {
    expect(getInvoiceDisplayStatus('sent', '2024-06-01')).toBe('overdue')
    expect(getInvoiceDisplayStatus('sent', '2024-06-14')).toBe('overdue')
  })

  it('returns sent for sent invoices not yet due', () => {
    expect(getInvoiceDisplayStatus('sent', '2024-06-15')).toBe('sent')
    expect(getInvoiceDisplayStatus('sent', '2024-06-30')).toBe('sent')
  })

  it('returns original status for non-sent statuses', () => {
    expect(getInvoiceDisplayStatus('draft', '2024-06-01')).toBe('draft')
    expect(getInvoiceDisplayStatus('paid', '2024-06-01')).toBe('paid')
    expect(getInvoiceDisplayStatus('cancelled', '2024-06-01')).toBe('cancelled')
  })

  it('returns original status when due date is null', () => {
    expect(getInvoiceDisplayStatus('sent', null)).toBe('sent')
    expect(getInvoiceDisplayStatus('draft', null)).toBe('draft')
  })
})
