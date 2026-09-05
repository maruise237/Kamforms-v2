import { describe, it, expect } from 'vitest'
import { parseResult, parseOps, resolveFieldId, applyOperations } from '@/lib/deepseek-parse'
import type { FormField, FormSchema } from '@/lib/form-schema'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeField = (overrides: Partial<FormField> = {}): FormField => ({
  id: 'field_1',
  type: 'text',
  label: 'Nom complet',
  required: true,
  ...overrides,
})

const makeSchema = (fields: FormField[] = [makeField()]): FormSchema => ({ fields })

const validAiResponse = JSON.stringify({
  fields: [
    { id: 'field_1', type: 'text',  label: 'Nom complet', required: true },
    { id: 'field_2', type: 'email', label: 'Email',        required: true },
  ],
})

// ─── parseResult ──────────────────────────────────────────────────────────────

describe('parseResult', () => {
  it('parse un JSON propre', () => {
    const result = parseResult(validAiResponse)
    expect(result.schema.fields).toHaveLength(2)
    expect(result.schema.fields[0].type).toBe('text')
  })

  it('retire les balises markdown ```json', () => {
    const wrapped = `\`\`\`json\n${validAiResponse}\n\`\`\``
    const result = parseResult(wrapped)
    expect(result.schema.fields).toHaveLength(2)
  })

  it('retire les balises markdown sans langage', () => {
    const wrapped = `\`\`\`\n${validAiResponse}\n\`\`\``
    expect(parseResult(wrapped).schema.fields).toHaveLength(2)
  })

  it('extrait la description du formulaire', () => {
    const raw = JSON.stringify({
      description: 'Formulaire de contact',
      fields: [makeField()],
    })
    expect(parseResult(raw).description).toBe('Formulaire de contact')
  })

  it('extrait le message de fin', () => {
    const raw = JSON.stringify({
      fields: [makeField()],
      ending: { message: 'Merci !', description: 'On vous rappelle.' },
    })
    const result = parseResult(raw)
    expect(result.ending?.message).toBe('Merci !')
    expect(result.ending?.description).toBe('On vous rappelle.')
  })

  it('filtre les champs avec type inconnu (fallback lénient)', () => {
    const raw = JSON.stringify({
      fields: [
        { id: 'field_1', type: 'text',   label: 'Nom',   required: true },
        { id: 'field_2', type: 'slider', label: 'Score', required: false },
      ],
    })
    const result = parseResult(raw)
    expect(result.schema.fields).toHaveLength(1)
    expect(result.schema.fields[0].type).toBe('text')
  })

  it('renuméroter les IDs après filtrage lénient', () => {
    const raw = JSON.stringify({
      fields: [
        { id: 'x', type: 'slider', label: 'A', required: false },
        { id: 'y', type: 'text',   label: 'B', required: false },
      ],
    })
    const result = parseResult(raw)
    expect(result.schema.fields[0].id).toBe('field_1')
  })

  it('lève une erreur sur du JSON invalide', () => {
    expect(() => parseResult('not json')).toThrow()
  })

  it('lève une erreur sur du JSON invalide (non parseable)', () => {
    expect(() => parseResult('{broken json')).toThrow()
  })
})

// ─── parseOps ─────────────────────────────────────────────────────────────────

describe('parseOps', () => {
  it('parse un tableau d\'opérations nu', () => {
    const raw = JSON.stringify([{ op: 'delete_field', id: 'field_1' }])
    expect(parseOps(raw)).toHaveLength(1)
  })

  it('parse le format { operations: [...] }', () => {
    const raw = JSON.stringify({ operations: [{ op: 'delete_field', id: 'field_1' }] })
    expect(parseOps(raw)).toHaveLength(1)
  })

  it('retourne un tableau vide si aucune opération', () => {
    expect(parseOps('[]')).toHaveLength(0)
    expect(parseOps('{"operations":[]}')).toHaveLength(0)
  })

  it('filtre les items sans propriété op', () => {
    const raw = JSON.stringify([{ op: 'delete_field', id: 'field_1' }, { notAnOp: true }])
    expect(parseOps(raw)).toHaveLength(1)
  })

  it('lève une erreur si tous les items sont invalides', () => {
    const raw = JSON.stringify([{ notAnOp: true }, { alsoNot: true }])
    expect(() => parseOps(raw)).toThrow()
  })

  it('lève une erreur sur format inattendu', () => {
    expect(() => parseOps('"string"')).toThrow()
    expect(() => parseOps('42')).toThrow()
  })
})

// ─── resolveFieldId ───────────────────────────────────────────────────────────

