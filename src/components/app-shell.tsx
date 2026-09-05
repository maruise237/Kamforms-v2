'use client'
import { PwaInstallBanner } from '@/components/pwa-install'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaInstallBanner />
    </>
  )
}
