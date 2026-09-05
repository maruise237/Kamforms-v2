import { formSchemaSchema, fieldTypeSchema, type FormSchema, type FormField } from './form-schema'
import type { FormEnding } from './form-ending'

export type GenerateResult = {
  schema: FormSchema
  ending?: FormEnding
  description?: string
}

export type Op =
  | { op: 'update_field'; id: string; changes: Partial<FormField> }
  | { op: 'add_field'; field: FormField; after_id?: string; step?: number }
  | { op: 'delete_field'; id: string }
  | { op: 'update_ending'; changes: Partial<FormEnding> }
  | { op: 'update_step'; step: number; changes: { title?: string } }

function parseEnding(raw: unknown): FormEnding | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const e = raw as Record<string, unknown>
  const ending: FormEnding = {}
  if (typeof e.message === 'string' && e.message)         ending.message = e.message
  if (typeof e.description === 'string' && e.description) ending.description = e.description
  if (typeof e.buttonLabel === 'string' && e.buttonLabel) ending.buttonLabel = e.buttonLabel
  if (typeof e.buttonUrl === 'string' && e.buttonUrl)     ending.buttonUrl = e.buttonUrl
  return Object.keys(ending).length > 0 ? ending : undefined
}

export function parseResult(raw: string): GenerateResult {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  const ending = parseEnding(parsed.ending)
  const formDescription: string | undefined =
    typeof parsed.description === 'string' && parsed.description.trim()
      ? parsed.description.trim()
      : undefined
  const { ending: _e, description: _d, ...schemaOnly } = parsed

  const strict = formSchemaSchema.safeParse(schemaOnly)
  if (strict.success) return { schema: strict.data, ending, description: formDescription }

  const VALID_TYPES = new Set<string>(fieldTypeSchema.options)
  const rawFields = Array.isArray(parsed.fields) ? parsed.fields : []
  const cleanedFields = rawFields
    .filter((f: Record<string, unknown>) => f && typeof f.id === 'string' && VALID_TYPES.has(String(f.type)))
    .map((f: Record<string, unknown>, i: number) => ({
      id: `field_${i + 1}`,
      type: f.type,
      label: String(f.label ?? ''),
      description: typeof f.description === 'string' && f.description ? f.description : undefined,
      placeholder: typeof f.placeholder === 'string' ? f.placeholder : undefined,
      required: f.required === true,
      options: Array.isArray(f.options) ? f.options.map(String) : undefined,
      step: typeof f.step === 'number' ? f.step : undefined,
    }))

  const lenient = formSchemaSchema.safeParse({ ...schemaOnly, fields: cleanedFields })
  if (lenient.success) return { schema: lenient.data, ending, description: formDescription }

  throw new Error(`Réponse IA invalide : ${strict.error.issues[0]?.message ?? 'format inattendu'}`)
}

export function parseOps(raw: string): Op[] {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  let arr: unknown
  if (Array.isArray(parsed)) {
    arr = parsed
  } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).operations)) {
    arr = (parsed as Record<string, unknown>).operations
  } else {
    throw new Error("L'IA n'a pas retourné d'opérations (format inattendu)")
  }

  const ops = (arr as unknown[]).filter(
    (item): item is Op => typeof item === 'object' && item !== null && 'op' in item
  )

  if ((arr as unknown[]).length > 0 && ops.length === 0) {
    throw new Error("L'IA a retourné un format non reconnu. Réessayez avec une instruction plus précise.")
  }

  return ops
}

export function resolveFieldId(fields: FormField[], ref: string): string | undefined {
  if (fields.some(f => f.id === ref)) return ref
  const lower = ref.toLowerCase().trim()
  const exact = fields.find(f => f.label.toLowerCase().trim() === lower)
  if (exact) return exact.id
  const partial = fields.find(
    f => f.label.toLowerCase().includes(lower) || lower.includes(f.label.toLowerCase().trim())
  )
  return partial?.id
}

export function applyOperations(
  schema: FormSchema,
  ops: Op[],
  currentEnding?: FormEnding,
): { schema: FormSchema; ending?: FormEnding } {
  let fields = [...schema.fields]
  let ending: FormEnding | undefined = currentEnding

  for (const op of ops) {
    if (op.op === 'update_field') {
      const targetId = resolveFieldId(fields, op.id)
      if (targetId) {
        fields = fields.map(f => f.id === targetId ? { ...f, ...op.changes, id: f.id } : f)
      }

    } else if (op.op === 'add_field') {
      const newField: FormField = { ...op.field }
      if (op.step !== undefined) newField.step = op.step
      if (op.after_id) {
        const afterId = resolveFieldId(fields, op.after_id) ?? op.after_id
        const idx = fields.findIndex(f => f.id === afterId)
        if (idx >= 0) {
          fields = [...fields.slice(0, idx + 1), newField, ...fields.slice(idx + 1)]
        } else {
          fields = [...fields, newField]
        }
      } else {
        fields = [...fields, newField]
      }

    } else if (op.op === 'delete_field') {
      const targetId = resolveFieldId(fields, op.id)
      if (targetId) fields = fields.filter(f => f.id !== targetId)

    } else if (op.op === 'update_ending') {
      ending = { ...ending, ...op.changes }

    } else if (op.op === 'update_step' && schema.steps) {
      const steps = schema.steps.map((s, i) =>
        i + 1 === op.step ? { ...s, ...op.changes } : s
      )
      schema = { ...schema, steps }
    }
  }

  return { schema: { ...schema, fields }, ending }
}
