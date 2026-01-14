import { z } from 'zod'

export const guestLineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Price must be 0 or greater'),
})

export const guestInvoiceFormSchema = z.object({
  from_name: z.string().min(1, 'Your business name is required'),
  from_email: z.string().email('Invalid email').optional().or(z.literal('')),
  from_address: z.string().optional(),

  to_name: z.string().min(1, 'Client name is required'),
  to_email: z.string().email('Invalid email').optional().or(z.literal('')),
  to_phone: z.string().optional(),
  to_address: z.string().optional(),

  items: z.array(guestLineItemSchema).min(1, 'At least one item is required'),
  tax_rate: z.number().min(0).max(100).default(0),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
})

export type GuestInvoiceFormData = z.infer<typeof guestInvoiceFormSchema>
