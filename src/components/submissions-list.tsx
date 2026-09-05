'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Field { id: string; label: string }
interface Submission { id: string; createdAt: string; data: Record<string, unknown>; formId?: string }

interface Props {
  submissions: Submission[]
  fields: Field[]
  formId: string
  page: number
  totalPages: number
  totalCount: number
}

export function SubmissionsList({ submissions, fields, formId, page, totalPages, totalCount }: Props) {
  const router = useRouter()
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function goToPage(p: number) {
    const url = new URL(window.location.href)
    url.searchParams.set('page', String(p))
    router.push(url.pathname + url.search)
  }

  const visibleCols = fields.slice(0, 4)
  const hasMore     = fields.length > 4

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev =>
      prev.size === submissions.length
        ? new Set()
        : new Set(submissions.map(s => s.id))
    )
  }

  async function deleteSelected() {
    const ids = [...selected]
    await Promise.all(
      ids.map(subId => {
        const sub = submissions.find(s => s.id === subId)
        // ponytail: use per-submission formId when available (multi-form view), fall back to prop
        const fid = sub?.formId ?? formId
        return fetch(`/api/forms/${fid}/submissions/${subId}`, { method: 'DELETE' })
      })
    )
    toast.success(`${ids.length} réponse${ids.length > 1 ? 's' : ''} supprimée${ids.length > 1 ? 's' : ''}.`)
    setSelected(new Set())
    startTransition(() => router.refresh())
  }

  if (submissions.length === 0) return null

  const allChecked = selected.size === submissions.length
  const someChecked = selected.size > 0

  return (
    <div className="relative">

      {/* ── Floating action bar ───────────────────────── */}
      {someChecked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background rounded-full px-4 py-2.5 shadow-lg text-sm font-medium">
          <span>{selected.size} sélectionnée{selected.size > 1 ? 's' : ''}</span>
          <div className="w-px h-4 bg-background/30" />
          <button
            onClick={deleteSelected}
            disabled={isPending}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
            Supprimer
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-background/50 hover:text-background/80 transition-colors ml-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Desktop table ─────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="accent-foreground cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap w-32">
                Date
              </th>
              {visibleCols.map(f => (
                <th key={f.id} className="text-left px-3 py-2.5 font-medium text-muted-foreground whitespace-nowrap max-w-[180px]">
                  <span className="truncate block">{f.label}</span>
                </th>
              ))}
              {hasMore && (
                <th className="px-3 py-2.5 text-muted-foreground text-right whitespace-nowrap">
                  +{fields.length - 4} champs
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, i) => {
              const isExpanded = expanded === sub.id
              const isSelected = selected.has(sub.id)
              return (
                <>
                  <tr
                    key={sub.id}
                    className={`border-b border-border last:border-0 transition-colors ${
                      isSelected ? 'bg-muted/30' : isExpanded ? 'bg-muted/20' : i % 2 === 0 ? 'hover:bg-muted/10' : 'bg-muted/5 hover:bg-muted/15'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(sub.id)}
                        className="accent-foreground cursor-pointer"
                      />
                    </td>
                    <td
                      className="px-3 py-3 text-muted-foreground whitespace-nowrap cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : sub.id)}
                    >
                      {format(new Date(sub.createdAt), 'dd/MM/yy HH:mm')}
                    </td>
                    {visibleCols.map(f => (
                      <td
                        key={f.id}
                        className="px-3 py-3 text-foreground max-w-[180px] cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                      >
                        <span className="truncate block">{String(sub.data[f.id] ?? '—')}</span>
                      </td>
                    ))}
                    {hasMore && (
                      <td
                        className="px-3 py-3 text-right text-muted-foreground cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                      >
                        {isExpanded
                          ? <ChevronUp size={14} className="ml-auto" />
                          : <ChevronDown size={14} className="ml-auto" />}
                      </td>
                    )}
                  </tr>
                  {isExpanded && (
                    <tr key={`${sub.id}-detail`} className="bg-muted/10">
                      <td />
                      <td colSpan={visibleCols.length + (hasMore ? 2 : 1)} className="px-3 py-3">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                          {fields.map(f => (
                            <div key={f.id} className="flex gap-2 text-[12.5px]">
                              <span className="text-muted-foreground shrink-0 w-28 truncate">{f.label}</span>
                              <span className="text-foreground break-words">{String(sub.data[f.id] ?? '—')}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────── */}
      {totalPages > 1 && (
        <div className="hidden md:flex items-center justify-between px-1 pt-3">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages} · {totalCount} réponses
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile cards ──────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {submissions.map(sub => {
          const isExpanded = expanded === sub.id
          const isSelected = selected.has(sub.id)
          const firstField = fields[0]
          const preview = firstField ? String(sub.data[firstField.id] ?? '') : ''
          return (
            <div
              key={sub.id}
              className={`border rounded-lg bg-card overflow-hidden transition-colors ${
                isSelected ? 'border-foreground/40' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(sub.id)}
                  className="accent-foreground cursor-pointer shrink-0"
                />
                <button
                  onClick={() => setExpanded(isExpanded ? null : sub.id)}
                  className="flex-1 flex items-center justify-between gap-3 text-left bg-transparent border-0 cursor-pointer min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-muted-foreground mb-0.5">
                      {format(new Date(sub.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {preview && (
                      <p className="text-[13.5px] text-foreground truncate">{preview}</p>
                    )}
                  </div>
                  {isExpanded
                    ? <ChevronUp size={14} className="text-muted-foreground shrink-0" />
                    : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
                </button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 border-t border-border space-y-2 pt-2">
                  {fields.map(f => (
                    <div key={f.id} className="flex flex-col gap-0.5 text-[13px]">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{f.label}</span>
                      <span className="text-foreground break-words">{String(sub.data[f.id] ?? '—')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="md:hidden flex items-center justify-between pt-4">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Précédent
          </button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
