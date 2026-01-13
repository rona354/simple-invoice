'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/shared/lib/supabase'
import { getCurrentUser } from '@/shared/lib/auth'
import { handleActionError, ForbiddenError } from '@/shared/errors'
import { invoiceService } from './service'
import { invoiceFormSchema, updateStatusSchema, invoiceIdSchema } from './schema'
import { generateInvoiceNumber } from './utils'
import type { ActionResult, InvoiceStatus } from '@/shared/types'
import type { Invoice, InvoiceFilter, InvoiceWithProfile } from './types'

export async function createInvoice(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const validated = invoiceFormSchema.parse(formData)
    const invoiceNumber = await generateInvoiceNumber(user.id, supabase)

    const invoice = await invoiceService.create(user.id, invoiceNumber, validated)

    revalidatePath('/dashboard')
    return { success: true, data: { id: invoice.id } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getInvoice(
  id: string
): Promise<ActionResult<{ invoice: InvoiceWithProfile }>> {
  try {
    const user = await getCurrentUser()

    const validated = invoiceIdSchema.parse({ id })
    const invoice = await invoiceService.getByIdWithProfile(validated.id)

    if (invoice.user_id !== user.id) {
      throw new ForbiddenError('Not authorized to access this invoice')
    }

    return { success: true, data: { invoice } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getInvoices(
  filter?: InvoiceFilter
): Promise<ActionResult<{ invoices: Invoice[]; total: number }>> {
  try {
    await getCurrentUser()

    const result = await invoiceService.list(filter)

    return { success: true, data: result }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateInvoice(
  id: string,
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()

    const idValidated = invoiceIdSchema.parse({ id })
    const existing = await invoiceService.getById(idValidated.id)

    if (existing.user_id !== user.id) {
      throw new ForbiddenError('Not authorized to update this invoice')
    }

    const dataValidated = invoiceFormSchema.partial().parse(formData)
    await invoiceService.update(idValidated.id, dataValidated)

    revalidatePath('/dashboard')
    revalidatePath(`/invoices/${id}`)
    return { success: true, data: { id: idValidated.id } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<ActionResult<{ invoice: Invoice }>> {
  try {
    const user = await getCurrentUser()

    const validated = updateStatusSchema.parse({ id, status })
    const existing = await invoiceService.getById(validated.id)

    if (existing.user_id !== user.id) {
      throw new ForbiddenError('Not authorized to update this invoice')
    }

    const invoice = await invoiceService.updateStatus(validated.id, validated.status)

    revalidatePath('/dashboard')
    revalidatePath(`/invoices/${id}`)
    return { success: true, data: { invoice } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteInvoice(
  id: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    const validated = invoiceIdSchema.parse({ id })
    const existing = await invoiceService.getById(validated.id)

    if (existing.user_id !== user.id) {
      throw new ForbiddenError('Not authorized to delete this invoice')
    }

    await invoiceService.delete(validated.id)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function duplicateInvoice(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const validated = invoiceIdSchema.parse({ id })
    const existing = await invoiceService.getById(validated.id)

    if (existing.user_id !== user.id) {
      throw new ForbiddenError('Not authorized to duplicate this invoice')
    }

    const newNumber = await generateInvoiceNumber(user.id, supabase)
    const invoice = await invoiceService.duplicate(validated.id, user.id, newNumber)

    revalidatePath('/dashboard')
    return { success: true, data: { id: invoice.id } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function markInvoiceAsPaid(
  id: string
): Promise<ActionResult<{ invoice: Invoice }>> {
  return updateInvoiceStatus(id, 'paid')
}

export async function sendInvoice(
  id: string
): Promise<ActionResult<{ invoice: Invoice }>> {
  return updateInvoiceStatus(id, 'sent')
}

export async function getPublicInvoice(
  publicId: string
): Promise<ActionResult<{ invoice: InvoiceWithProfile }>> {
  try {
    const invoice = await invoiceService.getByPublicId(publicId)

    if (invoice.status === 'sent' && !invoice.viewed_date) {
      await invoiceService.markAsViewed(invoice.id)
    }

    return { success: true, data: { invoice } }
  } catch (error) {
    return handleActionError(error)
  }
}
