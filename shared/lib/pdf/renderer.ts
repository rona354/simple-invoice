export function generateInvoiceFilename(invoiceNumber: string): string {
  const sanitized = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')
  return `invoice-${sanitized}.pdf`
}
