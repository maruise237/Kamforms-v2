export function parsePositiveIntParam(
  value: string | null,
  fallback: number,
  max?: number,
): number {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return max === undefined ? parsed : Math.min(parsed, max)
}
