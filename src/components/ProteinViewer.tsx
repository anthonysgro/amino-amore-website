import { useEffect, useRef, useState, useCallback } from 'react'
import type { GLViewer } from '3dmol'
import { cn } from '@/lib/utils'

// Color mode type for protein visualization
export type ColorMode = 'spectrum' | 'plddt'

// pLDDT color scheme with romantic gradient colors
// High confidence = bright pink, Medium = rose, Low = deep purple
export const PLDDT_COLOR_SCHEME = {
  high: { min: 70, max: 100, color: '#ec4899' },    // Pink-500 - high confidence
  medium: { min: 50, max: 70, color: '#f43f5e' },   // Rose-500 - medium confidence
  low: { min: 0, max: 50, color: '#7c3aed' }        // Violet-600 - low confidence
} as const

interface ProteinViewerProps {
  pdbData: string | undefined
  isLoading?: boolean
  name1?: string
  name2?: string
  className?: string
  colorMode?: ColorMode
  onColorModeChange?: (mode: ColorMode) => void
}

export function ProteinViewer({
  pdbData,
  isLoading = false,
  name1,
  name2,
  className,
  colorMode = 'spectrum',
  onColorModeChange,
}: ProteinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<GLViewer | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [viewerReady, setViewerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [internalColorMode, setInternalColorMode] = useState<ColorMode>(colorMode)

  // Handle color mode toggle
  const toggleColorMode = useCallback(() => {
    const newMode: ColorMode = internalColorMode === 'spectrum' ? 'plddt' : 'spectrum'
    setInternalColorMode(newMode)
    onColorModeChange?.(newMode)
  }, [internalColorMode, onColorModeChange])

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalColorMode(colorMode)
  }, [colorMode])

  // Initialize 3Dmol viewer (browser-only)
  useEffect(() => {
    // SSR-safe check - skip all 3Dmol initialization on server
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (!pdbData) return

    const initViewer = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const $3Dmol = await import('3dmol')

        // Clear previous viewer if exists
        if (viewerRef.current) {
          viewerRef.current.clear()
        }

        // Create new viewer
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'transparent',
        })

        // Add PDB model
        viewer.addModel(pdbData, 'pdb')

        // Apply cartoon styling based on color mode
        if (internalColorMode === 'plddt') {
          // pLDDT coloring uses b-factor values from ESMFold
          // ESMFold stores pLDDT scores (0-100) in the b-factor field
          viewer.setStyle(
            {},
            {
              cartoon: {
                colorfunc: (atom: { b?: number }) => {
                  const plddt = atom.b ?? 50 // Default to medium confidence
                  if (plddt >= PLDDT_COLOR_SCHEME.high.min) {
                    return PLDDT_COLOR_SCHEME.high.color
                  } else if (plddt >= PLDDT_COLOR_SCHEME.medium.min) {
                    return PLDDT_COLOR_SCHEME.medium.color
                  } else {
                    return PLDDT_COLOR_SCHEME.low.color
                  }
                },
                opacity: 0.95,
              },
            }
          )
        } else {
          // Default spectrum coloring (rainbow gradient along chain)
          viewer.setStyle(
            {},
            {
              cartoon: {
                color: 'spectrum',
                opacity: 0.95,
              },
            }
          )
        }

        // Add couple name labels near protein termini if names provided
        if (name1 && name2) {
          // Get atoms to find protein termini positions
          const atoms = viewer.getModel().selectedAtoms({})
          
          if (atoms && atoms.length > 0) {
            // Find N-terminus (first CA atom) and C-terminus (last CA atom)
            const caAtoms = atoms.filter((atom) => atom.atom === 'CA')
            
            if (caAtoms.length > 0) {
              const nTerminus = caAtoms[0]
              const cTerminus = caAtoms[caAtoms.length - 1]
              
              // Ensure coordinates are defined before using them
              const nX = nTerminus.x ?? 0
              const nY = nTerminus.y ?? 0
              const nZ = nTerminus.z ?? 0
              const cX = cTerminus.x ?? 0
              const cY = cTerminus.y ?? 0
              const cZ = cTerminus.z ?? 0
              
              // Position name1 label near N-terminus with offset
              viewer.addLabel(name1, {
                position: { 
                  x: nX + 5, 
                  y: nY + 5, 
                  z: nZ 
                },
                backgroundColor: 'rgba(255, 182, 193, 0.9)',
                fontColor: '#be185d',
                fontSize: 16,
                borderThickness: 2,
                borderColor: '#f9a8d4',
                backgroundOpacity: 0.9,
                showBackground: true,
                font: 'Arial',
                fontOpacity: 1,
                inFront: true,
              })
              
              // Position name2 label near C-terminus with offset
              viewer.addLabel(name2, {
                position: { 
                  x: cX - 5, 
                  y: cY - 5, 
                  z: cZ 
                },
                backgroundColor: 'rgba(255, 182, 193, 0.9)',
                fontColor: '#be185d',
                fontSize: 16,
                borderThickness: 2,
                borderColor: '#f9a8d4',
                backgroundOpacity: 0.9,
                showBackground: true,
                font: 'Arial',
                fontOpacity: 1,
                inFront: true,
              })
            } else {
              // Fallback to fixed positions if no CA atoms found
              viewer.addLabel(name1, {
                position: { x: 0, y: 0, z: 20 },
                backgroundColor: 'rgba(255, 182, 193, 0.9)',
                fontColor: '#be185d',
                fontSize: 16,
                inFront: true,
              })
              viewer.addLabel(name2, {
                position: { x: 0, y: 0, z: -20 },
                backgroundColor: 'rgba(255, 182, 193, 0.9)',
                fontColor: '#be185d',
                fontSize: 16,
                inFront: true,
              })
            }
          }
        }

        viewer.zoomTo()
        viewer.render()

        viewerRef.current = viewer
        setViewerReady(true)
        setError(null)
      } catch (err) {
        setError('Unable to initialize 3D viewer. WebGL may not be supported.')
        console.error('3Dmol initialization error:', err)
      }
    }

    initViewer()

    return () => {
      if (viewerRef.current) {
        viewerRef.current.clear()
        viewerRef.current = null
      }
    }
  }, [pdbData, name1, name2, internalColorMode])

  // Handle spin toggle
  const toggleSpin = useCallback(() => {
    if (!viewerRef.current) return
    const newSpinState = !isSpinning
    viewerRef.current.spin(newSpinState)
    setIsSpinning(newSpinState)
  }, [isSpinning])

  // Handle screenshot
  const takeScreenshot = useCallback(() => {
    if (!viewerRef.current) return
    const dataUrl = viewerRef.current.pngURI()
    const link = document.createElement('a')
    link.download = `love-protein-${name1 || 'partner1'}-${name2 || 'partner2'}.png`
    link.href = dataUrl
    link.click()
  }, [name1, name2])

  // Container styles for romantic aesthetic - hero sizing
  const containerStyles = cn(
    // Base container styling
    'relative overflow-hidden',
    // Romantic gradient background
    'bg-linear-to-br from-pink-50/80 via-rose-50/60 to-purple-50/80',
    // Rounded corners and shadow for polished look
    'rounded-2xl shadow-lg shadow-pink-200/50',
    // Border for subtle definition
    'border border-pink-100/50',
    // Hero sizing - larger for visual impact
    'w-full min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px]',
    className
  )

  // Render loading state
  if (isLoading) {
    return (
      <div className={containerStyles}>
        <LoadingSkeleton />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className={containerStyles}>
        <ErrorDisplay message={error} />
      </div>
    )
  }

  // Render empty state
  if (!pdbData) {
    return (
      <div className={containerStyles}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={cn(containerStyles, 'flex flex-col')}>
      <div
        ref={containerRef}
        className="protein-viewer-canvas flex-1"
        style={{ 
          width: '100%', 
          minHeight: '400px',
          height: '100%',
          touchAction: 'none' 
        }}
      />
      {viewerReady && (
        <ControlPanel
          isSpinning={isSpinning}
          onToggleSpin={toggleSpin}
          onScreenshot={takeScreenshot}
          colorMode={internalColorMode}
          onColorModeToggle={toggleColorMode}
        />
      )}
    </div>
  )
}

