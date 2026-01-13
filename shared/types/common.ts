import type { ZodIssue } from 'zod'

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; code?: string; issues?: ZodIssue[] | unknown[] }

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type DiscountType = 'fixed' | 'percentage'

export interface Timestamps {
  created_at: string
  updated_at: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}

export interface FilterParams {
  search?: string
  status?: InvoiceStatus | 'all'
}

export type SortDirection = 'asc' | 'desc'

export interface SortParams {
  field: string
  direction: SortDirection
}