describe('resolveFieldId', () => {
  const fields: FormField[] = [
    makeField({ id: 'field_1', label: 'Nom complet' }),
    makeField({ id: 'field_2', label: 'Email', type: 'email' }),
    makeField({ id: 'field_3', label: 'Téléphone', type: 'phone' }),
  ]

  it('résout par ID exact', () => {
    expect(resolveFieldId(fields, 'field_2')).toBe('field_2')
  })

  it('résout par label exact (insensible à la casse)', () => {
    expect(resolveFieldId(fields, 'email')).toBe('field_2')
    expect(resolveFieldId(fields, 'EMAIL')).toBe('field_2')
  })

  it('résout par correspondance partielle (ref inclus dans label)', () => {
    expect(resolveFieldId(fields, 'Nom')).toBe('field_1')
  })

  it('résout par correspondance partielle (label inclus dans ref)', () => {
    expect(resolveFieldId(fields, 'Adresse Email principale')).toBe('field_2')
  })

  it('retourne undefined si aucune correspondance', () => {
    expect(resolveFieldId(fields, 'Budget')).toBeUndefined()
  })

  it('retourne undefined sur tableau vide', () => {
    expect(resolveFieldId([], 'field_1')).toBeUndefined()
  })
})

// ─── applyOperations ──────────────────────────────────────────────────────────

describe('applyOperations', () => {
  it('update_field : modifie un champ par ID', () => {
    const schema = makeSchema([makeField({ id: 'field_1', required: true })])
    const result = applyOperations(schema, [{ op: 'update_field', id: 'field_1', changes: { required: false } }])
    expect(result.schema.fields[0].required).toBe(false)
  })

  it('update_field : modifie un champ par label', () => {
    const schema = makeSchema([makeField({ label: 'Email', type: 'text' })])
    const result = applyOperations(schema, [{ op: 'update_field', id: 'Email', changes: { type: 'email' } }])
    expect(result.schema.fields[0].type).toBe('email')
  })

  it('update_field : préserve l\'ID lors de la modification', () => {
    const schema = makeSchema([makeField({ id: 'field_1' })])
    const result = applyOperations(schema, [{ op: 'update_field', id: 'field_1', changes: { id: 'hacked' } as any }])
    expect(result.schema.fields[0].id).toBe('field_1')
  })

  it('update_field : no-op si champ introuvable', () => {
    const schema = makeSchema()
    const result = applyOperations(schema, [{ op: 'update_field', id: 'inexistant', changes: { required: false } }])
    expect(result.schema.fields[0].required).toBe(true)
  })

  it('add_field : ajoute en fin de liste', () => {
    const schema = makeSchema()
    const newField = makeField({ id: 'field_2', label: 'Email', type: 'email' })
    const result = applyOperations(schema, [{ op: 'add_field', field: newField }])
    expect(result.schema.fields).toHaveLength(2)
    expect(result.schema.fields[1].id).toBe('field_2')
  })

  it('add_field : insère après un champ donné', () => {
    const schema = makeSchema([
      makeField({ id: 'field_1' }),
      makeField({ id: 'field_3', label: 'Message' }),
    ])
    const newField = makeField({ id: 'field_2', label: 'Email', type: 'email' })
    const result = applyOperations(schema, [{ op: 'add_field', field: newField, after_id: 'field_1' }])
    expect(result.schema.fields[1].id).toBe('field_2')
    expect(result.schema.fields[2].id).toBe('field_3')
  })

  it('delete_field : supprime par ID', () => {
    const schema = makeSchema([makeField({ id: 'field_1' }), makeField({ id: 'field_2', label: 'Email' })])
    const result = applyOperations(schema, [{ op: 'delete_field', id: 'field_1' }])
    expect(result.schema.fields).toHaveLength(1)
    expect(result.schema.fields[0].id).toBe('field_2')
  })

  it('delete_field : no-op si champ introuvable', () => {
    const schema = makeSchema()
    const result = applyOperations(schema, [{ op: 'delete_field', id: 'inexistant' }])
    expect(result.schema.fields).toHaveLength(1)
  })

  it('update_ending : crée ou modifie le message de fin', () => {
    const schema = makeSchema()
    const result = applyOperations(schema, [{ op: 'update_ending', changes: { message: 'Merci !' } }])
    expect(result.ending?.message).toBe('Merci !')
  })

  it('update_ending : fusionne avec l\'ending existant', () => {
    const schema = makeSchema()
    const result = applyOperations(
      schema,
      [{ op: 'update_ending', changes: { description: 'On vous rappelle.' } }],
      { message: 'Merci !' },
    )
    expect(result.ending?.message).toBe('Merci !')
    expect(result.ending?.description).toBe('On vous rappelle.')
  })

  it('update_step : modifie le titre d\'une étape', () => {
    const schema: FormSchema = {
      fields: [makeField()],
      steps: [{ title: 'Profil' }, { title: 'Projet' }],
    }
    const result = applyOperations(schema, [{ op: 'update_step', step: 1, changes: { title: 'Votre profil' } }])
    expect(result.schema.steps?.[0].title).toBe('Votre profil')
    expect(result.schema.steps?.[1].title).toBe('Projet')
  })
})
