import { createServerClient } from '@/shared/lib/supabase'
import { RepositoryError, NotFoundError } from '@/shared/errors'
import type { Profile, ProfileInsert, ProfileUpdate } from './types'

export const profileRepository = {
  async create(data: ProfileInsert): Promise<Profile> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase.from('profiles') as any)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new RepositoryError('create profile', error)
    }

    return profile as Profile
  },

  async findById(id: string): Promise<Profile | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116') {
      return null
    }

    if (error) {
      throw new RepositoryError('find profile by id', error)
    }

    return data as Profile
  },

  async findByIdOrThrow(id: string): Promise<Profile> {
    const profile = await this.findById(id)

    if (!profile) {
      throw new NotFoundError('Profile')
    }

    return profile
  },

  async update(id: string, data: ProfileUpdate): Promise<Profile> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase.from('profiles') as any)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      throw new NotFoundError('Profile')
    }

    if (error) {
      throw new RepositoryError('update profile', error)
    }

    return profile as Profile
  },

  async upsert(id: string, data: ProfileUpdate): Promise<Profile> {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase.from('profiles') as any)
      .upsert({
        id,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new RepositoryError('upsert profile', error)
    }

    return profile as Profile
  },

  async updateLogoUrl(id: string, logoUrl: string | null): Promise<Profile> {
    return this.update(id, { logo_url: logoUrl })
  },
}
