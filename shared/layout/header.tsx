'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/features/auth'
import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/utils'

interface HeaderProps {
  user?: {
    email?: string
  }
  onMenuClick?: () => void
  className?: string
}

export function Header({ user, onMenuClick, className }: HeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDropdown, setShowDropdown] = useState(false)

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6',
        className
      )}
    >
      <button
        type="button"
        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open menu</span>
        <MenuIcon className="h-6 w-6" />
      </button>

      <div className="flex-1 lg:hidden" />

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="hidden sm:inline">{user?.email ?? 'Account'}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowDropdown(false)
                  router.push('/settings')
                }}
              >
                Settings
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                onClick={handleLogout}
                disabled={isPending}
              >
                {isPending ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  )
}
