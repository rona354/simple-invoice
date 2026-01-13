'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui'
import {
  renderPdfToBlob,
  downloadPdfBlob,
  generateInvoiceFilename,
} from '@/shared/lib/pdf'
import { InvoicePdf } from './invoice-pdf'
import type { InvoiceWithProfile } from '../types'

interface PdfDownloadProps {
  invoice: InvoiceWithProfile
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function PdfDownload({
  invoice,
  variant = 'default',
  size = 'md',
}: PdfDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownload() {
    setIsGenerating(true)
    try {
      const blob = await renderPdfToBlob(<InvoicePdf invoice={invoice} />)
      const filename = generateInvoiceFilename(invoice.invoice_number)
      downloadPdfBlob(blob, filename)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
    >
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}
