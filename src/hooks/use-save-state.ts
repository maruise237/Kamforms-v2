import { useState } from 'react'

export function useSaveState(delayMs = 2000) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function wrap(fn: () => Promise<void>) {
    setSaving(true)
    try {
      await fn()
      setSaved(true)
      setTimeout(() => setSaved(false), delayMs)
    } finally {
      setSaving(false)
    }
  }

  return { saving, saved, wrap }
}
