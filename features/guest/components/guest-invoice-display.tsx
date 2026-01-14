'use client'

import type { GuestInvoice } from '../types'
import { formatCurrency, formatDate, getLanguageLocale } from '@/shared/utils'
import { useTranslations, useLocale } from '@/shared/i18n'

interface GuestInvoiceDisplayProps {
  invoice: GuestInvoice
}

function calculateTotals(invoice: GuestInvoice) {
  const subtotalCents = invoice.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unit_price * 100),
    0
  )
  const taxCents = Math.round(subtotalCents * (invoice.tax_rate / 100))
  const totalCents = subtotalCents + taxCents
  return { subtotalCents, taxCents, totalCents }
}

export function GuestInvoiceDisplay({ invoice }: GuestInvoiceDisplayProps) {
  const { locale } = useLocale()
  const t = useTranslations()
  const dateLocale = getLanguageLocale(locale)
  const { subtotalCents, taxCents, totalCents } = calculateTotals(invoice)
  const isOverdue = new Date(invoice.due_date) < new Date()

  return (
    <div className="bg-white">
      <div className="h-1.5 bg-blue-600 rounded-t-lg" />

      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="text-base font-semibold text-gray-900">
                {invoice.from.name}
              </p>
              {invoice.from.address && <p>{invoice.from.address}</p>}
              {invoice.from.email && <p className="mt-2">{invoice.from.email}</p>}
              {invoice.from.phone && <p>{invoice.from.phone}</p>}
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('invoice.title')}</h1>
            <p className="text-lg font-medium text-gray-700 mt-1">{invoice.number}</p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">{t('invoice.issueDate')}</span>
                <span className="font-medium text-gray-900 w-28 text-left">
                  {formatDate(invoice.date, dateLocale)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">{t('invoice.dueDate')}</span>
                <span className={`font-medium w-28 text-left ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(invoice.due_date, dateLocale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-8 py-6 border-y border-gray-100">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {t('invoice.billTo')}
            </h2>
            <div className="text-sm space-y-0.5">
              <p className="text-base font-semibold text-gray-900">{invoice.to.name}</p>
              {invoice.to.address && (
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.to.address}</p>
              )}
              {invoice.to.email && <p className="text-gray-600 mt-2">{invoice.to.email}</p>}
              {invoice.to.phone && <p className="text-gray-600">{invoice.to.phone}</p>}
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                {t('invoice.amountDue')}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalCents, invoice.currency)}
              </p>
              <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {isOverdue ? t('invoice.overdue') : `${t('invoice.due')} ${formatDate(invoice.due_date, dateLocale)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('invoice.description')}
                </th>
                <th className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  {t('invoice.quantity')}
                </th>
                <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                  {t('invoice.rate')}
                </th>
                <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                  {t('invoice.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, index) => {
                const amountCents = Math.round(item.quantity * item.unit_price * 100)
                return (
                  <tr key={item.id || index}>
                    <td className="py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="py-4 text-sm text-center text-gray-600">{item.quantity}</td>
                    <td className="py-4 text-sm text-right text-gray-600">
                      {formatCurrency(Math.round(item.unit_price * 100), invoice.currency)}
                    </td>
                    <td className="py-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(amountCents, invoice.currency)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">{t('invoice.subtotal')}</span>
                <span className="text-gray-900">
                  {formatCurrency(subtotalCents, invoice.currency)}
                </span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">{t('invoice.taxPercent', { value: invoice.tax_rate })}</span>
                  <span className="text-gray-900">
                    {formatCurrency(taxCents, invoice.currency)}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-gray-900 mt-3 pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">{t('invoice.total')}</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalCents, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                {t('invoice.notesLabel')}
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
