'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/shared/lib/supabase'
import {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
  checkRateLimit,
  rateLimitError,
} from '@/shared/lib/ratelimit'
import { handleActionError } from '@/shared/errors'
import { loginSchema, signupSchema, resetPasswordSchema, updatePasswordSchema } from './schema'
import { toAuthUser } from './types'
import type { ActionResult } from '@/shared/types'
import type { AuthUser, AuthProvider } from './types'

async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
}

export async function login(formData: unknown): Promise<ActionResult<{ user: AuthUser }>> {
  try {
    const validated = loginSchema.parse(formData)

    const ip = await getClientIp()
    const rateLimitResult = await checkRateLimit(loginLimiter, `${ip}:${validated.email}`)

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitError(rateLimitResult),
        code: 'RATE_LIMIT',
      }
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    return { success: true, data: { user: toAuthUser(data.user) } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function signup(formData: unknown): Promise<ActionResult<{ user: AuthUser }>> {
  try {
    const validated = signupSchema.parse(formData)

    const ip = await getClientIp()
    const rateLimitResult = await checkRateLimit(signupLimiter, ip)

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitError(rateLimitResult),
        code: 'RATE_LIMIT',
      }
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Failed to create user',
        code: 'AUTH_ERROR',
      }
    }

    return { success: true, data: { user: toAuthUser(data.user) } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function logout(): Promise<ActionResult> {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function logoutAndRedirect(): Promise<never> {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: unknown): Promise<ActionResult> {
  try {
    const validated = resetPasswordSchema.parse(formData)

    const rateLimitResult = await checkRateLimit(passwordResetLimiter, validated.email)

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitError(rateLimitResult),
        code: 'RATE_LIMIT',
      }
    }

    const supabase = await createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updatePassword(formData: unknown): Promise<ActionResult> {
  try {
    const validated = updatePasswordSchema.parse(formData)
    const supabase = await createServerClient()

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function signInWithOAuth(provider: AuthProvider): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      }
    }

    return { success: true, data: { url: data.url } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getCurrentUser(): Promise<ActionResult<{ user: AuthUser | null }>> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    return {
      success: true,
      data: { user: user ? toAuthUser(user) : null },
    }
  } catch (error) {
    return handleActionError(error)
  }
}
