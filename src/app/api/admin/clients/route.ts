import { NextRequest, NextResponse } from 'next/server'
import { getAdminClients } from '@/lib/admin-dashboard'
import { getAdminSecretPath } from '@/lib/admin-access'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('adminSecret')
  const validSecret = getAdminSecretPath()

  if (!secret || !validSecret || secret !== validSecret) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 401 })
  }

  const clients = await getAdminClients()
  return NextResponse.json(clients)
}
