# Design Document: Fold Page Hero Layout

## Overview

This design reorganizes the fold page (`/fold/$names`) to make the 3D protein viewer the visual hero of the experience. The current layout places the protein viewer below the names card and strategy selector, burying the "wow moment." The new layout elevates the protein viewer to hero status with a larger viewport and prominent positioning.

## Architecture

The fold page will follow a vertical stack layout with clear visual hierarchy:

```
┌─────────────────────────────────────┐
│           Navigation                │
├─────────────────────────────────────┤
│     Compact Names Header            │
│   [Name1] ❤️ [Name2]                │
│      [amino acid sequence]          │
├─────────────────────────────────────┤
│                                     │
│                                     │
│      🧬 PROTEIN VIEWER (HERO)       │
│         (500px+ height)             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│      Strategy Selector              │
├─────────────────────────────────────┤
│           Footer                    │
└─────────────────────────────────────┘
```

## Components and Interfaces

### Modified Components

#### 1. FoldRoute Component (`src/routes/fold.$names.tsx`)

The main route component will be restructured to reorder elements:

```typescript
// New layout order:
// 1. Navigation (unchanged)
// 2. Compact Names Header (new compact design)
// 3. Protein Viewer Hero Section (enlarged, prominent)
// 4. Strategy Selector (moved below)
// 5. Footer (unchanged)
```

#### 2. ProteinViewer Component (`src/components/ProteinViewer.tsx`)

Update the container styles to support larger hero sizing:

```typescript
// Updated container styles
const containerStyles = cn(
  'relative overflow-hidden',
  'bg-linear-to-br from-pink-50/80 via-rose-50/60 to-purple-50/80',
  'rounded-2xl shadow-lg shadow-pink-200/50',
  'border border-pink-100/50',
  // NEW: Larger hero sizing
  'w-full min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px]',
  className
)
```

### Layout Changes

#### Compact Names Header

Replace the current Names Card with a more compact header:

```tsx
<div className="text-center py-4">
  <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
    <span className="capitalize">{name1}</span>
    <span className="mx-2 text-pink-500">❤️</span>
    <span className="capitalize">{name2}</span>
  </h1>
  {sequence && (
    <Badge variant="secondary" className="mt-2 font-mono text-xs">
      {sequence}
    </Badge>
  )}
</div>
```

#### Hero Protein Viewer Section

The protein viewer becomes the dominant element:

```tsx
<Card className="border-pink-200/50 bg-white/80 backdrop-blur-sm">
  <CardContent className="p-4 md:p-6">
    <ProteinViewer
      pdbData={data?.pdb}
      isLoading={isPending || isLoading}
      name1={name1}
      name2={name2}
      className="min-h-[400px] sm:min-h-[450px] md:min-h-[500px]"
    />
  </CardContent>
</Card>
```

## Data Models

No changes to data models required. This is a purely presentational change.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, most acceptance criteria are specific layout examples rather than universal properties. The testable criteria are primarily DOM structure and CSS verification tests.

### Property 1: Layout Order Invariant

*For any* fold page render with valid names, the DOM elements SHALL appear in this order: Names Header → Protein Viewer → Strategy Selector.

**Validates: Requirements 1.4, 2.2, 3.1**

### Property 2: Responsive Height Constraints

*For any* viewport width, the Protein Viewer container SHALL have a minimum height of at least 400px.

**Validates: Requirements 1.2, 1.3**

## Error Handling

No changes to error handling. The existing error states in the fold page remain unchanged:
- Sequence generation errors display an error card
- API errors display a retry option
- WebGL errors in ProteinViewer display a helpful message

## Testing Strategy

### Unit Tests

Since this is primarily a layout change, testing focuses on:

1. **Component Render Tests**: Verify the fold page renders all required elements
2. **DOM Order Tests**: Verify elements appear in the correct order
3. **CSS Class Tests**: Verify correct sizing classes are applied

### Property-Based Tests

Property-based testing is limited for this feature since the requirements are primarily layout-specific examples. However, we can test:

1. **Layout Order Property**: For any valid name pair, verify DOM order is consistent
2. **Height Constraint Property**: For any render, verify minimum height classes are present

### Visual Regression Tests (Recommended)

For layout changes, visual regression testing with tools like Playwright or Chromatic would provide the most value, though this is outside the scope of the current implementation.
