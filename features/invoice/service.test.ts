import { describe, it, expect, vi, beforeEach } from 'vitest'
import { invoiceService } from './service'
import { invoiceRepository } from './repository'
import { NotFoundError } from '@/shared/errors'

vi.mock('./repository', () => ({
  invoiceRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdWithProfile: vi.fn(),
    findByPublicId: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockInvoice = {
  id: 'inv-1',
  user_id: 'user-1',
  invoice_number: 'INV-2024-0001',
  status: 'draft',
  client_name: 'Acme Corp',
  client_email: 'acme@example.com',
  client_phone: null,
  client_address: null,
  client_tax_id: null,
  items: [],
  subtotal_cents: 10000,
  discount_type: 'fixed',
  discount_value: 0,
  discount_cents: 0,
  tax_rate: 0,
  tax_cents: 0,
  total_cents: 10000,
  currency: 'USD',
  issue_date: '2024-06-15',
  due_date: '2024-07-15',
  sent_date: null,
  viewed_date: null,
  paid_date: null,
  notes: null,
  payment_instructions: null,
  public_id: 'public-1',
  created_at: '2024-06-15T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
}

describe('invoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('creates an invoice with calculated totals', async () => {
      vi.mocked(invoiceRepository.create).mockResolvedValue(mockInvoice)

      const result = await invoiceService.create('user-1', 'INV-2024-0001', {
        client_name: 'Acme Corp',
        client_email: 'acme@example.com',
        items: [{ description: 'Service', quantity: 1, unit_price: 100 }],
        tax_rate: 10,
        discount_type: 'fixed',
        discount_value: 0,
        currency: 'USD',
        due_date: '2024-07-15',
      })

      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          invoice_number: 'INV-2024-0001',
          status: 'draft',
          client_name: 'Acme Corp',
          subtotal_cents: 10000,
          tax_cents: 1000,
          total_cents: 11000,
        })
      )
      expect(result).toEqual(mockInvoice)
    })
  })

  describe('getById', () => {
    it('returns invoice when found', async () => {
      vi.mocked(invoiceRepository.findById).mockResolvedValue(mockInvoice)

      const result = await invoiceService.getById('inv-1')

      expect(invoiceRepository.findById).toHaveBeenCalledWith('inv-1')
      expect(result).toEqual(mockInvoice)
    })

    it('throws NotFoundError when not found', async () => {
      vi.mocked(invoiceRepository.findById).mockResolvedValue(null)

      await expect(invoiceService.getById('invalid')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateStatus', () => {
    it('sets paid_date when marking as paid', async () => {
      vi.mocked(invoiceRepository.update).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      })

      await invoiceService.updateStatus('inv-1', 'paid')

      expect(invoiceRepository.update).toHaveBeenCalledWith('inv-1', {
        status: 'paid',
        paid_date: expect.any(String),
      })
    })

    it('sets sent_date when marking as sent', async () => {
      vi.mocked(invoiceRepository.update).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      })

      await invoiceService.updateStatus('inv-1', 'sent')

      expect(invoiceRepository.update).toHaveBeenCalledWith('inv-1', {
        status: 'sent',
        sent_date: expect.any(String),
      })
    })
  })

  describe('markAsViewed', () => {
    it('marks sent invoice as viewed', async () => {
      vi.mocked(invoiceRepository.findById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
        viewed_date: null,
      })
      vi.mocked(invoiceRepository.update).mockResolvedValue({
        ...mockInvoice,
        status: 'viewed',
      })

      await invoiceService.markAsViewed('inv-1')

      expect(invoiceRepository.update).toHaveBeenCalledWith('inv-1', {
        status: 'viewed',
        viewed_date: expect.any(String),
      })
    })

    it('does not update already viewed invoice', async () => {
      vi.mocked(invoiceRepository.findById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
        viewed_date: '2024-06-16T00:00:00Z',
      })

      await invoiceService.markAsViewed('inv-1')

      expect(invoiceRepository.update).not.toHaveBeenCalled()
    })

    it('does not update non-sent invoice', async () => {
      vi.mocked(invoiceRepository.findById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      })

      await invoiceService.markAsViewed('inv-1')

      expect(invoiceRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('mapFormItemsToLineItems', () => {
    it('converts form items to line items with cents', () => {
      const items = [
        { description: 'Service A', quantity: 2, unit_price: 50 },
        { description: 'Service B', quantity: 1, unit_price: 100 },
      ]

      const result = invoiceService.mapFormItemsToLineItems(items)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        description: 'Service A',
        quantity: 2,
        unit_price_cents: 5000,
        amount_cents: 10000,
      })
      expect(result[0].id).toMatch(/^[a-f0-9-]{36}$/)
      expect(result[1]).toMatchObject({
        description: 'Service B',
        quantity: 1,
        unit_price_cents: 10000,
        amount_cents: 10000,
      })
    })
  })
})
