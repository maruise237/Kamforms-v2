import { describe, it, expect } from 'vitest'
import { validateSubmission, stripUnknownFields } from '@/lib/submit-validation'
import type { FormSchema } from '@/lib/form-schema'

const schema: FormSchema = {
  fields: [
    { id: 'field_1', type: 'text',   label: 'Nom complet', required: true },
    { id: 'field_2', type: 'email',  label: 'Email',        required: true },
    { id: 'field_3', type: 'number', label: 'Âge',          required: false },
    { id: 'field_4', type: 'text',   label: 'Message',      required: false },
  ],
}

// ─── validateSubmission ───────────────────────────────────────────────────────

describe('validateSubmission', () => {
  it('retourne [] si tous les champs requis sont remplis', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean Dupont',
      field_2: 'jean@example.com',
    })
    expect(errors).toHaveLength(0)
  })

  it('erreur si un champ requis est vide', () => {
    const errors = validateSubmission(schema, { field_2: 'jean@example.com' })
    expect(errors[0]).toContain('Nom complet')
  })

  it('erreur si un champ requis est une chaîne vide', () => {
    const errors = validateSubmission(schema, { field_1: '', field_2: 'jean@example.com' })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Nom complet')
  })

  it('traite les espaces seuls comme vide', () => {
    const errors = validateSubmission(schema, { field_1: '   ', field_2: 'jean@example.com' })
    expect(errors[0]).toContain('Nom complet')
  })

  it('pas d\'erreur si un champ optionnel est absent', () => {
    const errors = validateSubmission(schema, { field_1: 'Jean', field_2: 'jean@example.com' })
    expect(errors).toHaveLength(0)
  })

  it('erreur si email invalide', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'pas-un-email',
    })
    expect(errors[0]).toContain('Email')
  })

  it('pas d\'erreur avec un email valide', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
    })
    expect(errors).toHaveLength(0)
  })

  it('erreur si champ number reçoit du texte', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      field_3: 'abc',
    })
    expect(errors[0]).toContain('Âge')
  })

  it('pas d\'erreur avec un nombre valide', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      field_3: '25',
    })
    expect(errors).toHaveLength(0)
  })

  it('accepte 0 comme valeur de nombre', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      field_3: '0',
    })
    expect(errors).toHaveLength(0)
  })

  it('erreur si valeur dépasse 10 000 caractères', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      field_4: 'x'.repeat(10_001),
    })
    expect(errors[0]).toContain('Message')
  })

  it('accepte exactement 10 000 caractères', () => {
    const errors = validateSubmission(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      field_4: 'x'.repeat(10_000),
    })
    expect(errors).toHaveLength(0)
  })

  it('collecte plusieurs erreurs à la fois', () => {
    const errors = validateSubmission(schema, {})
    expect(errors.length).toBeGreaterThanOrEqual(2)
  })

  it('ignore un champ conditionnel requis si sa condition n\'est pas remplie', () => {
    const schemaWithCondition: FormSchema = {
      fields: [
        { id: 'field_1', type: 'radio', label: 'Avez-vous un compte ?', required: true, options: ['Oui', 'Non'] },
        { id: 'field_2', type: 'text',  label: 'Numéro de compte', required: true, condition: { fieldId: 'field_1', value: 'Oui' } },
      ],
    }
    // User selected "Non" — field_2 was never shown
    const errors = validateSubmission(schemaWithCondition, { field_1: 'Non' })
    expect(errors).toHaveLength(0)
  })

  it('valide un champ conditionnel requis si sa condition est remplie', () => {
    const schemaWithCondition: FormSchema = {
      fields: [
        { id: 'field_1', type: 'radio', label: 'Avez-vous un compte ?', required: true, options: ['Oui', 'Non'] },
        { id: 'field_2', type: 'text',  label: 'Numéro de compte', required: true, condition: { fieldId: 'field_1', value: 'Oui' } },
      ],
    }
    // User selected "Oui" — field_2 should be present
    const errors = validateSubmission(schemaWithCondition, { field_1: 'Oui' })
    expect(errors[0]).toContain('Numéro de compte')
  })
})

// ─── stripUnknownFields ───────────────────────────────────────────────────────

describe('stripUnknownFields', () => {
  it('conserve les champs connus', () => {
    const result = stripUnknownFields(schema, { field_1: 'Jean', field_2: 'jean@example.com' })
    expect(result).toEqual({ field_1: 'Jean', field_2: 'jean@example.com' })
  })

  it('retire les champs inconnus', () => {
    const result = stripUnknownFields(schema, {
      field_1: 'Jean',
      field_2: 'jean@example.com',
      injected: 'malicious',
      _extra: 'data',
    })
    expect(result).not.toHaveProperty('injected')
    expect(result).not.toHaveProperty('_extra')
  })

  it('retourne un objet vide si aucun champ connu', () => {
    const result = stripUnknownFields(schema, { unknown1: 'a', unknown2: 'b' })
    expect(result).toEqual({})
  })
})
