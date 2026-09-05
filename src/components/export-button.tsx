'use client'

import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface ExportButtonProps {
  formId:     string
  totalCount: number
}

export function ExportButton({ formId, totalCount }: ExportButtonProps) {
  if (totalCount === 0) return null

  return (
    <a
      href={`/api/forms/${formId}/submissions/export`}
      download
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
    >
      <Download size={14} />
      Exporter CSV
    </a>
  )
}
