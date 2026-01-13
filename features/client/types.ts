import type { Timestamps } from '@/shared/types'

export interface Client extends Timestamps {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  postal_code: string | null
  tax_id: string | null
}

export interface ClientInsert {
  user_id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  postal_code?: string | null
  tax_id?: string | null
}

export interface ClientUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  postal_code?: string | null
  tax_id?: string | null
}

export interface ClientFilter {
  search?: string
  limit?: number
  offset?: number
}

export interface ClientFormInput {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postal_code?: string
  tax_id?: string
}
