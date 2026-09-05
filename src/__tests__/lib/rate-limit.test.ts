import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createRateLimiter } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('autorise les requêtes sous la limite', async () => {
    const isLimited = createRateLimiter(3, 60_000)
    expect(await isLimited('ip1')).toBe(false)
    expect(await isLimited('ip1')).toBe(false)
    expect(await isLimited('ip1')).toBe(false)
  })

  it('bloque la requête qui dépasse la limite', async () => {
    const isLimited = createRateLimiter(3, 60_000)
    await isLimited('ip1')
    await isLimited('ip1')
    await isLimited('ip1')
    expect(await isLimited('ip1')).toBe(true)
  })

  it('clés différentes ont des buckets indépendants', async () => {
    const isLimited = createRateLimiter(2, 60_000)
    await isLimited('ip1')
    await isLimited('ip1')
    expect(await isLimited('ip1')).toBe(true)
    expect(await isLimited('ip2')).toBe(false)
  })

  it('autorise à nouveau après expiration de la fenêtre', async () => {
    const isLimited = createRateLimiter(2, 60_000)
    await isLimited('ip1')
    await isLimited('ip1')
    expect(await isLimited('ip1')).toBe(true)

    vi.advanceTimersByTime(61_000)

    expect(await isLimited('ip1')).toBe(false)
  })

  it('limite à exactement N requêtes dans la fenêtre', async () => {
    const isLimited = createRateLimiter(1, 60_000)
    expect(await isLimited('ip1')).toBe(false)
    expect(await isLimited('ip1')).toBe(true)
  })
})
