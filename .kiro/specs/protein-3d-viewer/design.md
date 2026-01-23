# Design Document

## Overview

This design creates a client-only React component that renders 3D protein structures using 3Dmol.js. The component is SSR-safe through dynamic imports and `typeof window` checks, ensuring TanStack Start's server-side rendering doesn't crash. The viewer displays "Love Proteins" with romantic styling (cartoon ribbons, pink/spectrum colors) and provides interactive controls for rotation, screenshots, and couple name annotations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SSR-Safe Loading Flow                         │
│                                                                  │
│  Server Render:                                                  │
│  1. ProteinViewer imported (no window references at module level)│
│  2. Component renders placeholder <div> container                │
│  3. useEffect skipped (no browser APIs called)                   │
│  4. HTML sent to client with empty container                     │
│                                                                  │
│  Client Hydration:                                               │
│  1. React hydrates the placeholder container                     │
│  2. useEffect runs (typeof window !== 'undefined')               │
│  3. Dynamic import: await import('3dmol')                        │
│  4. 3Dmol.createViewer() initializes WebGL context               │
│  5. PDB model added and styled                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Component Structure                           │
│                                                                  │
│  ProteinViewer (main component)                                  │
│  ├── Container div (ref for 3Dmol)                               │
│  ├── ControlPanel                                                │
│  │   ├── SpinToggleButton                                        │
│  │   └── ScreenshotButton                                        │
│  ├── LoadingOverlay (conditional)                                │
│  └── ErrorOverlay (conditional)                                  │
│                                                                  │
│  State:                                                          │
│  - isSpinning: boolean                                           │
│  - viewerReady: boolean                                          │
│  - error: string | null                                          │
│                                                                  │
│  Refs:                                                           │
│  - containerRef: HTMLDivElement                                  │
│  - viewerRef: $3Dmol.GLViewer                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ProteinViewer Component

```typescript
// src/components/ProteinViewer.tsx
import { useEffect, useRef, useState, useCallback } from 'react'

interface ProteinViewerProps {
  pdbData: string | undefined
  isLoading?: boolean
  name1?: string
  name2?: string
  className?: string
}

export function ProteinViewer({
  pdbData,
  isLoading = false,
  name1,
  name2,
  className,
}: ProteinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [viewerReady, setViewerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize 3Dmol viewer (browser-only)
  useEffect(() => {
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

        // Apply romantic cartoon styling
        viewer.setStyle({}, {
          cartoon: {
            color: 'spectrum', // Rainbow gradient along chain
            opacity: 0.95,
          },
        })

        // Add couple name labels if provided
        if (name1 && name2) {
          // Add labels at protein termini
          viewer.addLabel(name1, {
            position: { x: 0, y: 0, z: 20 },
            backgroundColor: 'rgba(255, 182, 193, 0.8)',
            fontColor: '#be185d',
            fontSize: 14,
            borderRadius: 8,
          })
          viewer.addLabel(name2, {
            position: { x: 0, y: 0, z: -20 },
            backgroundColor: 'rgba(255, 182, 193, 0.8)',
            fontColor: '#be185d',
            fontSize: 14,
            borderRadius: 8,
          })
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
  }, [pdbData, name1, name2])

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
    link.download = `love-protein-${name1}-${name2}.png`
    link.href = dataUrl
    link.click()
  }, [name1, name2])

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn('protein-viewer-container', className)}>
        <LoadingSkeleton />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('protein-viewer-container', className)}>
        <ErrorDisplay message={error} />
      </div>
    )
  }

  // Render empty state
  if (!pdbData) {
    return (
      <div className={cn('protein-viewer-container', className)}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={cn('protein-viewer-wrapper', className)}>
      <div
        ref={containerRef}
        className="protein-viewer-canvas"
        style={{ touchAction: 'none' }}
      />
      {viewerReady && (
        <ControlPanel
          isSpinning={isSpinning}
          onToggleSpin={toggleSpin}
          onScreenshot={takeScreenshot}
        />
      )}
    </div>
  )
}
```

### 2. ControlPanel Component

