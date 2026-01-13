'use client'

import { useState, useEffect, useRef } from 'react'
import { Input, Spinner } from '@/shared/components/ui'
import { useDebounce } from '@/shared/hooks'
import { searchClients } from '../actions'
import type { Client } from '../types'

interface ClientAutocompleteProps {
  value?: string
  onChange: (value: string) => void
  onClientSelect?: (client: Client) => void
  placeholder?: string
  label?: string
  error?: string
}

export function ClientAutocomplete({
  value = '',
  onChange,
  onClientSelect,
  placeholder = 'Search or enter client name',
  label = 'Client Name',
  error,
}: ClientAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [clients, setClients] = useState<Client[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value])

  useEffect(() => {
    async function fetchClients() {
      if (debouncedQuery.length < 2) {
        setClients([])
        return
      }

      setIsLoading(true)
      const result = await searchClients(debouncedQuery, 5)
      setIsLoading(false)

      if (result.success && result.data) {
        setClients(result.data.clients)
        setIsOpen(result.data.clients.length > 0)
      }
    }

    fetchClients()
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setSelectedIndex(-1)
  }

  function handleClientClick(client: Client) {
    setQuery(client.name)
    onChange(client.name)
    onClientSelect?.(client)
    setIsOpen(false)
    setClients([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || clients.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < clients.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && clients[selectedIndex]) {
          handleClientClick(clients[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  function formatClientInfo(client: Client): string {
    const parts: string[] = []
    if (client.email) parts.push(client.email)
    if (client.city) parts.push(client.city)
    return parts.join(' • ')
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        label={label}
        value={query}
        onChange={handleInputChange}
        onFocus={() => clients.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute right-3 top-9">
          <Spinner size="sm" />
        </div>
      )}

      {isOpen && clients.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {clients.map((client, index) => (
            <li
              key={client.id}
              onClick={() => handleClientClick(client)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`cursor-pointer px-3 py-2 ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">{client.name}</div>
              {formatClientInfo(client) && (
                <div className="text-sm text-gray-500">{formatClientInfo(client)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
