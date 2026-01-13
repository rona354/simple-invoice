import { pdf } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export async function renderPdfToBlob(document: ReactElement): Promise<Blob> {
  return await pdf(document).toBlob()
}

export async function renderPdfToBuffer(document: ReactElement): Promise<Buffer> {
  const blob = await pdf(document).toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateInvoiceFilename(invoiceNumber: string): string {
  const sanitized = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')
  return `invoice-${sanitized}.pdf`
}
