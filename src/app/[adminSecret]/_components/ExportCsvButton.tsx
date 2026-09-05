'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function ExportCsvButton({
  data,
  filename = 'export.csv',
  headers,
}: {
  data: Record<string, string | number | null | undefined>[]
  filename?: string
  headers: string[]
}) {
  function handleExport() {
    try {
      const headerRow = headers.join(',')
      const bodyRows = data.map(row =>
        headers
          .map(h => {
            const val = row[h]
            if (val === null || val === undefined) return ''
            const str = String(val)
            // Échapper les virgules et guillemets
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          })
          .join(','),
      )
      const csv = [headerRow, ...bodyRows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export CSV téléchargé')
    } catch {
      toast.error("Erreur lors de l'export")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-3.5" />
      Export CSV
    </Button>
  )
}
