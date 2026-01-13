import { Metadata } from 'next'
import { getProfile, ProfileForm, LogoUpload } from '@/features/profile'

export const metadata: Metadata = {
  title: 'Settings - Simple Invoice',
  description: 'Manage your business settings and preferences',
}

export default async function SettingsPage() {
  const result = await getProfile()

  if (!result.success || !result.data?.profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    )
  }

  const profile = result.data.profile

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your business information and invoice defaults
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Business Logo</h2>
          <LogoUpload currentLogoUrl={profile.logo_url} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
