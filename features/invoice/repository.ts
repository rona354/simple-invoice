import { createServerClient } from '@/shared/lib/supabase'
import { RepositoryError, NotFoundError } from '@/shared/errors'
import { sanitizeSearchQuery } from '@/shared/utils'
import type { Invoice, InvoiceInsert, InvoiceUpdate, InvoiceFilter, InvoiceWithProfile } from './types'

export const invoiceRepository = {
  async create(data: InvoiceInsert): Promise<Invoice> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invoice, error } = await (supabase.from('invoices') as any)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new RepositoryError('create invoice', error)
    }

    return invoice as Invoice
  },

  async findById(id: string): Promise<Invoice | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find invoice by id', error)
    }

    return data as Invoice
  },

  async findByIdWithProfile(id: string): Promise<InvoiceWithProfile | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find invoice with profile', error)
    }

    return data as InvoiceWithProfile
  },

  async findByPublicId(publicId: string): Promise<InvoiceWithProfile | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('public_id', publicId)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find invoice by public id', error)
    }

    return data as InvoiceWithProfile
  },

  async findMany(userId: string, filter: InvoiceFilter = {}): Promise<{ invoices: Invoice[]; total: number }> {
    const supabase = await createServerClient()

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status)
    }

    if (filter.search) {
      const sanitized = sanitizeSearchQuery(filter.search)
      query = query.or(
        `client_name.ilike.%${sanitized}%,invoice_number.ilike.%${sanitized}%`
      )
    }

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new RepositoryError('find invoices', error)
    }

    return {
      invoices: (data || []) as Invoice[],
      total: count || 0,
    }
  },

  async update(id: string, data: InvoiceUpdate): Promise<Invoice> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invoice, error } = await (supabase.from('invoices') as any)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      throw new NotFoundError('Invoice')
    }

    if (error) {
      throw new RepositoryError('update invoice', error)
    }

    return invoice as Invoice
  },

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      throw new RepositoryError('delete invoice', error)
    }
  },

  async countByUserAndYear(userId: string, year: number): Promise<number> {
    const supabase = await createServerClient()

    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`)

    if (error) {
      throw new RepositoryError('count invoices', error)
    }

    return count || 0
  },
}
