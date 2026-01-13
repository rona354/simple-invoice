export interface SendInvoiceEmailParams {
  to: string
  invoiceNumber: string
  clientName: string
  amount: string
  dueDate: string | null
  publicUrl: string
  senderName: string
  senderEmail: string | null
  pdfBuffer?: Buffer
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}
