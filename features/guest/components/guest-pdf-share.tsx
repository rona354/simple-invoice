'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'
import type { GuestInvoice } from '../types'

interface GuestPdfShareProps {
  invoice: GuestInvoice
  fingerprint: string
  invoiceId: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GuestPdfShare({
  invoice,
  fingerprint,
  invoiceId,
  disabled = false,
  size = 'md',
  className,
}: GuestPdfShareProps) {
  const t = useTranslations()
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canShareFiles, setCanShareFiles] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'canShare' in navigator) {
      try {
        const testFile = new File([''], 'test.pdf', { type: 'application/pdf' })
        setCanShareFiles(navigator.canShare({ files: [testFile] }))
      } catch {
        setCanShareFiles(false)
      }
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  if (!canShareFiles) {
    return null
  }

  async function handleShare() {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsSharing(true)
    setError(null)

    try {
      const response = await fetch('/api/guest/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, fingerprint, invoiceId }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || t('guest.failedToGeneratePdf'))
      }

      const blob = await response.blob()
      const filename = `invoice-${invoice.number}.pdf`
      const file = new File([blob], filename, { type: 'application/pdf' })

      await navigator.share({ files: [file] })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const message = err instanceof Error ? err.message : t('guest.shareFailed')
      setError(message)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing || disabled}
      loading={isSharing}
      variant="outline"
      size={size}
      className={className}
      aria-busy={isSharing}
      title={error || undefined}
    >
      {!isSharing && <ShareIcon />}
      <span className={isSharing ? '' : 'ml-2'}>{t('invoice.sharePdf')}</span>
    </Button>
  )
}

function ShareIcon() {
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
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
