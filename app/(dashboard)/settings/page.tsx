import { Metadata } from 'next'
import { getProfile, ProfileForm, LogoUpload, SettingsPageHeader, SettingsLogoSection, SettingsLoadError } from '@/features/profile'

export const metadata: Metadata = {
  title: 'Settings - Simple Invoice',
  description: 'Manage your business settings and preferences',
}

export default async function SettingsPage() {
  const result = await getProfile()

  if (!result.success || !result.data?.profile) {
    return <SettingsLoadError />
  }

  const profile = result.data.profile

  return (
    <div className="mx-auto max-w-3xl">
      <SettingsPageHeader />

      <div className="space-y-6">
        <SettingsLogoSection>
          <LogoUpload currentLogoUrl={profile.logo_url} />
        </SettingsLogoSection>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
