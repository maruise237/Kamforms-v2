import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {process.env.NEXT_PUBLIC_ANALYTICS_RECORDER_URL && (
        <script
          defer
          src={process.env.NEXT_PUBLIC_ANALYTICS_RECORDER_URL}
          data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID}
        />
      )}
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  )
}
