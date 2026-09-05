import { NextRequest, NextResponse } from 'next/server'
import { assignSubscription, suspendUser, extendSubscription } from '@/lib/admin-actions'
import { requireHiddenAdminAccess } from '@/lib/admin-access'

export async function POST(req: NextRequest) {
  // Vérifier que l'appelant est bien un admin
  const adminSecret = req.nextUrl.searchParams.get('adminSecret')
  if (!adminSecret) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 })
  }

  try {
    await requireHiddenAdminAccess({ adminSecret: adminSecret as any })
  } catch {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 })
  }

  const body = await req.json()
  const { action, userId, plan, days, extraDays } = body

  if (!action || !userId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  switch (action) {
    case 'assign': {
      if (!plan || !days) {
        return NextResponse.json({ error: 'Plan et durée requis' }, { status: 400 })
      }
      const result = await assignSubscription({ userId, plan, days, message: body.message })
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json(result)
    }

    case 'suspend': {
      const result = await suspendUser(userId)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json(result)
    }

    case 'extend': {
      if (!extraDays || extraDays < 1) {
        return NextResponse.json({ error: 'Nombre de jours requis' }, { status: 400 })
      }
      const result = await extendSubscription(userId, extraDays)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json(result)
    }

    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }
}
