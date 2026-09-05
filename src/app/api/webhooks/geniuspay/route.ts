import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { getBillingPlan } from '@/lib/billing-plans'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type GeniusPayWebhookPayload = {
  event?: string
  timestamp?: number
  data?: {
    reference?: string
    status?: string
    metadata?: {
      user_id?: string
      plan_id?: string
      [key: string]: unknown
    }
  }
}

const WEBHOOK_TOLERANCE_SECONDS = 300

function getHeader(req: Request, ...names: string[]) {
  for (const name of names) {
    const value = req.headers.get(name)
    if (value) return value
  }
  return null
}

function signaturesMatch(signature: string, expectedHex: string) {
  const normalizedSignature = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature

  if (!/^[a-f0-9]+$/i.test(normalizedSignature)) return false

  const signatureBuffer = Buffer.from(normalizedSignature, 'hex')
  const expectedBuffer = Buffer.from(expectedHex, 'hex')

  return (
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  )
}

function verifyGeniusPaySignature(req: Request, rawBody: string) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('GENIUSPAY_WEBHOOK_SECRET is not configured.')
  }

  const signature = getHeader(req, 'x-webhook-signature', 'x-geniuspay-signature')
  const timestamp = getHeader(req, 'x-webhook-timestamp', 'x-geniuspay-timestamp')
  if (!signature || !timestamp) return false

  const timestampNumber = Number(timestamp)
  if (!Number.isFinite(timestampNumber)) return false

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSeconds - timestampNumber) > WEBHOOK_TOLERANCE_SECONDS) {
    return false
  }

  try {
    const rawExpectedHex = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex')
    if (signaturesMatch(signature, rawExpectedHex)) return true

    const compactBody = JSON.stringify(JSON.parse(rawBody))
    const compactExpectedHex = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${compactBody}`)
      .digest('hex')
    return signaturesMatch(signature, compactExpectedHex)
  } catch {
    return false
  }
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  try {
    if (!verifyGeniusPaySignature(req, rawBody)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }
  } catch (error) {
    console.error('GeniusPay webhook configuration error:', error)
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let payload: GeniusPayWebhookPayload
  try {
    payload = JSON.parse(rawBody) as GeniusPayWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const event = payload.event ?? getHeader(req, 'x-webhook-event', 'x-geniuspay-event')
  const reference = payload.data?.reference ?? null
  const metadata = payload.data?.metadata
  const userId = typeof metadata?.user_id === 'string' ? metadata.user_id : null
  const planId = typeof metadata?.plan_id === 'string' ? metadata.plan_id : null

  if (!event || !userId) {
    console.warn('GeniusPay webhook ignored: missing event or user_id metadata', {
      event,
      reference,
      hasMetadata: Boolean(metadata),
    })
    return NextResponse.json({ received: true })
  }

  if (event === 'payment.success' && planId) {
    const plan = getBillingPlan(planId)
    if (!plan) {
      console.warn('GeniusPay webhook ignored: unknown plan_id', { planId, reference, userId })
      return NextResponse.json({ received: true })
    }

    const activatedAt = new Date()
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan.plan,
        billingStatus: 'active',
        billingPeriod: plan.billing,
        billingPlanId: plan.id,
        billingReference: reference,
        planActivatedAt: activatedAt,
        planExpiresAt: addMonths(activatedAt, plan.billing === 'annual' ? 12 : 1),
      },
    })

    return NextResponse.json({ received: true })
  }

  const statusByEvent: Record<string, string> = {
    'payment.failed': 'failed',
    'payment.cancelled': 'cancelled',
    'payment.expired': 'expired',
  }

  const billingStatus = statusByEvent[event]
  if (billingStatus) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        billingStatus,
        billingReference: reference,
      },
    })
  }

  return NextResponse.json({ received: true })
}
