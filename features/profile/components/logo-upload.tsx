'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'
import { uploadLogo, deleteLogo } from '../actions'

interface LogoUploadProps {
  currentLogoUrl: string | null
}

export function LogoUpload({ currentLogoUrl }: LogoUploadProps) {
  const t = useTranslations()
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadLogo(formData)

    setUploading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setLogoUrl(result.data?.logoUrl ?? null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleDelete() {
    setError(null)
    setDeleting(true)

    const result = await deleteLogo()

    setDeleting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setLogoUrl(null)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={t('settings.businessLogo')}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          loading={uploading}
          disabled={deleting}
        >
          {logoUrl ? t('settings.changeLogo') : t('settings.uploadLogo')}
        </Button>

        {logoUrl && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            loading={deleting}
            disabled={uploading}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {t('settings.removeLogo')}
          </Button>
        )}

        <p className="text-xs text-gray-500">
          {t('settings.logoHint')}
        </p>
      </div>
    </div>
  )
}
