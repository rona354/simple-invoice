import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { renderGuestInvoiceToBuffer } from '@/features/guest/pdf'
import { getLocaleFromString } from '@/shared/i18n'
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
  invoiceId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { invoice } = parsed.data

    const cookieStore = await cookies()
    const locale = getLocaleFromString(cookieStore.get('NEXT_LOCALE')?.value)

    const pdfBuffer = renderGuestInvoiceToBuffer(invoice as GuestInvoice, locale)
    const uint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Public guest PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
