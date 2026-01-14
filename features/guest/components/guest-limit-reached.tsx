'use client'

import Link from 'next/link'
import { Button } from '@/shared/components/ui'
import { getGuestInvoice } from '../storage'

export function GuestLimitReached() {
  const guestState = getGuestInvoice()
  const invoiceNumber = guestState?.invoice?.number ?? 'your invoice'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <span className="text-xl font-bold text-gray-900">Simple Invoice</span>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 rounded-full bg-blue-100 p-4 inline-block">
            <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            You&apos;ve used your free invoice
          </h1>
          <p className="mb-8 text-gray-600">
            Good news: signing up takes 10 seconds and unlocks:
          </p>

          <ul className="mb-8 space-y-3 text-left">
            <li className="flex items-center text-gray-700">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited invoices
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save {invoiceNumber} to your account
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Track payment status
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Send invoices via email
            </li>
            <li className="flex items-center text-gray-700">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Client management
            </li>
          </ul>

          <Link href="/signup">
            <Button size="lg" className="w-full">
              Create Free Account
            </Button>
          </Link>

          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
