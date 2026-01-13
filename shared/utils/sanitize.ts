/**
 * Sanitizes a search query for use in PostgreSQL ILIKE patterns.
 * Escapes special characters that have meaning in SQL LIKE patterns
 * and PostgREST filter syntax.
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * Validates that a redirect path is safe (internal only).
 * Prevents open redirect vulnerabilities.
 */
export function sanitizeRedirectPath(path: string, fallback = '/dashboard'): string {
  if (!path || typeof path !== 'string') {
    return fallback
  }

  const trimmed = path.trim()

  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('://') ||
    trimmed.includes('\0')
  ) {
    return fallback
  }

  return trimmed
}
