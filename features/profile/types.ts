export type { Profile } from '@/shared/types'

export interface ProfileInsert {
  id: string
  business_name?: string | null
  business_email?: string | null
  business_phone?: string | null
  business_address?: string | null
  business_city?: string | null
  business_country?: string | null
  business_postal_code?: string | null
  tax_id?: string | null
  tax_id_label?: string
  logo_url?: string | null
  default_currency?: string
  default_payment_terms?: number
  default_tax_rate?: number
  default_notes?: string | null
  default_payment_instructions?: string | null
  locale?: string
  date_format?: string
}

export interface ProfileUpdate {
  business_name?: string | null
  business_email?: string | null
  business_phone?: string | null
  business_address?: string | null
  business_city?: string | null
  business_country?: string | null
  business_postal_code?: string | null
  tax_id?: string | null
  tax_id_label?: string
  logo_url?: string | null
  default_currency?: string
  default_payment_terms?: number
  default_tax_rate?: number
  default_notes?: string | null
  default_payment_instructions?: string | null
  locale?: string
  date_format?: string
}
