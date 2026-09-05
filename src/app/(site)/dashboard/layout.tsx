import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { DashboardNav } from '@/components/dashboard-nav'
import { BodyLock } from '@/components/body-lock'
import { PushNotificationToggle } from '@/components/push-notifications'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BodyLock />
      <div className="bg-background">

      {/* ── Mobile top bar (fixed) ─────────────────────── */}
      <header className="md:hidden fixed inset-x-0 top-0 z-30 h-14 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-4">
        <Logo size={20} wordmark />
        <div className="flex items-center gap-1">
          <PushNotificationToggle compact />
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      {/* ── Sidebar + main : hauteur viewport, scroll interne uniquement ── */}
      <div className="md:flex md:h-screen">

        {/* Desktop sidebar — own scroll, never stretches with page content */}
        <aside className="hidden md:flex w-56 h-full overflow-y-auto border-r border-border bg-card flex-col px-4 py-6 gap-1 shrink-0">
          <div className="px-2 mb-6">
            <Logo size={22} wordmark />
          </div>
          <DashboardNav mode="sidebar" />
          <div className="mt-auto space-y-2 px-2 pt-4 border-t border-border">
            <PushNotificationToggle />
            <div className="flex items-center justify-between">
              <UserButton />
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main — scrolls independently on desktop, normal flow on mobile */}
        <main className="flex-1 overflow-y-auto px-4 pt-[4.5rem] pb-24 md:px-8 md:pt-8 md:pb-8">
          {children}
        </main>
      </div>

	      {/* ── Mobile bottom nav (fixed) ──────────────────── */}
	      <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border bg-card/95 backdrop-blur-sm flex items-center justify-around">
	        <DashboardNav mode="bottom" />
	      </nav>

	      </div>
    </>
  )
}
