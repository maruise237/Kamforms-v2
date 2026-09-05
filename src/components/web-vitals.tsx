'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals(metric => {
    const umami = (window as unknown as { umami?: { track: (n: string, d?: object) => void } }).umami
    if (!umami) return
    umami.track('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    })
  })
  return null
}
