import { redis } from './redis'

export function createRateLimiter(limit: number, windowMs: number) {
  const windowSec = Math.ceil(windowMs / 1000)

  // In-memory fallback (used in dev or if Redis is unavailable)
  const timestamps = new Map<string, number[]>()
  setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [key, ts] of timestamps) {
      const fresh = ts.filter(t => t > cutoff)
      if (fresh.length === 0) timestamps.delete(key)
      else timestamps.set(key, fresh)
    }
  }, Math.max(windowMs / 2, 60_000)).unref()

  function isLimitedMemory(key: string): boolean {
    const now = Date.now()
    const cutoff = now - windowMs
    const ts = (timestamps.get(key) ?? []).filter(t => t > cutoff)
    if (ts.length >= limit) return true
    ts.push(now)
    timestamps.set(key, ts)
    return false
  }

  return async function isLimited(key: string): Promise<boolean> {
    if (redis) {
      try {
        const rkey = `rl:${key}`
        const pipeline = redis.pipeline()
        pipeline.incr(rkey)
        pipeline.expire(rkey, windowSec, 'NX') // set expiry only on first increment
        const results = await pipeline.exec()
        const count = (results?.[0]?.[1] ?? 1) as number
        return count > limit
      } catch {
        // Redis error → fall through to in-memory
      }
    }
    return isLimitedMemory(key)
  }
}

// Shared bucket: generate and modify both count toward the same 30 req/hour per user
export const isAiRateLimited = createRateLimiter(30, 60 * 60 * 1000)
