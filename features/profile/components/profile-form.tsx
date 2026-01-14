'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Select, Textarea } from '@/shared/components/ui'
import { CURRENCY_OPTIONS, LOCALE_OPTIONS, DATE_FORMAT_OPTIONS } from '@/shared/config'
import { useTranslations } from '@/shared/i18n'
import { profileFormSchema, type ProfileFormInput } from '../schema'
import { updateProfile } from '../actions'
import type { Profile } from '../types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations()
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
          {t('settings.profileSaved')}
        </div>
      )}

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">{t('settings.businessInfo')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('settings.businessName')}
            placeholder={t('settings.businessNamePlaceholder')}
            error={errors.business_name?.message}
            {...register('business_name')}
          />
          <Input
            label={t('settings.businessEmail')}
            type="email"
            placeholder={t('settings.businessEmailPlaceholder')}
            error={errors.business_email?.message}
            {...register('business_email')}
          />
          <Input
            label={t('settings.businessPhone')}
            type="tel"
            placeholder={t('settings.businessPhonePlaceholder')}
            error={errors.business_phone?.message}
            {...register('business_phone')}
          />
          <div className="sm:col-span-2">
            <Input
              label={t('settings.businessAddress')}
              placeholder={t('settings.businessAddressPlaceholder')}
              error={errors.business_address?.message}
              {...register('business_address')}
            />
          </div>
          <Input
            label={t('settings.businessCity')}
            placeholder={t('settings.businessCityPlaceholder')}
            error={errors.business_city?.message}
            {...register('business_city')}
          />
          <Input
            label={t('settings.businessCountry')}
            placeholder={t('settings.businessCountryPlaceholder')}
            error={errors.business_country?.message}
            {...register('business_country')}
          />
          <Input
            label={t('settings.businessPostalCode')}
            placeholder={t('settings.businessPostalCodePlaceholder')}
            error={errors.business_postal_code?.message}
            {...register('business_postal_code')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">{t('settings.taxInfo')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('settings.taxIdLabel')}
            placeholder={t('settings.taxIdLabelPlaceholder')}
            error={errors.tax_id_label?.message}
            {...register('tax_id_label')}
          />
          <Input
            label={t('settings.taxId')}
            placeholder={t('settings.taxIdPlaceholder')}
            error={errors.tax_id?.message}
            {...register('tax_id')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">{t('settings.invoiceDefaults')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('settings.defaultCurrency')}
            options={CURRENCY_OPTIONS}
            error={errors.default_currency?.message}
            {...register('default_currency')}
          />
          <Input
            label={t('settings.defaultPaymentTerms')}
            type="number"
            min={0}
            max={365}
            error={errors.default_payment_terms?.message}
            {...register('default_payment_terms')}
          />
          <Input
            label={t('settings.defaultTaxRate')}
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
            label={t('settings.defaultNotes')}
            placeholder={t('settings.defaultNotesPlaceholder')}
            error={errors.default_notes?.message}
            {...register('default_notes')}
          />
          <Textarea
            label={t('settings.defaultPaymentInstructions')}
            placeholder={t('settings.defaultPaymentInstructionsPlaceholder')}
            error={errors.default_payment_instructions?.message}
            {...register('default_payment_instructions')}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-medium text-gray-900">{t('settings.localization')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('settings.locale')}
            options={LOCALE_OPTIONS}
            error={errors.locale?.message}
            {...register('locale')}
          />
          <Select
            label={t('settings.dateFormat')}
            options={DATE_FORMAT_OPTIONS}
            error={errors.date_format?.message}
            {...register('date_format')}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {t('settings.saveChanges')}
        </Button>
      </div>
    </form>
  )
}
