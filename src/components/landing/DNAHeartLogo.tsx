interface DNAHeartLogoProps {
  className?: string
  size?: number
}

/**
 * SVG logo of a double heart - two intertwining heart strands
 * Matches the 3D hero visualization style
 */
function DNAHeartLogo({ className, size = 32 }: DNAHeartLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Strand 1 - Pink (outer) */}
      <path
        d="M32 56 C16 44 8 32 8 22 C8 12 16 6 24 6 C28 6 31 8 32 12 C33 8 36 6 40 6 C48 6 56 12 56 22 C56 32 48 44 32 56"
        stroke="#f472b6"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Strand 2 - Rose (inner, offset) */}
      <path
        d="M32 48 C20 40 14 32 14 24 C14 17 19 12 25 12 C28 12 30 13 32 16 C34 13 36 12 39 12 C45 12 50 17 50 24 C50 32 44 40 32 48"
        stroke="#fb7185"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export { DNAHeartLogo }
export type { DNAHeartLogoProps }
