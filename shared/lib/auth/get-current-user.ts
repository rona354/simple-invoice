import { createServerClient } from '@/shared/lib/supabase'
import { UnauthorizedError } from '@/shared/errors'

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  return user
}
