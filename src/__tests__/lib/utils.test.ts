import { describe, it, expect } from 'vitest'
import { isSafeUrl, cn } from '@/lib/utils'

describe('isSafeUrl', () => {
  it('accepte une URL HTTPS valide', () => {
    expect(isSafeUrl('https://example.com')).toBe(true)
    expect(isSafeUrl('https://sub.domain.co/path?q=1')).toBe(true)
  })

  it('rejette HTTP', () => {
    expect(isSafeUrl('http://example.com')).toBe(false)
  })

  it('rejette javascript:', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejette une URL relative', () => {
    expect(isSafeUrl('/path/to/page')).toBe(false)
  })

  it('rejette une chaîne vide', () => {
    expect(isSafeUrl('')).toBe(false)
  })

  it('rejette du texte quelconque', () => {
    expect(isSafeUrl('not a url')).toBe(false)
  })

  it('rejette ftp:', () => {
    expect(isSafeUrl('ftp://files.example.com')).toBe(false)
  })
})

describe('cn', () => {
  it('fusionne des classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('déduplique les classes Tailwind en conflit', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignore les valeurs falsy', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('gère les objets conditionnels', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})
