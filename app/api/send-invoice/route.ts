import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/shared/lib/supabase'
import {
  emailLimiter,
  emailDailyLimiter,
  checkRateLimit,
  rateLimitHeaders,
  rateLimitError,
} from '@/shared/lib/ratelimit'
import { invoiceService } from '@/features/invoice'
import { emailService } from '@/features/email'
import { formatCurrency } from '@/shared/utils'

const sendInvoiceSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [hourlyLimit, dailyLimit] = await Promise.all([
      checkRateLimit(emailLimiter, user.id),
      checkRateLimit(emailDailyLimiter, user.id),
    ])

    if (!hourlyLimit.allowed || !dailyLimit.allowed) {
      const limitResult = !hourlyLimit.allowed ? hourlyLimit : dailyLimit
      return NextResponse.json(
        { success: false, error: rateLimitError(limitResult) },
        { status: 429, headers: rateLimitHeaders(limitResult) }
      )
    }

    const body = await request.json()
    const parsed = sendInvoiceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    const { invoiceId } = parsed.data

    const invoice = await invoiceService.getByIdWithProfile(invoiceId)

    if (invoice.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!invoice.client_email) {
      return NextResponse.json(
        { success: false, error: 'Client email is required to send invoice' },
        { status: 400 }
      )
    }

    const emailResult = await emailService.sendInvoiceEmail({
      to: invoice.client_email,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.client_name,
      amount: formatCurrency(invoice.total_cents, invoice.currency),
      dueDate: invoice.due_date,
      publicUrl: invoice.public_url,
      senderName: invoice.profile.business_name || 'Simple Invoice',
      senderEmail: invoice.profile.business_email,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    await invoiceService.updateStatus(invoiceId, 'sent')

    return NextResponse.json({
      success: true,
      data: { messageId: emailResult.messageId },
    })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
