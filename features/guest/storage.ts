import type { GuestInvoiceState, GuestInvoice } from './types'

const GUEST_INVOICE_KEY = 'guest_invoice_v1'
const GUEST_DATA_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export function getGuestInvoice(): GuestInvoiceState | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(GUEST_INVOICE_KEY)
    if (!stored) return null

    const state: GuestInvoiceState = JSON.parse(stored)

    const createdAt = new Date(state.createdAt).getTime()
    if (Date.now() - createdAt > GUEST_DATA_TTL) {
      clearGuestInvoice()
      return null
    }

    return state
  } catch {
    return null
  }
}

export function saveGuestInvoice(
  invoice: GuestInvoice,
  invoiceId: string,
  fingerprint: string,
  status: 'draft' | 'completed' = 'draft'
): void {
  if (typeof window === 'undefined') return

  const existing = getGuestInvoice()

  const state: GuestInvoiceState = {
    version: 1,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    invoiceId: existing?.invoiceId ?? invoiceId,
    status,
    attemptFingerprint: existing?.attemptFingerprint ?? fingerprint,
    invoice,
    pdfGenerated: existing?.pdfGenerated ?? false,
    pdfGeneratedAt: existing?.pdfGeneratedAt,
  }

  localStorage.setItem(GUEST_INVOICE_KEY, JSON.stringify(state))
}

export function markGuestPdfGenerated(): void {
  if (typeof window === 'undefined') return

  const state = getGuestInvoice()
  if (!state) return

  state.status = 'completed'
  state.pdfGenerated = true
  state.pdfGeneratedAt = new Date().toISOString()

  localStorage.setItem(GUEST_INVOICE_KEY, JSON.stringify(state))
}

export function clearGuestInvoice(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_INVOICE_KEY)
}

export function hasUsedGuestInvoice(): boolean {
  const state = getGuestInvoice()
  return state?.pdfGenerated === true
}

export function getGuestInvoiceId(): string | null {
  const state = getGuestInvoice()
  return state?.invoiceId ?? null
}
