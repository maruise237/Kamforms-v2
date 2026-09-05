import type { Metadata } from 'next'
import { requireHiddenAdminAccess } from '@/lib/admin-access'
import { AdminShell } from './_components/AdminShell'

export const metadata: Metadata = {
  title: 'Dashboard admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function HiddenAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ adminSecret: string }>
}) {
  const { adminSecret } = await params
  const access = await requireHiddenAdminAccess({ adminSecret })

  return (
    <AdminShell basePath={access.basePath} adminEmail={access.email}>
      {children}
    </AdminShell>
  )
}
