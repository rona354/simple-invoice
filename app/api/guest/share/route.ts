import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

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
      phone: z.string().optional(),
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

    const { error: upsertError } = await supabase
      .from('guest_attempts')
      .upsert(
        {
          invoice_id: invoiceId,
          fingerprint,
          ip_address: ip,
          user_agent: request.headers.get('user-agent') ?? null,
          invoice_data: invoice,
        },
        { onConflict: 'invoice_id' }
      )

    if (upsertError) {
      console.error('Guest share upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save invoice' },
        { status: 500 }
      )
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://simple-invoice-chi.vercel.app'}/g/${invoiceId}`

    return NextResponse.json({ publicUrl, invoiceId })
  } catch (error) {
    console.error('Guest share error:', error)
    return NextResponse.json(
      { error: 'Failed to share invoice' },
      { status: 500 }
    )
  }
}