// SVG Icons for controls
function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
  )
}

// Color palette icon for color mode toggle
function PaletteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

// Control Panel Component with romantic styling
interface ControlPanelProps {
  isSpinning: boolean
  onToggleSpin: () => void
  onScreenshot: () => void
  colorMode: ColorMode
  onColorModeToggle: () => void
}

function ControlPanel({ isSpinning, onToggleSpin, onScreenshot, colorMode, onColorModeToggle }: ControlPanelProps) {
  // Shared button styles for romantic aesthetic
  const buttonStyles = cn(
    // Layout
    'flex items-center justify-center gap-2',
    // Sizing - responsive
    'px-4 py-2 sm:px-5 sm:py-2.5',
    // Rounded pill shape
    'rounded-full',
    // Soft pink colors
    'bg-pink-100/90 text-pink-700',
    // Border for definition
    'border border-pink-200/60',
    // Shadow for depth
    'shadow-md shadow-pink-200/40',
    // Hover state
    'hover:bg-pink-200/90 hover:shadow-lg hover:shadow-pink-300/40',
    // Active state
    'active:scale-95 active:shadow-sm',
    // Focus state for accessibility
    'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2',
    // Smooth transitions
    'transition-all duration-200 ease-out'
  )

  return (
    <div className="control-panel flex justify-center gap-3 p-3 sm:gap-4 sm:p-4">
      <button
        onClick={onToggleSpin}
        className={buttonStyles}
        aria-label={isSpinning ? 'Stop rotation' : 'Start rotation'}
      >
        {isSpinning ? <PauseIcon /> : <PlayIcon />}
        <span className="text-sm font-medium sm:text-base">{isSpinning ? 'Stop' : 'Spin'}</span>
      </button>
      <button
        onClick={onScreenshot}
        className={buttonStyles}
        aria-label="Download screenshot"
      >
        <CameraIcon />
        <span className="text-sm font-medium sm:text-base">Save</span>
      </button>
      <button
        onClick={onColorModeToggle}
        className={buttonStyles}
        aria-label={colorMode === 'spectrum' ? 'Switch to confidence coloring' : 'Switch to spectrum coloring'}
      >
        <PaletteIcon />
        <span className="text-sm font-medium sm:text-base">{colorMode === 'spectrum' ? 'pLDDT' : 'Spectrum'}</span>
      </button>
    </div>
  )
}

