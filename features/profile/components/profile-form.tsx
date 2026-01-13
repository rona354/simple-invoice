'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select, Textarea } from '@/shared/components/ui'
import { CURRENCY_OPTIONS, LOCALE_OPTIONS, DATE_FORMAT_OPTIONS } from '@/shared/config'
import { profileFormSchema, type ProfileFormInput } from '../schema'
import { updateProfile } from '../actions'
import type { Profile } from '../types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      business_name: profile.business_name || '',
      business_email: profile.business_email || '',
      business_phone: profile.business_phone || '',
      business_address: profile.business_address || '',
      business_city: profile.business_city || '',
      business_country: profile.business_country || '',
      business_postal_code: profile.business_postal_code || '',
      tax_id: profile.tax_id || '',
      tax_id_label: profile.tax_id_label,
      default_currency: profile.default_currency,
      default_payment_terms: profile.default_payment_terms,
      default_tax_rate: profile.default_tax_rate,
      default_notes: profile.default_notes || '',
      default_payment_instructions: profile.default_payment_instructions || '',
      locale: profile.locale,
      date_format: profile.date_format,
    },
  })

  async function onSubmit(data: ProfileFormInput) {
    setError(null)
    setSuccess(false)

    const result = await updateProfile(data)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          Profile saved successfully
        </div>
      )}

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Business Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Business Name"
            placeholder="Your Business Name"
            error={errors.business_name?.message}
            {...register('business_name')}
          />
          <Input
            label="Business Email"
            type="email"
            placeholder="business@example.com"
            error={errors.business_email?.message}
            {...register('business_email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            error={errors.business_phone?.message}
            {...register('business_phone')}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              placeholder="123 Business Street"
              error={errors.business_address?.message}
              {...register('business_address')}
            />
          </div>
          <Input
            label="City"
            placeholder="New York"
            error={errors.business_city?.message}
            {...register('business_city')}
          />
          <Input
            label="Country"
            placeholder="United States"
            error={errors.business_country?.message}
            {...register('business_country')}
          />
          <Input
            label="Postal Code"
            placeholder="10001"
            error={errors.business_postal_code?.message}
            {...register('business_postal_code')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Tax Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tax ID Label"
            placeholder="Tax ID, VAT, GST, etc."
            error={errors.tax_id_label?.message}
            {...register('tax_id_label')}
          />
          <Input
            label="Tax ID"
            placeholder="Your tax identification number"
            error={errors.tax_id?.message}
            {...register('tax_id')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Invoice Defaults</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Default Currency"
            options={CURRENCY_OPTIONS}
            error={errors.default_currency?.message}
            {...register('default_currency')}
          />
          <Input
            label="Payment Terms (days)"
            type="number"
            min={0}
            max={365}
            error={errors.default_payment_terms?.message}
            {...register('default_payment_terms')}
          />
          <Input
            label="Default Tax Rate (%)"
            type="number"
            min={0}
            max={100}
            step="0.01"
            error={errors.default_tax_rate?.message}
            {...register('default_tax_rate')}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Default Notes"
            placeholder="Notes that appear on all invoices"
            error={errors.default_notes?.message}
            {...register('default_notes')}
          />
          <Textarea
            label="Default Payment Instructions"
            placeholder="Payment instructions for clients"
            error={errors.default_payment_instructions?.message}
            {...register('default_payment_instructions')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Localization</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Locale"
            options={LOCALE_OPTIONS}
            error={errors.locale?.message}
            {...register('locale')}
          />
          <Select
            label="Date Format"
            options={DATE_FORMAT_OPTIONS}
            error={errors.date_format?.message}
            {...register('date_format')}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
