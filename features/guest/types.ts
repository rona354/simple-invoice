export interface GuestLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

export interface GuestInvoice {
  number: string
  date: string
  due_date: string

  from: {
    name: string
    email?: string
    address?: string
    phone?: string
  }

  to: {
    name: string
    email?: string
    phone?: string
    address?: string
  }

  items: GuestLineItem[]

  notes?: string
  tax_rate: number
  currency: string
}

export interface GuestInvoiceState {
  version: 1
  createdAt: string
  invoiceId: string
  status: 'draft' | 'completed'
  attemptFingerprint: string

  invoice: GuestInvoice

  pdfGenerated: boolean
  pdfGeneratedAt?: string
}
