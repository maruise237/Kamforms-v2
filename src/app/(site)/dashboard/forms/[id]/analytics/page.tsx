'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FormAnalytics } from '@/components/form-analytics'

export default function FormAnalyticsPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/forms/${id}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Statistiques</h1>
      </div>

      <FormAnalytics formId={id} />
    </div>
  )
}
