import { createServerClient } from '@/shared/lib/supabase'
import { UnauthorizedError, ForbiddenError } from '@/shared/errors'

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  return user
}

export function assertOwnership(
  resource: { user_id: string },
  userId: string,
  resourceName: string,
  action: 'access' | 'update' | 'delete' | 'duplicate' = 'access'
): void {
  if (resource.user_id !== userId) {
    throw new ForbiddenError(`Not authorized to ${action} this ${resourceName}`)
  }
}
