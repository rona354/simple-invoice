import { resend, getFromEmail } from '@/shared/lib/resend'
import { InvoiceEmailTemplate } from './templates/invoice-email'
import type { SendInvoiceEmailParams, EmailResult } from './types'

class EmailService {
  async sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<EmailResult> {
    try {
      const fromEmail = getFromEmail()
      const attachments = params.pdfBuffer
        ? [
            {
              filename: `invoice-${params.invoiceNumber}.pdf`,
              content: params.pdfBuffer,
            },
          ]
        : undefined

      const { data, error } = await resend.emails.send({
        from: params.senderName
          ? `${params.senderName} <${fromEmail}>`
          : fromEmail,
        to: params.to,
        replyTo: params.senderEmail || undefined,
        subject: `Invoice ${params.invoiceNumber} from ${params.senderName || 'Simple Invoice'}`,
        react: InvoiceEmailTemplate({
          invoiceNumber: params.invoiceNumber,
          clientName: params.clientName,
          amount: params.amount,
          dueDate: params.dueDate,
          publicUrl: params.publicUrl,
          senderName: params.senderName,
        }),
        attachments,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }
}

export const emailService = new EmailService()
