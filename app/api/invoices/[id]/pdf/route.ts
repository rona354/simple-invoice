import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getCurrentUser, assertOwnership } from '@/shared/lib/auth'
import { invoiceService } from '@/features/invoice/service'
import { invoiceIdSchema } from '@/features/invoice/schema'
import { renderInvoiceToBuffer } from '@/features/invoice/pdf/invoice-pdf'
import { generateInvoiceFilename } from '@/shared/lib/pdf'
import { AppError } from '@/shared/errors'
import { getLocaleFromString } from '@/shared/i18n'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    const validated = invoiceIdSchema.parse({ id })
    const invoice = await invoiceService.getByIdWithProfile(validated.id)

    assertOwnership(invoice, user.id, 'invoice')

    const cookieStore = await cookies()
    const locale = getLocaleFromString(cookieStore.get('NEXT_LOCALE')?.value)

    const buffer = await renderInvoiceToBuffer(invoice, locale)
    const filename = generateInvoiceFilename(invoice.invoice_number)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
