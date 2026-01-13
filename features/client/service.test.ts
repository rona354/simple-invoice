import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientService } from './service'
import { clientRepository } from './repository'
import { NotFoundError } from '@/shared/errors'

vi.mock('./repository', () => ({
  clientRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByNameAndUser: vi.fn(),
    search: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockClient = {
  id: 'client-1',
  user_id: 'user-1',
  name: 'Acme Corp',
  email: 'acme@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'New York',
  country: 'USA',
  postal_code: '10001',
  tax_id: 'TAX123',
  created_at: '2024-06-15T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
}

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('creates a client with provided data', async () => {
      vi.mocked(clientRepository.create).mockResolvedValue(mockClient)

      const result = await clientService.create('user-1', {
        name: 'Acme Corp',
        email: 'acme@example.com',
        phone: '+1234567890',
      })

      expect(clientRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        name: 'Acme Corp',
        email: 'acme@example.com',
        phone: '+1234567890',
        address: null,
        city: null,
        country: null,
        postal_code: null,
        tax_id: null,
      })
      expect(result).toEqual(mockClient)
    })

    it('converts empty strings to null', async () => {
      vi.mocked(clientRepository.create).mockResolvedValue(mockClient)

      await clientService.create('user-1', {
        name: 'Acme Corp',
        email: '',
        phone: '',
      })

      expect(clientRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        name: 'Acme Corp',
        email: null,
        phone: null,
        address: null,
        city: null,
        country: null,
        postal_code: null,
        tax_id: null,
      })
    })
  })

  describe('getById', () => {
    it('returns client when found', async () => {
      vi.mocked(clientRepository.findById).mockResolvedValue(mockClient)

      const result = await clientService.getById('client-1')

      expect(result).toEqual(mockClient)
    })

    it('throws NotFoundError when not found', async () => {
      vi.mocked(clientRepository.findById).mockResolvedValue(null)

      await expect(clientService.getById('invalid')).rejects.toThrow(NotFoundError)
    })
  })

  describe('list', () => {
    it('returns clients for user', async () => {
      vi.mocked(clientRepository.findByUserId).mockResolvedValue({
        clients: [mockClient],
        total: 1,
      })

      const result = await clientService.list('user-1')

      expect(clientRepository.findByUserId).toHaveBeenCalledWith('user-1', {})
      expect(result.clients).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('passes filter options', async () => {
      vi.mocked(clientRepository.findByUserId).mockResolvedValue({
        clients: [],
        total: 0,
      })

      await clientService.list('user-1', { limit: 10, offset: 20 })

      expect(clientRepository.findByUserId).toHaveBeenCalledWith('user-1', {
        limit: 10,
        offset: 20,
      })
    })
  })

  describe('search', () => {
    it('searches clients by query', async () => {
      vi.mocked(clientRepository.search).mockResolvedValue([mockClient])

      const result = await clientService.search('user-1', 'Acme')

      expect(clientRepository.search).toHaveBeenCalledWith('user-1', 'Acme', 10)
      expect(result).toEqual([mockClient])
    })

    it('uses custom limit', async () => {
      vi.mocked(clientRepository.search).mockResolvedValue([])

      await clientService.search('user-1', 'test', 5)

      expect(clientRepository.search).toHaveBeenCalledWith('user-1', 'test', 5)
    })
  })

  describe('getOrCreate', () => {
    it('returns existing client if found', async () => {
      vi.mocked(clientRepository.findByNameAndUser).mockResolvedValue(mockClient)

      const result = await clientService.getOrCreate('user-1', { name: 'Acme Corp' })

      expect(result).toEqual(mockClient)
      expect(clientRepository.create).not.toHaveBeenCalled()
    })

    it('creates new client if not found', async () => {
      vi.mocked(clientRepository.findByNameAndUser).mockResolvedValue(null)
      vi.mocked(clientRepository.create).mockResolvedValue(mockClient)

      const result = await clientService.getOrCreate('user-1', { name: 'Acme Corp' })

      expect(clientRepository.create).toHaveBeenCalled()
      expect(result).toEqual(mockClient)
    })
  })

  describe('update', () => {
    it('updates only provided fields', async () => {
      vi.mocked(clientRepository.update).mockResolvedValue({
        ...mockClient,
        email: 'new@example.com',
      })

      await clientService.update('client-1', { email: 'new@example.com' })

      expect(clientRepository.update).toHaveBeenCalledWith('client-1', {
        email: 'new@example.com',
      })
    })

    it('converts empty strings to null', async () => {
      vi.mocked(clientRepository.update).mockResolvedValue(mockClient)

      await clientService.update('client-1', { email: '' })

      expect(clientRepository.update).toHaveBeenCalledWith('client-1', {
        email: null,
      })
    })
  })

  describe('delete', () => {
    it('deletes client', async () => {
      vi.mocked(clientRepository.delete).mockResolvedValue(undefined)

      await clientService.delete('client-1')

      expect(clientRepository.delete).toHaveBeenCalledWith('client-1')
    })
  })
})
