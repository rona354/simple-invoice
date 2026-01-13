import type { Ratelimit } from '@upstash/ratelimit'

export interface RateLimitResult {
  allowed: boolean
  remaining?: number
  reset?: number
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { allowed: true }
  }

  const result = await limiter.limit(identifier)

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  if (result.remaining === undefined || result.reset === undefined) {
    return {}
  }

  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }

  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString()
  }

  return headers
}

export function rateLimitError(result: RateLimitResult): string {
  if (result.reset === undefined) {
    return 'Too many requests. Please try again later.'
  }

  const seconds = Math.ceil((result.reset - Date.now()) / 1000)
  const minutes = Math.ceil(seconds / 60)

  if (minutes > 1) {
    return `Too many requests. Please try again in ${minutes} minutes.`
  }

  return `Too many requests. Please try again in ${seconds} seconds.`
}
