'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/shared/lib/supabase'
import { getCurrentUser } from '@/shared/lib/auth'
import { handleActionError } from '@/shared/errors'
import { profileService } from './service'
import { profileFormSchema } from './schema'
import type { ActionResult } from '@/shared/types'
import type { Profile } from './types'

export async function getProfile(): Promise<ActionResult<{ profile: Profile }>> {
  try {
    const user = await getCurrentUser()
    const profile = await profileService.getByUserIdOrCreate(user.id)

    return { success: true, data: { profile } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateProfile(
  formData: unknown
): Promise<ActionResult<{ profile: Profile }>> {
  try {
    const user = await getCurrentUser()
    const validated = profileFormSchema.parse(formData)
    const profile = await profileService.update(user.id, validated)

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true, data: { profile } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function uploadLogo(
  formData: FormData
): Promise<ActionResult<{ logoUrl: string }>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const file = formData.get('file') as File | null

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
        code: 'VALIDATION_ERROR',
      }
    }

    if (file.size > 2 * 1024 * 1024) {
      return {
        success: false,
        error: 'File must be less than 2MB',
        code: 'VALIDATION_ERROR',
      }
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }

    const fileExt = mimeToExt[file.type]
    if (!fileExt) {
      return {
        success: false,
        error: 'File must be a valid image (JPEG, PNG, or WebP)',
        code: 'VALIDATION_ERROR',
      }
    }

    const fileName = `${user.id}/logo.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      return {
        success: false,
        error: 'Failed to upload logo',
        code: 'UPLOAD_ERROR',
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    await profileService.updateLogo(user.id, publicUrl)

    revalidatePath('/settings')
    return { success: true, data: { logoUrl: publicUrl } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteLogo(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { error: deleteError } = await supabase.storage
      .from('logos')
      .remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.webp`])

    if (deleteError) {
      console.error('Failed to delete logo files:', deleteError)
    }

    await profileService.updateLogo(user.id, null)

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getProfileDefaults(): Promise<ActionResult<{
  currency: string
  paymentTerms: number
  taxRate: number
  notes: string | null
  paymentInstructions: string | null
}>> {
  try {
    const user = await getCurrentUser()
    const defaults = await profileService.getDefaults(user.id)

    return { success: true, data: defaults }
  } catch (error) {
    return handleActionError(error)
  }
}
