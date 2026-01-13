import { z } from 'zod'

export const lineItemFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Price must be 0 or greater'),
})

export const invoiceFormSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email').optional().or(z.literal('')),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  client_tax_id: z.string().optional(),
  items: z.array(lineItemFormSchema).min(1, 'At least one item is required'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_type: z.enum(['fixed', 'percentage']).default('fixed'),
  discount_value: z.number().min(0).default(0),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  notes: z.string().optional(),
  payment_instructions: z.string().optional(),
})

export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'paid',
  'overdue',
  'cancelled',
])

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: invoiceStatusSchema,
})

export const invoiceIdSchema = z.object({
  id: z.string().uuid(),
})

export type LineItemFormData = z.infer<typeof lineItemFormSchema>
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>
export type InvoiceStatusValue = z.infer<typeof invoiceStatusSchema>
