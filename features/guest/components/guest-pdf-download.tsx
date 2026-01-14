'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui'
import type { GuestInvoice } from '../types'

interface GuestPdfDownloadProps {
  invoice: GuestInvoice
  invoiceId: string
}

export function GuestPdfDownload({ invoice, invoiceId }: GuestPdfDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setIsDownloading(true)
    setError(null)

    try {
      const response = await fetch('/api/guest/pdf/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, invoiceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        loading={isDownloading}
        variant="outline"
        size="sm"
      >
        {!isDownloading && <DownloadIcon />}
        <span className={isDownloading ? '' : 'ml-2'}>Download PDF</span>
      </Button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
