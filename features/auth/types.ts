import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  confirmPassword: string
}

export type AuthProvider = 'google' | 'github'

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    created_at: user.created_at,
  }
}
