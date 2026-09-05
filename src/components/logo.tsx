interface LogoProps {
  size?: number
  className?: string
  wordmark?: boolean
}

export function Logo({ size = 24, className = '', wordmark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 510 510" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="currentColor">
          <rect x="28" y="33" width="130" height="447" rx="22"/>
          <path d="M 240,48 L 390,48 Q 415,48 411,73 L 395,160 Q 390,185 365,185 L 215,185 Q 190,185 195,160 L 211,73 Q 215,48 240,48 Z"/>
          <g transform="translate(302, 342) rotate(28)">
            <rect x="-140" y="-82" width="280" height="164" rx="80"/>
          </g>
        </g>
      </svg>
      {wordmark && (
        <span className="font-semibold text-foreground tracking-tight">Kamforms</span>
      )}
    </span>
  )
}
