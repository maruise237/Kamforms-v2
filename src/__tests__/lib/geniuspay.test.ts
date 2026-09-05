import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeniusPayApiError, getGeniusPayPayment, isGeniusPayPaymentNotFoundError } from '@/lib/geniuspay'

describe('createGeniusPayCheckout', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('sends and returns the merchant reference when GeniusPay omits its own reference', async () => {
    const { createGeniusPayCheckout } = await import('@/lib/geniuspay')
    vi.stubEnv('GENIUSPAY_API_KEY', 'pk_test')
    vi.stubEnv('GENIUSPAY_API_SECRET', 'sk_test')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { checkout_url: 'https://pay.genius.ci/checkout/test' },
    })))

    const checkout = await createGeniusPayCheckout({
      amount: 5000,
      description: 'Pro mensuel',
      reference: 'kamforms_test_reference',
      customer: { country: 'CI' },
      successUrl: 'https://kamforms.test/success',
      errorUrl: 'https://kamforms.test/error',
      metadata: { user_id: 'user_1', plan_id: 'pro_monthly' },
    })

    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      reference: 'kamforms_test_reference',
    })
    expect(checkout.reference).toBe('kamforms_test_reference')
  })
})

describe('getGeniusPayPayment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('marks GeniusPay transaction lookup misses as payment not found errors', async () => {
    vi.stubEnv('GENIUSPAY_API_KEY', 'pk_test')
    vi.stubEnv('GENIUSPAY_API_SECRET', 'sk_test')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: { message: 'Transaction not found' },
    }), { status: 404 }))

    await expect(getGeniusPayPayment('missing-reference')).rejects.toMatchObject({
      message: 'Transaction not found',
      status: 404,
      paymentNotFound: true,
    })

    const error = new GeniusPayApiError('Transaction not found', { status: 404 })
    expect(isGeniusPayPaymentNotFoundError(error)).toBe(true)
  })
})
