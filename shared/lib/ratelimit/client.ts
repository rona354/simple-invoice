import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({ url, token })
}

const redis = createRedisClient()

export function createRateLimiter(
  config: {
    requests: number
    window: `${number} s` | `${number} m` | `${number} h` | `${number} d`
    prefix: string
  }
) {
  if (!redis) {
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `@invoice/${config.prefix}`,
    analytics: true,
  })
}

export { redis }