// Loading skeleton component with animated heart and romantic styling
function LoadingSkeleton() {
  return (
    <div className="loading-skeleton flex h-full min-h-[400px] flex-col items-center justify-center p-6 sm:min-h-[450px] md:min-h-[500px]">
      {/* Animated pulsing heart container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 animate-ping rounded-full bg-pink-300 opacity-30" />
        {/* Inner pulsing circle */}
        <div className="relative flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-linear-to-br from-pink-200 to-rose-200 shadow-lg sm:h-24 sm:w-24">
          {/* Heart icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="animate-bounce text-pink-500 sm:h-12 sm:w-12"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
      {/* Loading message */}
      <p className="mt-5 text-base font-medium text-pink-600 sm:mt-6 sm:text-lg">
        Folding your Love Protein...
      </p>
      {/* Animated dots */}
      <div className="mt-2 flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Error display component with broken heart icon and romantic styling
function ErrorDisplay({ message }: { message: string }) {
  // Determine if this is a WebGL-specific error
  const isWebGLError = message.toLowerCase().includes('webgl')

  return (
    <div className="error-display flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center sm:min-h-[450px] md:min-h-[500px]">
      {/* Broken heart SVG icon */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          className="text-rose-400 sm:h-16 sm:w-16"
        >
          {/* Left half of broken heart */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09V21.35z"
            fill="currentColor"
            transform="translate(-1, 0)"
          />
          {/* Right half of broken heart */}
          <path
            d="M12 21.35V5.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="currentColor"
            transform="translate(1, 0)"
            opacity="0.7"
          />
          {/* Crack line */}
          <path
            d="M12 5 L11 9 L13 11 L11 14 L12 21"
            stroke="#fecdd3"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
      {/* Error message */}
      <p className="mt-4 text-base font-medium text-rose-600 sm:text-lg">{message}</p>
      {/* Additional help text for WebGL errors */}
      {isWebGLError && (
        <p className="mt-2 max-w-sm text-sm text-rose-400">
          Try using a different browser or enabling hardware acceleration in your browser settings.
        </p>
      )}
    </div>
  )
}

// Empty state component with romantic prompt to enter names
function EmptyState() {
  return (
    <div className="empty-state flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center sm:min-h-[450px] md:min-h-[500px]">
      {/* Intertwined hearts icon */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          className="text-pink-400 sm:h-16 sm:w-16"
        >
          {/* First heart */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="currentColor"
            opacity="0.6"
          />
          {/* Second heart (smaller, offset) */}
          <path
            d="M12 18l-0.9-0.82C7.6 13.8 5 11.4 5 8.5 5 6.42 6.42 5 8.5 5c1.04 0 2.04.49 2.7 1.25C11.86 5.49 12.86 5 13.9 5 15.98 5 17.4 6.42 17.4 8.5c0 2.9-2.6 5.3-6.5 8.68L12 18z"
            fill="#f472b6"
            transform="translate(0, 1)"
          />
        </svg>
      </div>
      {/* Prompt message */}
      <p className="mt-4 text-base font-medium text-pink-600 sm:text-lg">
        Enter your names to create a Love Protein
      </p>
      <p className="mt-2 max-w-sm text-sm text-pink-400">
        Your unique protein structure awaits — a molecular symbol of your connection
      </p>
    </div>
  )
}
