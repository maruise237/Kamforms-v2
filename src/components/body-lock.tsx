'use client'
import { useEffect } from 'react'

export function BodyLock() {
  useEffect(() => {
    const apply = () => {
      document.body.style.overflow = window.innerWidth >= 768 ? 'hidden' : ''
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', apply)
    }
  }, [])
  return null
}
