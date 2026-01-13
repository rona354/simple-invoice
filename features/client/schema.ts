import { z } from 'zod'

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
})

export const clientIdSchema = z.object({
  id: z.string().uuid(),
})

export const clientSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
})

export type ClientFormData = z.infer<typeof clientFormSchema>
