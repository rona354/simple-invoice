import { cn } from '@/shared/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { icon: 'h-6 w-6', text: 'text-base' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl' },
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        className={cn(s.icon, 'flex-shrink-0')}
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="5" fill="#18181b" />
        <text
          x="16"
          y="25"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="28"
          fontWeight="800"
          fill="white"
          textAnchor="middle"
        >
          SI
        </text>
      </svg>
      {showText && (
        <span className={cn(s.text, 'font-bold text-gray-900')}>
          Simple Invoice
        </span>
      )}
    </div>
  )
}

export const logoSvgString = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="5" fill="#18181b"/>
  <text x="16" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="white" text-anchor="middle">SI</text>
</svg>`
