import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  const checks = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: [] as { name: string; ok: boolean; ms?: number }[],
  }

  try {
    const dbStart = Date.now()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    checks.checks.push({ name: 'database', ok: true, ms: Date.now() - dbStart })
  } catch {
    checks.checks.push({ name: 'database', ok: false })
    checks.ok = false
  }

  checks.checks.push({ name: 'total', ok: true, ms: Date.now() - start })

  return NextResponse.json(checks, {
    status: checks.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
