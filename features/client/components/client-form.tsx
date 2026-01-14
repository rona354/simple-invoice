'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/shared/components/ui'
import { useTranslations } from '@/shared/i18n'
import { clientFormSchema, type ClientFormData } from '../schema'
import { createClient, updateClient } from '../actions'
import type { Client } from '../types'

interface ClientFormProps {
  client?: Client
  onSuccess?: (client: Client) => void
  onCancel?: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const t = useTranslations()
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
        label={t('client.clientName')}
        placeholder={t('client.clientNamePlaceholder')}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('client.email')}
          type="email"
          placeholder={t('client.emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('client.phone')}
          type="tel"
          placeholder={t('client.phonePlaceholder')}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label={t('client.address')}
        placeholder={t('client.addressPlaceholder')}
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t('client.city')}
          placeholder={t('client.cityPlaceholder')}
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label={t('client.country')}
          placeholder={t('client.countryPlaceholder')}
          error={errors.country?.message}
          {...register('country')}
        />
        <Input
          label={t('client.postalCode')}
          placeholder={t('client.postalCodePlaceholder')}
          error={errors.postal_code?.message}
          {...register('postal_code')}
        />
      </div>

      <Input
        label={t('client.taxId')}
        placeholder={t('client.taxIdPlaceholder')}
        error={errors.tax_id?.message}
        {...register('tax_id')}
      />

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? t('client.updateClient') : t('client.createClient')}
        </Button>
      </div>
    </form>
  )
}
