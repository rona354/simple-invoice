import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { renderGuestInvoiceToBuffer } from '@/features/guest/pdf'
import type { GuestInvoice } from '@/features/guest'

export const runtime = 'nodejs'

const requestSchema = z.object({
  invoice: z.object({
    number: z.string(),
    date: z.string(),
    due_date: z.string(),
    from: z.object({
      name: z.string(),
      email: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
    }),
    to: z.object({
      name: z.string(),
      email: z.string().optional(),
      address: z.string().optional(),
    }),
    items: z.array(z.object({
      id: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
    })),
    notes: z.string().optional(),
    tax_rate: z.number(),
    currency: z.string(),
  }),
  fingerprint: z.string(),
  invoiceId: z.string().uuid(),
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { invoice, fingerprint, invoiceId } = parsed.data

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? '0.0.0.0'

    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_guest_limit', {
        p_fingerprint: fingerprint,
        p_ip: ip,
      })

    if (limitError) {
      console.error('Rate limit check error:', limitError)
    }

    if (limitCheck && limitCheck[0] && !limitCheck[0].allowed) {
      return NextResponse.json(
        {
          error: 'limit_exceeded',
          reason: limitCheck[0].reason,
          message: 'You have already used your free invoice. Sign up to create more!',
        },
        { status: 429 }
      )
    }

    const { error: insertError } = await supabase
      .from('guest_attempts')
      .insert({
        invoice_id: invoiceId,
        fingerprint,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') ?? null,
        pdf_generated_at: new Date().toISOString(),
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            error: 'limit_exceeded',
            reason: 'duplicate_invoice',
            message: 'This invoice has already been generated. Sign up to create more!',
          },
          { status: 429 }
        )
      }
      console.error('Guest attempt insert error:', insertError)
    }

    const pdfBuffer = renderGuestInvoiceToBuffer(invoice as GuestInvoice)
    const uint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Guest PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
