import { z } from 'zod'

export const profileFormSchema = z.object({
  business_name: z.string().max(100, 'Business name is too long').optional().default(''),
  business_email: z.string().email('Invalid email').optional().or(z.literal('')),
  business_phone: z.string().max(30, 'Phone number is too long').optional().default(''),
  business_address: z.string().max(200, 'Address is too long').optional().default(''),
  business_city: z.string().max(100, 'City is too long').optional().default(''),
  business_country: z.string().max(100, 'Country is too long').optional().default(''),
  business_postal_code: z.string().max(20, 'Postal code is too long').optional().default(''),
  tax_id: z.string().max(50, 'Tax ID is too long').optional().default(''),
  tax_id_label: z.string().max(50, 'Tax ID label is too long').default('Tax ID'),
  default_currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  default_payment_terms: z.coerce.number().min(0).max(365).default(30),
  default_tax_rate: z.coerce.number().min(0).max(100).default(0),
  default_notes: z.string().max(1000, 'Notes are too long').optional().default(''),
  default_payment_instructions: z.string().max(1000, 'Payment instructions are too long').optional().default(''),
  locale: z.string().default('en-US'),
  date_format: z.string().default('MM/DD/YYYY'),
})

export type ProfileFormInput = z.infer<typeof profileFormSchema>
