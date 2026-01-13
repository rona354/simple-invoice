import { clientRepository } from './repository'
import { NotFoundError } from '@/shared/errors'
import type { Client, ClientInsert, ClientFilter, ClientFormInput } from './types'

export const clientService = {
  async create(userId: string, formData: ClientFormInput): Promise<Client> {
    const clientData: ClientInsert = {
      user_id: userId,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      country: formData.country || null,
      postal_code: formData.postal_code || null,
      tax_id: formData.tax_id || null,
    }

    return clientRepository.create(clientData)
  },

  async getById(id: string): Promise<Client> {
    const client = await clientRepository.findById(id)
    if (!client) {
      throw new NotFoundError('Client')
    }
    return client
  },

  async list(userId: string, filter: ClientFilter = {}): Promise<{ clients: Client[]; total: number }> {
    return clientRepository.findByUserId(userId, filter)
  },

  async search(userId: string, query: string, limit: number = 10): Promise<Client[]> {
    return clientRepository.search(userId, query, limit)
  },

  async update(id: string, formData: Partial<ClientFormInput>): Promise<Client> {
    const updateData: Record<string, unknown> = {}

    if (formData.name !== undefined) {
      updateData.name = formData.name
    }
    if (formData.email !== undefined) {
      updateData.email = formData.email || null
    }
    if (formData.phone !== undefined) {
      updateData.phone = formData.phone || null
    }
    if (formData.address !== undefined) {
      updateData.address = formData.address || null
    }
    if (formData.city !== undefined) {
      updateData.city = formData.city || null
    }
    if (formData.country !== undefined) {
      updateData.country = formData.country || null
    }
    if (formData.postal_code !== undefined) {
      updateData.postal_code = formData.postal_code || null
    }
    if (formData.tax_id !== undefined) {
      updateData.tax_id = formData.tax_id || null
    }

    return clientRepository.update(id, updateData)
  },

  async delete(id: string): Promise<void> {
    await clientRepository.delete(id)
  },

  async getOrCreate(userId: string, formData: ClientFormInput): Promise<Client> {
    const existing = await clientRepository.findByNameAndUser(userId, formData.name)
    if (existing) {
      return existing
    }
    return this.create(userId, formData)
  },
}
