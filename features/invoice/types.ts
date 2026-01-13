import type { InvoiceStatus, DiscountType, Timestamps, Profile } from '@/shared/types'

export type { Profile }

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit?: string
  unit_price_cents: number
  amount_cents: number
  tax_rate?: number
}

export interface Invoice extends Timestamps {
  id: string
  user_id: string
  client_id: string | null
  invoice_number: string
  status: InvoiceStatus

  client_name: string
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  client_tax_id: string | null

  items: LineItem[]

  subtotal_cents: number
  discount_cents: number
  discount_type: DiscountType
  discount_value: number
  tax_rate: number
  tax_cents: number
  total_cents: number

  currency: string

  issue_date: string
  due_date: string | null
  paid_date: string | null
  sent_date: string | null
  viewed_date: string | null

  notes: string | null
  payment_instructions: string | null
  terms: string | null
  footer: string | null

  public_id: string
  public_url: string
}

export interface InvoiceWithProfile extends Invoice {
  profile: Profile
}

export interface InvoiceInsert {
  user_id: string
  client_id?: string | null
  invoice_number: string
  status?: InvoiceStatus
  client_name: string
  client_email?: string | null
  client_phone?: string | null
  client_address?: string | null
  client_tax_id?: string | null
  items: LineItem[]
  subtotal_cents: number
  discount_cents?: number
  discount_type?: DiscountType
  discount_value?: number
  tax_rate?: number
  tax_cents?: number
  total_cents: number
  currency?: string
  issue_date?: string
  due_date?: string | null
  notes?: string | null
  payment_instructions?: string | null
  terms?: string | null
  footer?: string | null
}

export interface InvoiceUpdate {
  client_id?: string | null
  status?: InvoiceStatus
  client_name?: string
  client_email?: string | null
  client_phone?: string | null
  client_address?: string | null
  client_tax_id?: string | null
  items?: LineItem[]
  subtotal_cents?: number
  discount_cents?: number
  discount_type?: DiscountType
  discount_value?: number
  tax_rate?: number
  tax_cents?: number
  total_cents?: number
  currency?: string
  issue_date?: string
  due_date?: string | null
  paid_date?: string | null
  sent_date?: string | null
  viewed_date?: string | null
  notes?: string | null
  payment_instructions?: string | null
  terms?: string | null
  footer?: string | null
}

export interface InvoiceFilter {
  status?: InvoiceStatus | 'all'
  search?: string
  limit?: number
  offset?: number
}

export interface LineItemFormInput {
  description: string
  quantity: number
  unit_price: number
}

export interface InvoiceFormInput {
  client_name: string
  client_email?: string
  client_phone?: string
  client_address?: string
  client_tax_id?: string
  items: LineItemFormInput[]
  tax_rate: number
  discount_type: DiscountType
  discount_value: number
  due_date: string
  currency: string
  notes?: string
  payment_instructions?: string
}
