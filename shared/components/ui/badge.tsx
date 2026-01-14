'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils'
import { useTranslations } from '@/shared/i18n'
import type { InvoiceStatus } from '@/shared/types'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary'
}

const variantStyles = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  secondary: 'bg-gray-100 text-gray-800',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

const statusVariants: Record<InvoiceStatus, BadgeProps['variant']> = {
  draft: 'secondary',
  sent: 'warning',
  viewed: 'default',
  paid: 'success',
  overdue: 'error',
  cancelled: 'secondary',
}

const statusKeys: Record<InvoiceStatus, string> = {
  draft: 'invoice.statusDraft',
  sent: 'invoice.statusSent',
  viewed: 'invoice.statusViewed',
  paid: 'invoice.statusPaid',
  overdue: 'invoice.statusOverdue',
  cancelled: 'invoice.statusCancelled',
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: InvoiceStatus
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const t = useTranslations()

  return (
    <Badge variant={statusVariants[status]} className={className} {...props}>
      {t(statusKeys[status])}
    </Badge>
  )
}

export { Badge, StatusBadge }
