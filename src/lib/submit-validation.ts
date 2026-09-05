import type { FormSchema } from './form-schema'

export function validateSubmission(
  schema: FormSchema,
  data: Record<string, unknown>,
): string[] {
  const errors: string[] = []
  for (const field of schema.fields) {
    // Skip fields whose condition is not satisfied — they were never shown to the user
    if (field.condition) {
      const conditionMet = String(data[field.condition.fieldId] ?? '') === field.condition.value
      if (!conditionMet) continue
    }
    const val = data[field.id]
    const empty = val === undefined || val === null || String(val).trim() === ''
    if (field.required && empty) {
      errors.push(`Le champ "${field.label}" est obligatoire.`)
      continue
    }
    if (!empty) {
      if (String(val).length > 10_000) {
        errors.push(`Le champ "${field.label}" dépasse la longueur maximale autorisée.`)
      }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
        errors.push(`"${field.label}" n'est pas une adresse email valide.`)
      }
      if (field.type === 'number' && isNaN(Number(val))) {
        errors.push(`"${field.label}" doit être un nombre.`)
      }
    }
  }
  return errors
}

export function stripUnknownFields(
  schema: FormSchema,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const knownIds = new Set(schema.fields.map(f => f.id))
  return Object.fromEntries(Object.entries(data).filter(([k]) => knownIds.has(k)))
}
