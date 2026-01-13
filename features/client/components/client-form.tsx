'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/shared/components/ui'
import { clientFormSchema, type ClientFormData } from '../schema'
import { createClient, updateClient } from '../actions'
import type { Client } from '../types'

interface ClientFormProps {
  client?: Client
  onSuccess?: (client: Client) => void
  onCancel?: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!client

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      city: client?.city || '',
      country: client?.country || '',
      postal_code: client?.postal_code || '',
      tax_id: client?.tax_id || '',
    },
  })

  async function onSubmit(data: ClientFormData) {
    setError(null)

    const result = isEditing
      ? await updateClient(client.id, data)
      : await createClient(data)

    if (!result.success) {
      setError(result.error)
      return
    }

    if (result.data?.client && onSuccess) {
      onSuccess(result.data.client)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        label="Client Name"
        placeholder="Client or Company Name"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          placeholder="client@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label="Address"
        placeholder="123 Client Street"
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="City"
          placeholder="New York"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="Country"
          placeholder="United States"
          error={errors.country?.message}
          {...register('country')}
        />
        <Input
          label="Postal Code"
          placeholder="10001"
          error={errors.postal_code?.message}
          {...register('postal_code')}
        />
      </div>

      <Input
        label="Tax ID"
        placeholder="Client tax identification number"
        error={errors.tax_id?.message}
        {...register('tax_id')}
      />

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}
