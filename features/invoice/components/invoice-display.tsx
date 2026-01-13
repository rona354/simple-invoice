'use client'

import Image from 'next/image'
import type { InvoiceWithProfile } from '../types'
import { formatCurrency, formatDate } from '@/shared/utils'

interface InvoiceDisplayProps {
  invoice: InvoiceWithProfile
  showStatus?: boolean
  statusBadge?: React.ReactNode
  actions?: React.ReactNode
}

export function InvoiceDisplay({ invoice, showStatus, statusBadge, actions }: InvoiceDisplayProps) {
  const { profile } = invoice
  const isPaid = invoice.status === 'paid'
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid

  return (
    <div className="invoice-display bg-white">
      {/* Header with accent bar */}
      <div className="h-1.5 bg-blue-600 rounded-t-lg" />

      <div className="p-8">
        {/* Top Section: Logo/Business + Invoice Title */}
        <div className="flex justify-between items-start mb-8">
          {/* Left: Logo & Business Info */}
          <div className="flex-1">
            {profile.logo_url ? (
              <div className="mb-4">
                <Image
                  src={profile.logo_url}
                  alt={profile.business_name || 'Business Logo'}
                  width={180}
                  height={60}
                  className="h-12 w-auto object-contain object-left"
                />
              </div>
            ) : null}
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="text-base font-semibold text-gray-900">
                {profile.business_name || 'Your Business'}
              </p>
              {profile.business_address && <p>{profile.business_address}</p>}
              {(profile.business_city || profile.business_postal_code) && (
                <p>
                  {[profile.business_city, profile.business_postal_code].filter(Boolean).join(', ')}
                </p>
              )}
              {profile.business_country && <p>{profile.business_country}</p>}
              {profile.business_email && <p className="mt-2">{profile.business_email}</p>}
              {profile.business_phone && <p>{profile.business_phone}</p>}
              {profile.tax_id && (
                <p className="mt-2 text-gray-500">
                  {profile.tax_id_label}: {profile.tax_id}
                </p>
              )}
            </div>
          </div>

          {/* Right: Invoice Title & Meta */}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
            <p className="text-lg font-medium text-gray-700 mt-1">{invoice.invoice_number}</p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Issue Date</span>
                <span className="font-medium text-gray-900 w-28 text-left">
                  {formatDate(invoice.issue_date)}
                </span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-end gap-4">
                  <span className="text-gray-500">Due Date</span>
                  <span className={`font-medium w-28 text-left ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(invoice.due_date)}
                  </span>
                </div>
              )}
            </div>
            {showStatus && statusBadge && (
              <div className="mt-4">{statusBadge}</div>
            )}
          </div>
        </div>

        {/* Bill To + Amount Due */}
        <div className="flex justify-between items-start mb-8 py-6 border-y border-gray-100">
          {/* Bill To */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Bill To
            </h2>
            <div className="text-sm space-y-0.5">
              <p className="text-base font-semibold text-gray-900">{invoice.client_name}</p>
              {invoice.client_address && (
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.client_address}</p>
              )}
              {invoice.client_email && <p className="text-gray-600 mt-2">{invoice.client_email}</p>}
              {invoice.client_phone && <p className="text-gray-600">{invoice.client_phone}</p>}
              {invoice.client_tax_id && (
                <p className="text-gray-500 mt-2">Tax ID: {invoice.client_tax_id}</p>
              )}
            </div>
          </div>

          {/* Amount Due Box */}
          <div className="text-right">
            <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                {isPaid ? 'Amount Paid' : 'Amount Due'}
              </p>
              <p className={`text-3xl font-bold ${isPaid ? 'text-green-600' : 'text-gray-900'}`}>
                {formatCurrency(invoice.total_cents, invoice.currency)}
              </p>
              {invoice.due_date && !isPaid && (
                <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {isOverdue ? 'Overdue' : `Due ${formatDate(invoice.due_date)}`}
                </p>
              )}
              {isPaid && invoice.paid_date && (
                <p className="text-sm text-green-600 mt-1">
                  Paid {formatDate(invoice.paid_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  Qty
                </th>
                <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                  Rate
                </th>
                <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="group">
                  <td className="py-4 text-sm text-gray-900">
                    {item.description}
                    {item.unit && (
                      <span className="text-gray-400 ml-1">({item.unit})</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-sm text-right text-gray-600">
                    {formatCurrency(item.unit_price_cents, invoice.currency)}
                  </td>
                  <td className="py-4 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.amount_cents, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(invoice.subtotal_cents, invoice.currency)}
                </span>
              </div>
              {invoice.discount_cents > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">
                    Discount
                    {invoice.discount_type === 'percentage' && ` (${invoice.discount_value}%)`}
                  </span>
                  <span className="text-red-600">
                    -{formatCurrency(invoice.discount_cents, invoice.currency)}
                  </span>
                </div>
              )}
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                  <span className="text-gray-900">
                    {formatCurrency(invoice.tax_cents, invoice.currency)}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-gray-900 mt-3 pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.total_cents, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Sections */}
        {(invoice.payment_instructions || invoice.notes || invoice.terms) && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {invoice.payment_instructions && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
                  Payment Instructions
                </h3>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">
                  {invoice.payment_instructions}
                </p>
              </div>
            )}
            {invoice.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Terms & Conditions
                </h3>
                <p className="text-xs text-gray-500 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {invoice.footer && (
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">{invoice.footer}</p>
          </div>
        )}

        {/* Actions (for web only) */}
        {actions && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
