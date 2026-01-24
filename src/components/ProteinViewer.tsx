import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { GLViewer } from '3dmol'
import { cn } from '@/lib/utils'
import { parsePdbStats } from '@/utils/pdbStats'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type ColorMode = 'spectrum' | 'plddt'

export const PLDDT_COLOR_SCHEME = {
  high: { min: 70, max: 100, color: '#ec4899', label: 'High confidence' },
  medium: { min: 50, max: 70, color: '#f43f5e', label: 'Medium confidence' },
  low: { min: 0, max: 50, color: '#7c3aed', label: 'Low confidence' },
} as const

// Amino acid display names
const AMINO_ACID_NAMES: Record<string, string> = {
  A: 'Alanine',
  C: 'Cysteine',
  D: 'Aspartic Acid',
  E: 'Glutamic Acid',
  F: 'Phenylalanine',
  G: 'Glycine',
  H: 'Histidine',
  I: 'Isoleucine',
  K: 'Lysine',
  L: 'Leucine',
  M: 'Methionine',
  N: 'Asparagine',
  P: 'Proline',
  Q: 'Glutamine',
  R: 'Arginine',
  S: 'Serine',
  T: 'Threonine',
  V: 'Valine',
  W: 'Tryptophan',
  Y: 'Tyrosine',
}

interface ProteinViewerProps {
  pdbData: string | undefined
  isLoading?: boolean
  name1?: string
  name2?: string
  sequence?: string
  className?: string
  colorMode?: ColorMode
  onColorModeChange?: (mode: ColorMode) => void
  onViewerReady?: (getImageData: () => string | null) => void
}

