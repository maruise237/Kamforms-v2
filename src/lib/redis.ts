import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis | null }

function makeRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) return null
  return new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  })
}

export const redis = globalForRedis.redis ?? makeRedis()
globalForRedis.redis = redis
