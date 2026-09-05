import { describe, it, expect } from 'vitest'
import { formSchemaSchema, fieldTypeSchema } from '@/lib/form-schema'

const validField = {
  id: 'field_1',
  type: 'text',
  label: 'Nom complet',
  required: true,
}

describe('fieldTypeSchema', () => {
  it('accepte tous les types valides', () => {
    const types = ['text', 'email', 'phone', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'rating']
    for (const t of types) {
      expect(fieldTypeSchema.safeParse(t).success).toBe(true)
    }
  })

  it('rejette un type inconnu', () => {
    expect(fieldTypeSchema.safeParse('unknown').success).toBe(false)
    expect(fieldTypeSchema.safeParse('').success).toBe(false)
  })
})

describe('formSchemaSchema', () => {
  it('accepte un schéma valide minimal', () => {
    const result = formSchemaSchema.safeParse({ fields: [validField] })
    expect(result.success).toBe(true)
  })

  it('accepte un champ avec tous les champs optionnels', () => {
    const result = formSchemaSchema.safeParse({
      fields: [{
        ...validField,
        description: 'Votre nom complet',
        placeholder: 'ex : Jean Dupont',
        options: ['A', 'B'],
        condition: { fieldId: 'field_2', value: 'oui' },
        step: 1,
      }],
      steps: [{ title: 'Étape 1' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejette un schéma sans champs', () => {
    expect(formSchemaSchema.safeParse({}).success).toBe(false)
  })

  it('rejette un champ avec un type invalide', () => {
    const result = formSchemaSchema.safeParse({
      fields: [{ ...validField, type: 'slider' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejette un champ sans id', () => {
    const { id: _id, ...noId } = validField
    expect(formSchemaSchema.safeParse({ fields: [noId] }).success).toBe(false)
  })

  it('rejette un champ sans label', () => {
    const { label: _label, ...noLabel } = validField
    expect(formSchemaSchema.safeParse({ fields: [noLabel] }).success).toBe(false)
  })

  it('accepte un tableau de champs vide', () => {
    expect(formSchemaSchema.safeParse({ fields: [] }).success).toBe(true)
  })

  it('accepte un schéma multi-étapes', () => {
    const result = formSchemaSchema.safeParse({
      steps: [{ title: 'Profil' }, { title: 'Projet' }],
      fields: [
        { ...validField, step: 1 },
        { id: 'field_2', type: 'email', label: 'Email', required: true, step: 2 },
      ],
    })
    expect(result.success).toBe(true)
  })
})