export function ProteinViewer({
  pdbData,
  isLoading = false,
  name1,
  name2,
  sequence,
  className,
  colorMode = 'spectrum',
  onColorModeChange,
  onViewerReady,
}: ProteinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<GLViewer | null>(null)
  const [isSpinning, setIsSpinning] = useState(true)
  const [viewerReady, setViewerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [internalColorMode, setInternalColorMode] =
    useState<ColorMode>(colorMode)
  const [showStats, setShowStats] = useState(true)
  const [showSequence, setShowSequence] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredResidue, setHoveredResidue] = useState<{
    index: number
    name: string
    plddt: number
  } | null>(null)
  const [highlightedResidue, setHighlightedResidue] = useState<number | null>(
    null,
  )
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const toggleColorMode = useCallback(() => {
    const newMode: ColorMode =
      internalColorMode === 'spectrum' ? 'plddt' : 'spectrum'
    setInternalColorMode(newMode)
    onColorModeChange?.(newMode)
  }, [internalColorMode, onColorModeChange])

  useEffect(() => {
    setInternalColorMode(colorMode)
  }, [colorMode])

  // Fullscreen handling - with mobile fallback
  const toggleFullscreen = useCallback(() => {
    if (!fullscreenRef.current) return

    // Check if native fullscreen API is available
    const canUseNativeFullscreen =
      document.fullscreenEnabled ||
      (document as unknown as { webkitFullscreenEnabled?: boolean })
        .webkitFullscreenEnabled

    if (canUseNativeFullscreen) {
      // Use native fullscreen API
      const elem = fullscreenRef.current as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>
      }
      const doc = document as Document & {
        webkitFullscreenElement?: Element
        webkitExitFullscreen?: () => Promise<void>
      }

      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        // Enter fullscreen
        const requestFn = elem.webkitRequestFullscreen ?? elem.requestFullscreen
        requestFn
          .call(elem)
          .then(() => {
            setIsFullscreen(true)
          })
          .catch(() => {
            // Native fullscreen failed, use CSS fallback
            setIsFullscreen(true)
          })
      } else {
        // Exit fullscreen
        const exitFn = doc.webkitExitFullscreen ?? document.exitFullscreen
        exitFn
          .call(document)
          .then(() => {
            setIsFullscreen(false)
          })
          .catch(() => {
            setIsFullscreen(false)
          })
      }
    } else {
      // Mobile fallback: toggle CSS-based fullscreen
      setIsFullscreen((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element
      }
      const isNativeFullscreen = !!(
        document.fullscreenElement || doc.webkitFullscreenElement
      )
      // Only update if we're using native fullscreen (not CSS fallback)
      if (
        document.fullscreenEnabled ||
        (document as unknown as { webkitFullscreenEnabled?: boolean })
          .webkitFullscreenEnabled
      ) {
        setIsFullscreen(isNativeFullscreen)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      )
    }
  }, [])

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

        // Use theme-aware background color
        const isDarkMode = document.documentElement.classList.contains('dark')
        const bgColor = isDarkMode ? '#141414' : '#fafafa'

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: bgColor,
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
            },
          )
        } else {
          viewer.setStyle(
            {},
            {
              cartoon: {
                color: 'spectrum',
                opacity: 0.95,
              },
            },
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
                fontSize: 18,
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
                fontSize: 18,
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

        // Add hover callback for residue info
        viewer.setHoverable(
          {},
          true,
          (atom: { resi?: number; resn?: string; b?: number } | null) => {
            if (atom) {
              setHoveredResidue({
                index: atom.resi ?? 0,
                name: atom.resn ?? '',
                plddt: atom.b ?? 0,
              })
            }
          },
          () => {
            setHoveredResidue(null)
          },
        )

        viewer.render()

        viewerRef.current = viewer
        setViewerReady(true)
        setError(null)

        // Call onViewerReady callback with a function to get image data
        if (onViewerReady) {
          // Small delay to ensure render is complete
          setTimeout(() => {
            onViewerReady(() => {
              if (viewerRef.current) {
                return viewerRef.current.pngURI()
              }
              return null
            })
          }, 500)
        }
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
  }, [pdbData, name1, name2, internalColorMode, onViewerReady])

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

  // Highlight a specific residue in the 3D view
  const highlightResidue = useCallback(
    (residueIndex: number | null) => {
      if (!viewerRef.current || !pdbData) return
      setHighlightedResidue(residueIndex)

      // Re-render with highlight
      viewerRef.current.removeAllLabels()

      if (residueIndex !== null) {
        const atoms = viewerRef.current
          .getModel()
          .selectedAtoms({ resi: residueIndex + 1 })
        if (atoms.length > 0) {
          const caAtom = atoms.find((a) => a.atom === 'CA') ?? atoms[0]
          viewerRef.current.addLabel(sequence?.[residueIndex] || '', {
            position: {
              x: caAtom.x ?? 0,
              y: (caAtom.y ?? 0) + 3,
              z: caAtom.z ?? 0,
            },
            backgroundColor: 'rgba(236, 72, 153, 0.95)',
            fontColor: '#ffffff',
            fontSize: 16,
            borderThickness: 0,
            backgroundOpacity: 0.95,
            showBackground: true,
            font: 'Arial',
            fontOpacity: 1,
            inFront: true,
          })
        }
      }

      // Re-add name labels
      if (name1 && name2) {
        const atoms = viewerRef.current.getModel().selectedAtoms({})
        const caAtoms = atoms.filter((atom) => atom.atom === 'CA')
        if (caAtoms.length > 0) {
          const nTerminus = caAtoms[0]
          const cTerminus = caAtoms[caAtoms.length - 1]

          viewerRef.current.addLabel(name1, {
            position: {
              x: (nTerminus.x ?? 0) + 5,
              y: (nTerminus.y ?? 0) + 5,
              z: nTerminus.z ?? 0,
            },
            backgroundColor: 'rgba(236, 72, 153, 0.9)',
            fontColor: '#ffffff',
            fontSize: 18,
            borderThickness: 0,
            backgroundOpacity: 0.9,
            showBackground: true,
            font: 'Arial',
            fontOpacity: 1,
            inFront: true,
          })

          viewerRef.current.addLabel(name2, {
            position: {
              x: (cTerminus.x ?? 0) - 5,
              y: (cTerminus.y ?? 0) - 5,
              z: cTerminus.z ?? 0,
            },
            backgroundColor: 'rgba(236, 72, 153, 0.9)',
            fontColor: '#ffffff',
            fontSize: 18,
            borderThickness: 0,
            backgroundOpacity: 0.9,
            showBackground: true,
            font: 'Arial',
            fontOpacity: 1,
            inFront: true,
          })
        }
      }

      viewerRef.current.render()
    },
    [pdbData, name1, name2, sequence],
  )

  // Download PDB file
  const downloadPdb = useCallback(() => {
    if (!pdbData) return
    const blob = new Blob([pdbData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `love-protein-${name1 || 'partner1'}-${name2 || 'partner2'}.pdb`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [pdbData, name1, name2])

  const takeScreenshot = useCallback(() => {
    if (!viewerRef.current || !containerRef.current || !pdbData) return

    // Parse stats from PDB data
    const stats = parsePdbStats(pdbData)

    // Get screenshot at current resolution
    const proteinDataUrl = viewerRef.current.pngURI()

    // Create a canvas to composite the screenshot with branding
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Detect current theme
      const isDarkMode = document.documentElement.classList.contains('dark')
      const panelBg = isDarkMode
        ? 'rgba(20, 20, 20, 0.85)'
        : 'rgba(255, 255, 255, 0.9)'
      const textPrimary = isDarkMode
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(0, 0, 0, 0.9)'
      const textSecondary = isDarkMode
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.5)'
      const accentColor = '#f472b6'

      canvas.width = img.width
      canvas.height = img.height

      // Draw the protein image
      ctx.drawImage(img, 0, 0)

      // Draw stats panel on the left
      if (showStats && stats.atomCount > 0) {
        const panelPadding = 20
        const panelWidth = 220
        const lineHeight = 28
        const headerHeight = 40

        const statsData = [
          ['Residues', stats.residueCount.toString()],
          ['Atoms', stats.atomCount.toLocaleString()],
          ['Uniqueness', `${(100 - stats.averagePlddt).toFixed(1)}%`],
          [
            'Size (Å)',
            `${stats.dimensions.width.toFixed(0)}×${stats.dimensions.height.toFixed(0)}×${stats.dimensions.depth.toFixed(0)}`,
          ],
          ['Mass', `${stats.molecularWeight.toFixed(1)} kDa`],
        ]

        const panelHeight =
          headerHeight +
          panelPadding +
          statsData.length * lineHeight +
          panelPadding

        // Draw panel background
        ctx.fillStyle = panelBg
        ctx.fillRect(16, 16, panelWidth, panelHeight)

        // Draw header
        ctx.fillStyle = accentColor
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          'STRUCTURE DATA',
          16 + panelPadding,
          16 + headerHeight / 2 + 4,
        )

        // Draw divider line
        ctx.strokeStyle = isDarkMode
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.1)'
        ctx.beginPath()
        ctx.moveTo(16 + panelPadding, 16 + headerHeight)
        ctx.lineTo(16 + panelWidth - panelPadding, 16 + headerHeight)
        ctx.stroke()

        // Draw stats
        statsData.forEach(([label, value], i) => {
          const y =
            16 + headerHeight + panelPadding + i * lineHeight + lineHeight / 2

          // Label
          ctx.fillStyle = textSecondary
          ctx.font = '14px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(label, 16 + panelPadding, y)

          // Value
          ctx.fillStyle = textPrimary
          ctx.font = 'bold 14px monospace'
          ctx.textAlign = 'right'
          ctx.fillText(value, 16 + panelWidth - panelPadding, y)
        })
      }

      // Draw sequence at the bottom (bigger)
      if (showSequence && sequence) {
        ctx.fillStyle = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
        ctx.font = '24px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(sequence, canvas.width / 2, canvas.height - 20)
      }

      // Draw logo + branding in top right
      const logoSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56 C16 44 8 32 8 22 C8 12 16 6 24 6 C28 6 31 8 32 12 C33 8 36 6 40 6 C48 6 56 12 56 22 C56 32 48 44 32 56" stroke="#f472b6" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M32 48 C20 40 14 32 14 24 C14 17 19 12 25 12 C28 12 30 13 32 16 C34 13 36 12 39 12 C45 12 50 17 50 24 C50 32 44 40 32 48" stroke="#fb7185" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      </svg>`

      const logoImg = new Image()
      const logoDataUrl = 'data:image/svg+xml;base64,' + btoa(logoSvg)

      logoImg.onload = () => {
        const logoSize = 48
        const brandFontSize = 28
        const rightPadding = 20
        const topPadding = 20
        // Position in top right
        const brandY = topPadding + logoSize / 2

        // Measure brand text
        ctx.font = `bold ${brandFontSize}px system-ui, -apple-system, sans-serif`
        const foldedWidth = ctx.measureText('folded').width
        const loveWidth = ctx.measureText('.love').width
        const totalWidth = logoSize + 10 + foldedWidth + loveWidth

        const brandX = canvas.width - rightPadding - totalWidth

        // Draw semi-transparent background behind brand
        const bgHeight = logoSize + 10
        ctx.fillStyle = panelBg
        ctx.fillRect(
          brandX - 16,
          brandY - bgHeight / 2,
          totalWidth + 32,
          bgHeight,
        )

        // Draw logo (vertically centered on brandY)
        ctx.drawImage(
          logoImg,
          brandX,
          brandY - logoSize / 2,
          logoSize,
          logoSize,
        )

        // Draw "folded" in pink (text baseline at brandY + some offset for visual centering)
        ctx.fillStyle = accentColor
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText('folded', brandX + logoSize + 10, brandY)

        // Draw ".love" in secondary color
        ctx.fillStyle = textSecondary
        ctx.fillText('.love', brandX + logoSize + 10 + foldedWidth, brandY)

        // Convert canvas to blob and share/download
        canvas.toBlob(async (blob) => {
          if (!blob) return

          const fileName = `love-protein-${name1 || 'partner1'}-${name2 || 'partner2'}.png`

          // Try native share with file (mobile - saves to Photos)
          const canShare =
            typeof navigator !== 'undefined' &&
            'share' in navigator &&
            'canShare' in navigator
          if (canShare) {
            const file = new File([blob], fileName, { type: 'image/png' })
            const shareData = { files: [file] }

            if (navigator.canShare(shareData)) {
              try {
                await navigator.share(shareData)
                return
              } catch {
                // User cancelled or share failed, fall back to download
              }
            }
          }

          // Fall back to download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = fileName
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
      logoImg.src = logoDataUrl
    }
    img.src = proteinDataUrl
  }, [name1, name2, sequence, pdbData, showStats, showSequence])

  const containerStyles = cn(
    'relative overflow-hidden',
    'bg-card/50 backdrop-blur-sm',
    'rounded-2xl',
    'border border-border/50',
    'shadow-xl shadow-primary/5',
    'w-full',
    className,
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

  // Parse stats for overlay
  const stats = pdbData ? parsePdbStats(pdbData) : null

  return (
    <div
      ref={fullscreenRef}
      className={cn(
        containerStyles,
        'flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 rounded-none bg-background',
      )}
    >
      {/* Ambient glow effect */}
      <div
        className="absolute -inset-1 bg-linear-to-r from-pink-500/20 via-rose-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 -z-10 animate-pulse"
        style={{ animationDuration: '3s' }}
      />

      <div className="relative flex-1 min-h-[450px]">
        <div
          ref={containerRef}
          className="protein-viewer-canvas absolute inset-0"
          style={{
            touchAction: 'none',
          }}
        />

        {/* Floating Toolbar */}
        {viewerReady && (
          <FloatingToolbar
            isSpinning={isSpinning}
            onToggleSpin={toggleSpin}
            onScreenshot={takeScreenshot}
            onDownloadPdb={downloadPdb}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            colorMode={internalColorMode}
            onColorModeToggle={toggleColorMode}
          />
        )}

        {/* Residue Hover Info */}
        <AnimatePresence>
          {hoveredResidue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 pointer-events-none"
            >
              <div className="bg-background/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-primary">
                    {hoveredResidue.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {AMINO_ACID_NAMES[hoveredResidue.name] || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-muted-foreground">
                    Position {hoveredResidue.index}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span
                    className={cn(
                      'font-medium',
                      hoveredResidue.plddt >= 70
                        ? 'text-pink-500'
                        : hoveredResidue.plddt >= 50
                          ? 'text-rose-500'
                          : 'text-purple-500',
                    )}
                  >
                    pLDDT: {hoveredResidue.plddt.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* pLDDT Legend */}
        {viewerReady && internalColorMode === 'plddt' && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 pointer-events-none">
            <div className="bg-background/85 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-[10px] sm:text-xs">
              <div className="text-primary font-semibold text-[8px] sm:text-[10px] uppercase tracking-wider mb-1.5 sm:mb-2">
                Confidence (pLDDT)
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                {Object.entries(PLDDT_COLOR_SCHEME).map(
                  ([key, { color, label, min, max }]) => (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground/50 ml-auto">
                        {min}-{max}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats overlay (when not pLDDT mode) */}
        {viewerReady &&
          stats &&
          stats.atomCount > 0 &&
          showStats &&
          internalColorMode !== 'plddt' && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 pointer-events-none">
              <div className="bg-background/85 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-[10px] sm:text-xs">
                <div className="text-primary font-semibold text-[8px] sm:text-[10px] uppercase tracking-wider mb-1.5 sm:mb-2">
                  Structure Data
                </div>
                <div className="space-y-0.5 sm:space-y-1 font-mono">
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <span className="text-muted-foreground">Residues</span>
                    <span className="text-foreground font-medium">
                      {stats.residueCount}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <span className="text-muted-foreground">Atoms</span>
                    <span className="text-foreground font-medium">
                      {stats.atomCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <span className="text-muted-foreground">Uniqueness</span>
                    <span className="text-foreground font-medium">
                      {(100 - stats.averagePlddt).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 sm:gap-4">
                    <span className="text-muted-foreground">Size (Å)</span>
                    <span className="text-foreground font-medium">
                      {stats.dimensions.width.toFixed(0)}×
                      {stats.dimensions.height.toFixed(0)}×
                      {stats.dimensions.depth.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Bottom section: Sequence bar + checkboxes */}
      {viewerReady && (
        <div className="border-t border-border/30">
          {/* Interactive Sequence Bar */}
          {sequence && (
            <SequenceBar
              sequence={sequence}
              name1={name1}
              name2={name2}
              hoveredResidue={hoveredResidue?.index ?? null}
              highlightedResidue={highlightedResidue}
              onResidueHover={highlightResidue}
              colorMode={internalColorMode}
            />
          )}

          {/* Checkboxes for overlay toggles */}
          <div className="flex justify-center gap-4 py-2 text-sm border-t border-border/20">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-stats"
                checked={showStats}
                onCheckedChange={(checked) => setShowStats(checked === true)}
              />
              <Label
                htmlFor="show-stats"
                className="text-muted-foreground cursor-pointer text-xs"
              >
                Show Stats
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-sequence"
                checked={showSequence}
                onCheckedChange={(checked) => setShowSequence(checked === true)}
              />
              <Label
                htmlFor="show-sequence"
                className="text-muted-foreground cursor-pointer text-xs"
              >
                Show Sequence
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icons
function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  )
}

// Interactive Sequence Bar
interface SequenceBarProps {
  sequence: string
  name1?: string
  name2?: string
  hoveredResidue: number | null
  highlightedResidue: number | null
  onResidueHover: (index: number | null) => void
  colorMode: ColorMode
}

function SequenceBar({
  sequence,
  name1,
  name2,
  hoveredResidue,
  highlightedResidue,
  onResidueHover,
  colorMode,
}: SequenceBarProps) {
  // Calculate name boundaries (approximate - names are at start and end with linker in middle)
  const name1Length = name1?.length || 0
  const name2Length = name2?.length || 0
  const linkerStart = name1Length
  const linkerEnd = sequence.length - name2Length

  return (
    <div
      className="px-3 pt-4 pb-2 border-b border-border/30 bg-background/50 backdrop-blur-sm overflow-x-auto scrollbar-thin"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(236 72 153 / 0.3) transparent',
      }}
    >
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(236 72 153 / 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(236 72 153 / 0.5);
        }
      `}</style>
      <div className="flex items-center gap-0.5 justify-center min-w-max">
        {sequence.split('').map((residue, index) => {
          const isName1 = index < linkerStart
          const isName2 = index >= linkerEnd
          const isLinker = !isName1 && !isName2
          const isHovered = hoveredResidue === index
          const isHighlighted = highlightedResidue === index

          // Determine color based on position and mode
          let bgColor = 'bg-muted/50'
          if (colorMode === 'spectrum') {
            if (isName1) bgColor = 'bg-pink-500/70'
            else if (isName2) bgColor = 'bg-rose-500/70'
            else bgColor = 'bg-purple-500/50'
          }

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-5 h-6 text-[10px] font-mono font-medium rounded-sm transition-all duration-150',
                    bgColor,
                    'text-white/90',
                    'hover:scale-110 hover:z-10',
                    (isHovered || isHighlighted) &&
                      'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110 z-10',
                    isLinker && 'opacity-60',
                  )}
                  onMouseEnter={() => onResidueHover(index)}
                  onMouseLeave={() => onResidueHover(null)}
                >
                  {residue}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">
                  {AMINO_ACID_NAMES[residue] || residue}
                </div>
                <div className="text-muted-foreground">
                  Position {index + 1} •{' '}
                  {isName1 ? name1 : isName2 ? name2 : 'Linker'}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        {name1 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-pink-500" />
            <span>{name1}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-purple-500/50" />
          <span>Linker</span>
        </div>
        {name2 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-rose-500" />
            <span>{name2}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Floating Toolbar
interface FloatingToolbarProps {
  isSpinning: boolean
  onToggleSpin: () => void
  onScreenshot: () => void
  onDownloadPdb: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  colorMode: ColorMode
  onColorModeToggle: () => void
}

function FloatingToolbar({
  isSpinning,
  onToggleSpin,
  onScreenshot,
  onDownloadPdb,
  onToggleFullscreen,
  isFullscreen,
  colorMode,
  onColorModeToggle,
}: FloatingToolbarProps) {
  const buttonStyles = cn(
    'flex items-center justify-center',
    'w-9 h-9 sm:w-10 sm:h-10',
    'rounded-full',
    'bg-background/80 backdrop-blur-md',
    'text-foreground/80',
    'border border-border/50',
    'hover:bg-primary/10 hover:text-primary hover:border-primary/30',
    'active:scale-95',
    'transition-all duration-200',
    'shadow-lg shadow-black/5',
  )

  // Divider: vertical on mobile (horizontal layout), horizontal on desktop (vertical layout)
  const dividerStyles = 'bg-border/50 w-px h-6 sm:w-auto sm:h-px sm:my-1'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'absolute',
        // Mobile: horizontal bar at bottom center
        'bottom-3 left-1/2 -translate-x-1/2 flex-row gap-2',
        // Desktop: vertical bar on right side
        'sm:bottom-auto sm:left-auto sm:translate-x-0 sm:right-3 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col',
        'flex',
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onToggleSpin} className={buttonStyles}>
            {isSpinning ? <PauseIcon /> : <PlayIcon />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          {isSpinning ? 'Stop rotation' : 'Start rotation'}
        </TooltipContent>
        <TooltipContent side="left" className="hidden sm:block">
          {isSpinning ? 'Stop rotation' : 'Start rotation'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onColorModeToggle} className={buttonStyles}>
            <PaletteIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          {colorMode === 'spectrum'
            ? 'Show pLDDT colors'
            : 'Show spectrum colors'}
        </TooltipContent>
        <TooltipContent side="left" className="hidden sm:block">
          {colorMode === 'spectrum'
            ? 'Show pLDDT colors'
            : 'Show spectrum colors'}
        </TooltipContent>
      </Tooltip>

      <div className={dividerStyles} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onScreenshot} className={buttonStyles}>
            <CameraIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          Save image
        </TooltipContent>
        <TooltipContent side="left" className="hidden sm:block">
          Save image
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onDownloadPdb} className={buttonStyles}>
            <DownloadIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          Download PDB file
        </TooltipContent>
        <TooltipContent side="left" className="hidden sm:block">
          Download PDB file
        </TooltipContent>
      </Tooltip>

      <div className={dividerStyles} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onToggleFullscreen} className={buttonStyles}>
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="sm:hidden">
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </TooltipContent>
        <TooltipContent side="left" className="hidden sm:block">
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </TooltipContent>
      </Tooltip>
    </motion.div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex h-full min-h-[450px] flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="relative flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="animate-bounce text-primary"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
      <p className="mt-5 text-base font-medium text-primary">
        Folding your Love Protein...
      </p>
      <div className="mt-2 flex gap-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}

// Error display
function ErrorDisplay({ message }: { message: string }) {
  const isWebGLError = message.toLowerCase().includes('webgl')

  return (
    <div className="flex h-full min-h-[450px] flex-col items-center justify-center p-6 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        className="text-destructive"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09V21.35z"
          fill="currentColor"
          transform="translate(-1, 0)"
        />
        <path
          d="M12 21.35V5.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
          transform="translate(1, 0)"
          opacity="0.6"
        />
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        className="text-primary/60"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
      <p className="mt-4 text-base font-medium text-primary">
        Enter your names to create a Love Protein
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your unique protein structure awaits
      </p>
    </div>
  )
}
