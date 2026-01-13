import { profileRepository } from './repository'
import type { Profile, ProfileUpdate } from './types'
import type { ProfileFormInput } from './schema'

export const profileService = {
  async getByUserId(userId: string): Promise<Profile | null> {
    return profileRepository.findById(userId)
  },

  async getByUserIdOrCreate(userId: string): Promise<Profile> {
    let profile = await profileRepository.findById(userId)

    if (!profile) {
      profile = await profileRepository.create({ id: userId })
    }

    return profile
  },

  async update(userId: string, formData: ProfileFormInput): Promise<Profile> {
    const updateData: ProfileUpdate = {
      business_name: formData.business_name || null,
      business_email: formData.business_email || null,
      business_phone: formData.business_phone || null,
      business_address: formData.business_address || null,
      business_city: formData.business_city || null,
      business_country: formData.business_country || null,
      business_postal_code: formData.business_postal_code || null,
      tax_id: formData.tax_id || null,
      tax_id_label: formData.tax_id_label,
      default_currency: formData.default_currency,
      default_payment_terms: formData.default_payment_terms,
      default_tax_rate: formData.default_tax_rate,
      default_notes: formData.default_notes || null,
      default_payment_instructions: formData.default_payment_instructions || null,
      locale: formData.locale,
      date_format: formData.date_format,
    }

    return profileRepository.upsert(userId, updateData)
  },

  async updateLogo(userId: string, logoUrl: string | null): Promise<Profile> {
    return profileRepository.updateLogoUrl(userId, logoUrl)
  },

  async getDefaults(userId: string): Promise<{
    currency: string
    paymentTerms: number
    taxRate: number
    notes: string | null
    paymentInstructions: string | null
  }> {
    const profile = await this.getByUserIdOrCreate(userId)

    return {
      currency: profile.default_currency,
      paymentTerms: profile.default_payment_terms,
      taxRate: profile.default_tax_rate,
      notes: profile.default_notes,
      paymentInstructions: profile.default_payment_instructions,
    }
  },
}
