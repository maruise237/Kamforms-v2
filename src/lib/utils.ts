import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSafeUrl(url: string): boolean {
  // Relative URLs to our own uploads are safe
  if (url.startsWith('/api/uploads/')) return true

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function trackEvent(name: string, data?: object) {
  if (typeof window !== 'undefined') {
    (window as unknown as { umami?: { track: (n: string, d?: object) => void } }).umami?.track(name, data)
  }
}
