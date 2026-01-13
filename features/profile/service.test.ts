import { describe, it, expect, vi, beforeEach } from 'vitest'
import { profileService } from './service'
import { profileRepository } from './repository'

vi.mock('./repository', () => ({
  profileRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    updateLogoUrl: vi.fn(),
  },
}))

const mockProfile = {
  id: 'user-1',
  business_name: 'My Business',
  business_email: 'business@example.com',
  business_phone: '+1234567890',
  business_address: '123 Main St',
  business_city: 'New York',
  business_country: 'USA',
  business_postal_code: '10001',
  tax_id: 'TAX123',
  tax_id_label: 'Tax ID',
  logo_url: null,
  default_currency: 'USD',
  default_payment_terms: 30,
  default_tax_rate: 10,
  default_notes: 'Thank you',
  default_payment_instructions: 'Bank transfer',
  locale: 'en-US',
  date_format: 'MMM dd, yyyy',
  created_at: '2024-06-15T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
}

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByUserId', () => {
    it('returns profile when found', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(mockProfile)

      const result = await profileService.getByUserId('user-1')

      expect(profileRepository.findById).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(mockProfile)
    })

    it('returns null when not found', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(null)

      const result = await profileService.getByUserId('invalid')

      expect(result).toBeNull()
    })
  })

  describe('getByUserIdOrCreate', () => {
    it('returns existing profile', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(mockProfile)

      const result = await profileService.getByUserIdOrCreate('user-1')

      expect(result).toEqual(mockProfile)
      expect(profileRepository.create).not.toHaveBeenCalled()
    })

    it('creates profile if not found', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(null)
      vi.mocked(profileRepository.create).mockResolvedValue(mockProfile)

      const result = await profileService.getByUserIdOrCreate('user-1')

      expect(profileRepository.create).toHaveBeenCalledWith({ id: 'user-1' })
      expect(result).toEqual(mockProfile)
    })
  })

  describe('update', () => {
    it('updates profile with form data', async () => {
      vi.mocked(profileRepository.upsert).mockResolvedValue(mockProfile)

      await profileService.update('user-1', {
        business_name: 'New Business',
        business_email: 'new@example.com',
        default_currency: 'EUR',
        default_payment_terms: 14,
        default_tax_rate: 20,
        locale: 'de-DE',
        date_format: 'dd.MM.yyyy',
      })

      expect(profileRepository.upsert).toHaveBeenCalledWith('user-1', {
        business_name: 'New Business',
        business_email: 'new@example.com',
        business_phone: null,
        business_address: null,
        business_city: null,
        business_country: null,
        business_postal_code: null,
        tax_id: null,
        tax_id_label: undefined,
        default_currency: 'EUR',
        default_payment_terms: 14,
        default_tax_rate: 20,
        default_notes: null,
        default_payment_instructions: null,
        locale: 'de-DE',
        date_format: 'dd.MM.yyyy',
      })
    })

    it('converts empty strings to null', async () => {
      vi.mocked(profileRepository.upsert).mockResolvedValue(mockProfile)

      await profileService.update('user-1', {
        business_name: '',
        business_email: '',
        default_currency: 'USD',
        default_payment_terms: 30,
        default_tax_rate: 0,
        locale: 'en-US',
        date_format: 'MMM dd, yyyy',
      })

      expect(profileRepository.upsert).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          business_name: null,
          business_email: null,
        })
      )
    })
  })

  describe('updateLogo', () => {
    it('updates logo URL', async () => {
      vi.mocked(profileRepository.updateLogoUrl).mockResolvedValue({
        ...mockProfile,
        logo_url: 'https://example.com/logo.png',
      })

      const result = await profileService.updateLogo('user-1', 'https://example.com/logo.png')

      expect(profileRepository.updateLogoUrl).toHaveBeenCalledWith(
        'user-1',
        'https://example.com/logo.png'
      )
      expect(result.logo_url).toBe('https://example.com/logo.png')
    })

    it('clears logo URL with null', async () => {
      vi.mocked(profileRepository.updateLogoUrl).mockResolvedValue({
        ...mockProfile,
        logo_url: null,
      })

      await profileService.updateLogo('user-1', null)

      expect(profileRepository.updateLogoUrl).toHaveBeenCalledWith('user-1', null)
    })
  })

  describe('getDefaults', () => {
    it('returns profile defaults', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(mockProfile)

      const result = await profileService.getDefaults('user-1')

      expect(result).toEqual({
        currency: 'USD',
        paymentTerms: 30,
        taxRate: 10,
        notes: 'Thank you',
        paymentInstructions: 'Bank transfer',
      })
    })

    it('creates profile if not exists and returns defaults', async () => {
      vi.mocked(profileRepository.findById).mockResolvedValue(null)
      vi.mocked(profileRepository.create).mockResolvedValue({
        ...mockProfile,
        default_currency: 'USD',
        default_payment_terms: 30,
        default_tax_rate: 0,
        default_notes: null,
        default_payment_instructions: null,
      })

      const result = await profileService.getDefaults('user-1')

      expect(profileRepository.create).toHaveBeenCalled()
      expect(result.currency).toBe('USD')
    })
  })
})
