import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { invoiceService } from '@/features/invoice/service'
import { renderInvoiceToBuffer } from '@/features/invoice/pdf/invoice-pdf'
import { generateInvoiceFilename } from '@/shared/lib/pdf'
import { AppError } from '@/shared/errors'

const publicIdSchema = z.object({
  publicId: z.string().uuid(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params

    const validated = publicIdSchema.parse({ publicId })
    const invoice = await invoiceService.getByPublicId(validated.publicId)

    const buffer = await renderInvoiceToBuffer(invoice)
    const filename = generateInvoiceFilename(invoice.invoice_number)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid public ID' }, { status: 400 })
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
