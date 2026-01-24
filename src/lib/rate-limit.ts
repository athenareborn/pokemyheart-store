import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitOptions {
  keyPrefix: string
  limit: number
  windowMs: number
}

const upstashEnabled = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

const localBuckets = new Map<string, { count: number; resetAt: number }>()
const limiterCache = new Map<string, Ratelimit>()

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp.trim()
  }

  return 'unknown'
}

const getLimiter = (limit: number, windowMs: number) => {
  const key = `${limit}:${windowMs}`
  const cached = limiterCache.get(key)
  if (cached) {
    return cached
  }

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
  })
  limiterCache.set(key, limiter)
  return limiter
}

export async function rateLimit(request: Request, options: RateLimitOptions) {
  try {
    const identifier = `${options.keyPrefix}:${getClientIp(request)}`
    let success = true
    let remaining = options.limit
    let resetAt = Date.now() + options.windowMs
    if (upstashEnabled) {
      const limiter = getLimiter(options.limit, options.windowMs)
      const result = await limiter.limit(identifier)
      success = result.success
      remaining = result.remaining
      resetAt = result.reset
    } else {
      const now = Date.now()
      const existing = localBuckets.get(identifier)
      if (!existing || existing.resetAt <= now) {
        localBuckets.set(identifier, { count: 1, resetAt: now + options.windowMs })
        remaining = options.limit - 1
      } else {
        existing.count += 1
        remaining = Math.max(0, options.limit - existing.count)
        resetAt = existing.resetAt
        success = existing.count <= options.limit
      }
    }

    if (success) {
      return null
    }

    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    const response = NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
    response.headers.set('Retry-After', String(retryAfter))
    response.headers.set('X-RateLimit-Limit', String(options.limit))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)))
    return response
  } catch (error) {
    console.warn('Rate limit failed open:', error)
    return null
  }
}
