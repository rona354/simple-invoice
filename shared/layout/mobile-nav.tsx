'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils'
import { navigation } from './navigation'
import { XIcon } from './icons'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-gray-600/75"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <span className="text-xl font-bold text-gray-900">Simple Invoice</span>
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
