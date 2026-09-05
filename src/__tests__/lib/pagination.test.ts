import { describe, expect, it } from 'vitest'
import { parsePositiveIntParam } from '@/lib/pagination'

describe('parsePositiveIntParam', () => {
  it('retourne le fallback si la valeur est absente ou invalide', () => {
    expect(parsePositiveIntParam(null, 25)).toBe(25)
    expect(parsePositiveIntParam('abc', 25)).toBe(25)
    expect(parsePositiveIntParam('NaN', 25)).toBe(25)
    expect(parsePositiveIntParam('0', 25)).toBe(25)
    expect(parsePositiveIntParam('-1', 25)).toBe(25)
    expect(parsePositiveIntParam('1.5', 25)).toBe(25)
  })

  it('accepte les entiers positifs', () => {
    expect(parsePositiveIntParam('1', 25)).toBe(1)
    expect(parsePositiveIntParam('42', 25)).toBe(42)
  })

  it('plafonne la valeur quand un maximum est fourni', () => {
    expect(parsePositiveIntParam('101', 25, 100)).toBe(100)
    expect(parsePositiveIntParam('100', 25, 100)).toBe(100)
  })
})
