import { useCallback, useEffect, useRef, useState } from 'react'
import type { GLViewer } from '3dmol'
import { cn } from '@/lib/utils'

export type ColorMode = 'spectrum' | 'plddt'

export const PLDDT_COLOR_SCHEME = {
  high: { min: 70, max: 100, color: '#ec4899' },
  medium: { min: 50, max: 70, color: '#f43f5e' },
  low: { min: 0, max: 50, color: '#7c3aed' },
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
  const [isSpinning, setIsSpinning] = useState(true)
  const [viewerReady, setViewerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [internalColorMode, setInternalColorMode] = useState<ColorMode>(colorMode)

  const toggleColorMode = useCallback(() => {
    const newMode: ColorMode = internalColorMode === 'spectrum' ? 'plddt' : 'spectrum'
    setInternalColorMode(newMode)
    onColorModeChange?.(newMode)
  }, [internalColorMode, onColorModeChange])

  useEffect(() => {
    setInternalColorMode(colorMode)
  }, [colorMode])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (!pdbData) return

    const initViewer = async () => {
      try {
        const $3Dmol = await import('3dmol')

        if (viewerRef.current) {
          viewerRef.current.clear()
        }

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'transparent',
        })

        viewer.addModel(pdbData, 'pdb')

        if (internalColorMode === 'plddt') {
          viewer.setStyle(
            {},
            {
              cartoon: {
                colorfunc: (atom: { b?: number }) => {
                  const plddt = atom.b ?? 50
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

        if (name1 && name2) {
          const atoms = viewer.getModel().selectedAtoms({})

          if (atoms.length > 0) {
            const caAtoms = atoms.filter((atom) => atom.atom === 'CA')

            if (caAtoms.length > 0) {
              const nTerminus = caAtoms[0]
              const cTerminus = caAtoms[caAtoms.length - 1]

              const nX = nTerminus.x ?? 0
              const nY = nTerminus.y ?? 0
              const nZ = nTerminus.z ?? 0
              const cX = cTerminus.x ?? 0
              const cY = cTerminus.y ?? 0
              const cZ = cTerminus.z ?? 0

              viewer.addLabel(name1, {
                position: { x: nX + 5, y: nY + 5, z: nZ },
                backgroundColor: 'rgba(236, 72, 153, 0.9)',
                fontColor: '#ffffff',
                fontSize: 14,
                borderThickness: 0,
                backgroundOpacity: 0.9,
                showBackground: true,
                font: 'Arial',
                fontOpacity: 1,
                inFront: true,
              })

              viewer.addLabel(name2, {
                position: { x: cX - 5, y: cY - 5, z: cZ },
                backgroundColor: 'rgba(236, 72, 153, 0.9)',
                fontColor: '#ffffff',
                fontSize: 14,
                borderThickness: 0,
                backgroundOpacity: 0.9,
                showBackground: true,
                font: 'Arial',
                fontOpacity: 1,
                inFront: true,
              })
            }
          }
        }

        viewer.zoomTo()
        viewer.zoom(0.8)
        viewer.spin('y', 0.5)
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

  const toggleSpin = useCallback(() => {
    if (!viewerRef.current) return
    const newSpinState = !isSpinning
    if (newSpinState) {
      viewerRef.current.spin('y', 0.5)
    } else {
      viewerRef.current.spin(false)
    }
    setIsSpinning(newSpinState)
  }, [isSpinning])

  const takeScreenshot = useCallback(() => {
    if (!viewerRef.current) return
    
    const proteinDataUrl = viewerRef.current.pngURI()
    
    // Create a canvas to composite the screenshot with branding
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.onload = () => {
      // Set canvas size to match the protein image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the protein image
      ctx.drawImage(img, 0, 0)
      
      // Add subtle gradient overlay at top-left for branding
      const gradientSize = 220
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gradientSize)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, gradientSize, gradientSize)
      
      // Draw the DNA heart logo SVG (bigger - 32px)
      const logoSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56 C16 44 8 32 8 22 C8 12 16 6 24 6 C28 6 31 8 32 12 C33 8 36 6 40 6 C48 6 56 12 56 22 C56 32 48 44 32 56" stroke="#f472b6" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M32 48 C20 40 14 32 14 24 C14 17 19 12 25 12 C28 12 30 13 32 16 C34 13 36 12 39 12 C45 12 50 17 50 24 C50 32 44 40 32 48" stroke="#fb7185" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      </svg>`
      
      const logoImg = new Image()
      const logoDataUrl = 'data:image/svg+xml;base64,' + btoa(logoSvg)
      
      logoImg.onload = () => {
        // Logo and text sized to match - both 30px
        const logoSize = 30
        const fontSize = 30
        const topPadding = 14
        // Align text with bottom of logo + offset to push text down
        const textY = topPadding + logoSize + 4
        
        // Draw logo at top-left
        ctx.drawImage(logoImg, 14, topPadding, logoSize, logoSize)
        
        // Add "folded" in pink (primary color)
        ctx.font = `bold ${fontSize}px "Nunito Sans Variable", "Nunito Sans", sans-serif`
        ctx.fillStyle = '#f472b6'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText('folded', 14 + logoSize + 8, textY)
        
        // Measure "folded" width to position ".love"
        const foldedWidth = ctx.measureText('folded').width
        
        // Add ".love" in muted white/gray
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText('.love', 14 + logoSize + 8 + foldedWidth, textY)
        
        // Download the branded image
        const link = document.createElement('a')
        link.download = `love-protein-${name1 || 'partner1'}-${name2 || 'partner2'}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      logoImg.src = logoDataUrl
    }
    img.src = proteinDataUrl
  }, [name1, name2])

  const containerStyles = cn(
    'relative overflow-hidden',
    'bg-card/50 backdrop-blur-sm',
    'rounded-2xl',
    'border border-border/50',
    'shadow-xl shadow-primary/5',
    'w-full',
    className
  )

  if (isLoading) {
    return (
      <div className={containerStyles}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={containerStyles}>
        <ErrorDisplay message={error} />
      </div>
    )
  }

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
          minHeight: '450px',
          height: '100%',
          touchAction: 'none',
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


// Icons
function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

// Control Panel
interface ControlPanelProps {
  isSpinning: boolean
  onToggleSpin: () => void
  onScreenshot: () => void
  colorMode: ColorMode
  onColorModeToggle: () => void
}

function ControlPanel({ isSpinning, onToggleSpin, onScreenshot, colorMode, onColorModeToggle }: ControlPanelProps) {
  const buttonStyles = cn(
    'flex items-center justify-center gap-1.5',
    'px-3 py-2 sm:px-4',
    'rounded-full',
    'bg-primary/10 text-primary',
    'border border-primary/20',
    'hover:bg-primary/20',
    'active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
    'transition-all duration-200'
  )

  return (
    <div className="flex justify-center gap-2 p-3 sm:gap-3 sm:p-4">
      <button onClick={onToggleSpin} className={buttonStyles} aria-label={isSpinning ? 'Stop rotation' : 'Start rotation'}>
        {isSpinning ? <PauseIcon /> : <PlayIcon />}
        <span className="text-sm font-medium">{isSpinning ? 'Stop' : 'Spin'}</span>
      </button>
      <button onClick={onScreenshot} className={buttonStyles} aria-label="Download screenshot">
        <CameraIcon />
        <span className="text-sm font-medium">Save</span>
      </button>
      <button onClick={onColorModeToggle} className={buttonStyles} aria-label="Toggle color mode">
        <PaletteIcon />
        <span className="text-sm font-medium">{colorMode === 'spectrum' ? 'pLDDT' : 'Spectrum'}</span>
      </button>
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex h-full min-h-[450px] flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="relative flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="animate-bounce text-primary">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
      <p className="mt-5 text-base font-medium text-primary">Folding your Love Protein...</p>
      <div className="mt-2 flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// Error display
function ErrorDisplay({ message }: { message: string }) {
  const isWebGLError = message.toLowerCase().includes('webgl')

  return (
    <div className="flex h-full min-h-[450px] flex-col items-center justify-center p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-destructive">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09V21.35z" fill="currentColor" transform="translate(-1, 0)" />
        <path d="M12 21.35V5.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" transform="translate(1, 0)" opacity="0.6" />
      </svg>
      <p className="mt-4 text-base font-medium text-destructive">{message}</p>
      {isWebGLError && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try using a different browser or enabling hardware acceleration.
        </p>
      )}
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="flex h-full min-h-[450px] flex-col items-center justify-center p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-primary/60">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" opacity="0.6" />
      </svg>
      <p className="mt-4 text-base font-medium text-primary">Enter your names to create a Love Protein</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your unique protein structure awaits
      </p>
    </div>
  )
}
