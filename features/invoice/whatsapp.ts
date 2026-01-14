import type { Invoice } from './types'
import { formatCurrency, formatDate } from '@/shared/utils'

export function sanitizePhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '')
  if (!/^\d{7,15}$/.test(cleaned)) {
    return null
  }
  return cleaned
}

export function formatWhatsAppMessage(invoice: Invoice): string {
  const lines = [
    `*Invoice ${invoice.invoice_number}*`,
    '',
    `Customer: ${invoice.client_name}`,
    `Amount: ${formatCurrency(invoice.total_cents, invoice.currency)}`,
  ]

  if (invoice.due_date) {
    lines.push(`Due: ${formatDate(invoice.due_date)}`)
  }

  lines.push('', `View Invoice: ${invoice.public_url}`)

  return lines.join('\n')
}

export function generateWhatsAppUrl(invoice: Invoice): string {
  const message = formatWhatsAppMessage(invoice)
  const encodedMessage = encodeURIComponent(message)

  if (invoice.client_phone) {
    const phone = sanitizePhoneNumber(invoice.client_phone)
    if (phone) {
      return `https://wa.me/${phone}?text=${encodedMessage}`
    }
  }

  return `https://wa.me/?text=${encodedMessage}`
}
