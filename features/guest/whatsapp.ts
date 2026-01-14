import type { GuestInvoice } from './types'
import { formatCurrency, formatDate } from '@/shared/utils'

function sanitizePhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '')
  if (!/^\d{7,15}$/.test(cleaned)) {
    return null
  }
  return cleaned
}

function calculateTotal(invoice: GuestInvoice): number {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price * 100),
    0
  )
  const tax = Math.round(subtotal * (invoice.tax_rate / 100))
  return subtotal + tax
}

export function formatGuestWhatsAppMessage(
  invoice: GuestInvoice,
  publicUrl?: string
): string {
  const total = calculateTotal(invoice)

  const lines = [
    `*Invoice ${invoice.number}*`,
    '',
    `Customer: ${invoice.to.name}`,
    `Amount: ${formatCurrency(total, invoice.currency)}`,
    `Due: ${formatDate(invoice.due_date)}`,
  ]

  if (publicUrl) {
    lines.push('', `View Invoice: ${publicUrl}`)
  }

  return lines.join('\n')
}

export function generateGuestWhatsAppUrl(
  invoice: GuestInvoice,
  publicUrl?: string
): string {
  const message = formatGuestWhatsAppMessage(invoice, publicUrl)
  const encodedMessage = encodeURIComponent(message)

  if (invoice.to.phone) {
    const sanitized = sanitizePhoneNumber(invoice.to.phone)
    if (sanitized) {
      return `https://wa.me/${sanitized}?text=${encodedMessage}`
    }
  }

  return `https://wa.me/?text=${encodedMessage}`
}
