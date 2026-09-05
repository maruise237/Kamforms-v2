import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExportButton } from '@/components/export-button'
import { ClearSubmissionsButton } from '@/components/clear-submissions-button'
import { SubmissionsList } from '@/components/submissions-list'
import type { FormSchema } from '@/lib/form-schema'

const PAGE_SIZE = 25

export default async function SubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; from?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const { page: pageParam, from } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const skip = (page - 1) * PAGE_SIZE

  const form = await prisma.form.findFirst({ where: { id, userId } })
  if (!form) redirect('/dashboard')

  const [submissions, totalCount] = await Promise.all([
    prisma.submission.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.submission.count({ where: { formId: id } }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const schema = form.schema as unknown as FormSchema
  const fields = schema.fields.map(f => ({ id: f.id, label: f.label }))
  const fieldLabels = Object.fromEntries(fields.map(f => [f.id, f.label]))

  const submissionsForList = submissions.map((s: { id: string; createdAt: Date; data: unknown }) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    data: s.data as Record<string, unknown>,
  }))

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={from === 'reponses' ? '/dashboard/reponses' : `/dashboard/forms/${id}`} className="text-muted-foreground hover:text-foreground shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground leading-tight">Réponses</h1>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{form.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {totalCount} réponse{totalCount !== 1 ? 's' : ''}
          </span>
          <ClearSubmissionsButton formId={id} count={totalCount} />
          <ExportButton formId={id} totalCount={totalCount} />
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm font-medium text-foreground mb-1">Aucune réponse</p>
          <p className="text-xs text-muted-foreground">Les réponses apparaîtront ici dès qu&apos;un utilisateur soumettra le formulaire.</p>
        </div>
      ) : (
        <SubmissionsList
          submissions={submissionsForList}
          fields={fields}
          formId={id}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      )}
    </div>
  )
}
