import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils'
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

const statusConfig: Record<InvoiceStatus, { variant: BadgeProps['variant']; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  sent: { variant: 'warning', label: 'Sent' },
  viewed: { variant: 'default', label: 'Viewed' },
  paid: { variant: 'success', label: 'Paid' },
  overdue: { variant: 'error', label: 'Overdue' },
  cancelled: { variant: 'secondary', label: 'Cancelled' },
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: InvoiceStatus
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  )
}

export { Badge, StatusBadge }
