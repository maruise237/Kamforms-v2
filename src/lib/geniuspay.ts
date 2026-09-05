const GENIUSPAY_BASE_URL = 'https://pay.genius.ci/api/v1/merchant'

type GeniusPayCustomer = {
  name?: string
  email?: string
  phone?: string
  country?: string
}

type CreateCheckoutInput = {
  amount: number
  description: string
  reference: string
  customer: GeniusPayCustomer
  successUrl: string
  errorUrl: string
  metadata: Record<string, string | number | boolean>
}

type GeniusPayCheckoutResponse = {
  success: boolean
  data?: {
    reference?: string
    checkout_url?: string
    payment_url?: string
    status?: string
  }
  error?: {
    code?: string
    message?: string
  }
}

type GeniusPayPaymentResponse = {
  success: boolean
  data?: {
    reference?: string
    status?: string
    metadata?: Record<string, unknown>
  }
  error?: {
    code?: string
    message?: string
  }
}

export class GeniusPayApiError extends Error {
  status?: number
  code?: string
  paymentNotFound: boolean

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message)
    this.name = 'GeniusPayApiError'
    this.status = options.status
    this.code = options.code
    this.paymentNotFound = options.status === 404 || /transaction not found/i.test(message)
  }
}

export function isGeniusPayPaymentNotFoundError(error: unknown) {
  return error instanceof GeniusPayApiError && error.paymentNotFound
}

function getGeniusPayCredentials() {
  const apiKey = process.env.GENIUSPAY_API_KEY
  const apiSecret = process.env.GENIUSPAY_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('GENIUSPAY_API_KEY and GENIUSPAY_API_SECRET must be configured.')
  }

  return { apiKey, apiSecret }
}

function normalizeGeniusPayStatus(status?: string) {
  return status === 'completed' || status === 'success' || status === 'successful'
}

export async function createGeniusPayCheckout(input: CreateCheckoutInput) {
  const { apiKey, apiSecret } = getGeniusPayCredentials()

  const res = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: 'XOF',
      reference: input.reference,
      description: input.description,
      customer: input.customer,
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: input.metadata,
    }),
  })

  const payload = (await res.json().catch(() => null)) as GeniusPayCheckoutResponse | null

  if (!res.ok || !payload?.success) {
    const message = payload?.error?.message ?? `GeniusPay checkout failed with status ${res.status}`
    throw new GeniusPayApiError(message, { status: res.status, code: payload?.error?.code })
  }

  const checkoutUrl = payload.data?.checkout_url ?? payload.data?.payment_url
  if (!checkoutUrl) {
    throw new Error('GeniusPay did not return a checkout URL.')
  }

  return {
    checkoutUrl,
    reference: payload.data?.reference ?? input.reference,
    status: payload.data?.status,
  }
}

export async function getGeniusPayPayment(reference: string) {
  const { apiKey, apiSecret } = getGeniusPayCredentials()

  const res = await fetch(`${GENIUSPAY_BASE_URL}/payments/${encodeURIComponent(reference)}`, {
    headers: {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
    },
    cache: 'no-store',
  })

  const payload = (await res.json().catch(() => null)) as GeniusPayPaymentResponse | null
  if (!res.ok || !payload?.success || !payload.data) {
    const message = payload?.error?.message ?? `GeniusPay payment lookup failed with status ${res.status}`
    throw new GeniusPayApiError(message, { status: res.status, code: payload?.error?.code })
  }

  return {
    reference: payload.data.reference ?? reference,
    status: payload.data.status,
    paid: normalizeGeniusPayStatus(payload.data.status),
    metadata: payload.data.metadata ?? {},
  }
}
