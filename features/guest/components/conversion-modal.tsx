'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'

interface ConversionModalProps {
  open: boolean
  onClose: () => void
}

export function ConversionModal({ open, onClose }: ConversionModalProps) {
  const t = useTranslations()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg p-0 backdrop:bg-black/50"
      onClose={onClose}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          {t('guest.invoiceDownloaded')}
        </h2>

        <hr className="my-4" />

        <p className="mb-4 text-center text-gray-600">
          {t('guest.saveAndUnlock')}
        </p>

        <ul className="mb-6 space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('guest.trackPaymentStatus')}
          </li>
          <li className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('guest.sendReminders')}
          </li>
          <li className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('guest.unlimitedInvoices')}
          </li>
          <li className="flex items-center">
            <svg className="mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('guest.accessAnyDevice')}
          </li>
        </ul>

        <div className="space-y-3">
          <Link href="/signup" className="block">
            <Button className="w-full">{t('auth.continueWithGoogle')}</Button>
          </Link>
          <Link href="/signup" className="block">
            <Button variant="outline" className="w-full">{t('auth.continueWithEmail')}</Button>
          </Link>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          {t('guest.maybeLater')}
        </button>
      </div>
    </dialog>
  )
}
