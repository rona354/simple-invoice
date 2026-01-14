'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui'

interface PdfShareProps {
  invoiceId?: string
  publicId?: string
  invoiceNumber?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PdfShare({
  invoiceId,
  publicId,
  invoiceNumber = 'invoice',
  size = 'md',
}: PdfShareProps) {
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
    if (!publicId && !invoiceId) {
      setError('Missing invoice ID')
      return
    }

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setIsSharing(true)
    setError(null)

    try {
      const endpoint = publicId
        ? `/api/public/invoices/${publicId}/pdf`
        : `/api/invoices/${invoiceId}/pdf`

      const response = await fetch(endpoint, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const filename = `invoice-${invoiceNumber}.pdf`
      const file = new File([blob], filename, { type: 'application/pdf' })

      await navigator.share({ files: [file] })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const message = err instanceof Error ? err.message : 'Share failed'
      setError(message)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        onClick={handleShare}
        disabled={isSharing}
        loading={isSharing}
        variant="outline"
        size={size}
        aria-busy={isSharing}
      >
        {!isSharing && <ShareIcon />}
        <span className={isSharing ? '' : 'ml-2'}>Share PDF</span>
      </Button>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
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