```typescript
// src/components/ProteinViewer/ControlPanel.tsx
interface ControlPanelProps {
  isSpinning: boolean
  onToggleSpin: () => void
  onScreenshot: () => void
}

function ControlPanel({ isSpinning, onToggleSpin, onScreenshot }: ControlPanelProps) {
  return (
    <div className="control-panel">
      <button
        onClick={onToggleSpin}
        className="control-button"
        aria-label={isSpinning ? 'Stop rotation' : 'Start rotation'}
      >
        {isSpinning ? <PauseIcon /> : <PlayIcon />}
        <span>{isSpinning ? 'Stop' : 'Spin'}</span>
      </button>
      <button
        onClick={onScreenshot}
        className="control-button"
        aria-label="Download screenshot"
      >
        <CameraIcon />
        <span>Save</span>
      </button>
    </div>
  )
}
```

### 3. Loading and Error Components

```typescript
// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-pulse" />
      <p>Folding your Love Protein...</p>
    </div>
  )
}

// Error display
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="error-display">
      <HeartBrokenIcon />
      <p>{message}</p>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <div className="empty-state">
      <HeartIcon />
      <p>Enter your names to create a Love Protein</p>
    </div>
  )
}
```

## Data Models

### ProteinViewerProps

```typescript
interface ProteinViewerProps {
  pdbData: string | undefined // Raw PDB text from ESMFold
  isLoading?: boolean // Show loading state
  name1?: string // First person's name (for labels)
  name2?: string // Second person's name (for labels)
  className?: string // Additional CSS classes
}
```

### ViewerState

```typescript
interface ViewerState {
  isSpinning: boolean // Auto-rotation enabled
  viewerReady: boolean // 3Dmol initialized successfully
  error: string | null // Initialization error message
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: SSR-Safe Module Import

_For any_ import of the ProteinViewer module in a Node.js environment (where `window` is undefined), the import SHALL complete without throwing errors related to `window`, `document`, or WebGL.

**Validates: Requirements 1.1, 1.4**

### Property 2: PDB Model Management

_For any_ sequence of PDB data changes (including initial load and updates), the viewer SHALL clear any existing model before adding the new one, ensuring only one model is displayed at a time.

**Validates: Requirements 2.1, 2.5**

### Property 3: Spin Toggle State Consistency

_For any_ number of spin toggle clicks, the spin state SHALL alternate between true and false, and the viewer's spin() method SHALL be called with the corresponding boolean value.

**Validates: Requirements 3.3, 3.5**

### Property 4: Name Label Creation

_For any_ pair of non-empty name strings provided to the component, the viewer SHALL create exactly two labels containing those names.

**Validates: Requirements 4.1**

### Property 5: Loading and Error State Rendering

_For any_ combination of `isLoading`, `error`, and `pdbData` props, the component SHALL render exactly one of: loading skeleton (when isLoading=true), error message (when error is set), empty state (when pdbData is undefined), or the 3D viewer (when pdbData is valid).

**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### Initialization Errors

| Error Type           | Detection                    | User Message                                                    |
| -------------------- | ---------------------------- | --------------------------------------------------------------- |
| WebGL not supported  | 3Dmol throws on createViewer | "Unable to initialize 3D viewer. WebGL may not be supported."   |
| Invalid PDB data     | 3Dmol throws on addModel     | "Unable to display protein. The structure data may be invalid." |
| Dynamic import fails | import('3dmol') rejects      | "Unable to load 3D viewer library."                             |

### Runtime Errors

| Error Type                | Detection                    | Handling            |
| ------------------------- | ---------------------------- | ------------------- |
| Spin on null viewer       | viewerRef.current is null    | Early return, no-op |
| Screenshot on null viewer | viewerRef.current is null    | Early return, no-op |
| Container unmounted       | containerRef.current is null | Skip initialization |

## Testing Strategy

### Unit Tests

- **SSR Safety**: Import module in Node.js environment, verify no errors
- **State Rendering**: Test that correct UI renders for each state combination
- **Control Callbacks**: Test that toggleSpin and takeScreenshot call viewer methods

### Property-Based Tests

Using `fast-check` for property-based testing:

1. **SSR-Safe Import**: Verify module imports without window-related errors
2. **PDB Model Management**: Generate sequences of PDB updates, verify single model
3. **Spin Toggle**: Generate random click sequences, verify state alternates correctly
4. **Name Labels**: Generate random name pairs, verify two labels created
5. **State Rendering**: Generate all prop combinations, verify exactly one state renders

### Integration Tests

- **Full Render Flow**: Test component with real PDB data in browser environment
- **User Interactions**: Test spin toggle and screenshot buttons

### Test Configuration

```typescript
// Property tests should run minimum 100 iterations
// Tag format: Feature: protein-3d-viewer, Property N: <property_text>
```
