'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'

interface PdfDownloadProps {
  invoiceId?: string
  publicId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function PdfDownload({
  invoiceId,
  publicId,
  variant = 'default',
  size = 'md',
}: PdfDownloadProps) {
  const t = useTranslations()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    if (!publicId && !invoiceId) {
      setError(t('common.error'))
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const endpoint = publicId
        ? `/api/public/invoices/${publicId}/pdf`
        : `/api/invoices/${invoiceId}/pdf`
      const response = await fetch(endpoint)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || t('common.failed'))
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] ?? 'invoice.pdf'

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.failed')
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const buttonText = isGenerating
    ? t('common.generating')
    : error
      ? t('common.retry')
      : t('invoice.downloadPdf')

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        variant={error ? 'outline' : variant}
        size={size}
        aria-busy={isGenerating}
      >
        {buttonText}
      </Button>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
