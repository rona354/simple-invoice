import { createServerClient } from '@/shared/lib/supabase'
import { RepositoryError, NotFoundError } from '@/shared/errors'
import { sanitizeSearchQuery } from '@/shared/utils'
import type { Database } from '@/shared/types/database'
import type { Client, ClientInsert, ClientUpdate, ClientFilter } from './types'

type DbClientInsert = Database['public']['Tables']['clients']['Insert']
type DbClientUpdate = Database['public']['Tables']['clients']['Update']

export const clientRepository = {
  async create(data: ClientInsert): Promise<Client> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: client, error } = await (supabase.from('clients') as any)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new RepositoryError('create client', error)
    }

    return client as Client
  },

  async findById(id: string): Promise<Client | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find client by id', error)
    }

    return data as Client
  },

  async findByUserId(userId: string, filter: ClientFilter = {}): Promise<{ clients: Client[]; total: number }> {
    const supabase = await createServerClient()

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (filter.search) {
      const sanitized = sanitizeSearchQuery(filter.search)
      query = query.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
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
      throw new RepositoryError('find clients', error)
    }

    return {
      clients: (data || []) as Client[],
      total: count || 0,
    }
  },

  async search(userId: string, query: string, limit: number = 10): Promise<Client[]> {
    const supabase = await createServerClient()
    const sanitized = sanitizeSearchQuery(query)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      throw new RepositoryError('search clients', error)
    }

    return (data || []) as Client[]
  },

  async update(id: string, data: ClientUpdate): Promise<Client> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: client, error } = await (supabase.from('clients') as any)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      throw new NotFoundError('Client')
    }

    if (error) {
      throw new RepositoryError('update client', error)
    }

    return client as Client
  },

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      throw new RepositoryError('delete client', error)
    }
  },

  async findByNameAndUser(userId: string, name: string): Promise<Client | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find client by name', error)
    }

    return data as Client
  },
}
