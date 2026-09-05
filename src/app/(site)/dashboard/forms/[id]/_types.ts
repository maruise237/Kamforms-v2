import type { FormSchema } from '@/lib/form-schema'
import type { FormTheme } from '@/lib/form-theme'
import type { FormEnding } from '@/lib/form-ending'

export interface Form {
  id: string
  title: string
  description: string | null
  slug: string
  active: boolean
  notificationsEnabled: boolean
  notificationMode: 'every' | 'milestones' | 'first_only' | 'daily_digest' | 'off'
  assignedWhatsapp: string | null
  assignedEmail: string | null
  maxSubmissions: number | null
  expiresAt: string | null
  schema: FormSchema
  theme: FormTheme | null
  ending: FormEnding | null
  createdAt: string
  submissionCount?: number
}
