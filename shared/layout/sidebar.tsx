'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils'
import { navigation } from './navigation'
import { Logo } from './logo'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex w-64 flex-col border-r border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard">
          <Logo size="md" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
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
    </aside>
  )
}
