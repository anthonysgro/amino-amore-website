# Implementation Plan: Protein 3D Viewer

## Overview

Create a client-only React component that renders 3D protein structures using 3Dmol.js. The component is SSR-safe through dynamic imports, displays "Love Proteins" with romantic styling, and provides interactive controls for rotation and screenshots.

## Tasks

- [x] 1. Install 3Dmol.js dependency
  - Install `3dmol` package
  - _Requirements: 2.1_

- [x] 2. Create ProteinViewer component structure
  - [x] 2.1 Create base ProteinViewer component with SSR-safe loading
    - Create `src/components/ProteinViewer.tsx`
    - Add containerRef for 3Dmol viewer
    - Add viewerRef to store 3Dmol instance
    - Implement useEffect with `typeof window === 'undefined'` check
    - Use dynamic `import('3dmol')` inside useEffect
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 2.2 Write property test for SSR-safe import
    - **Property 1: SSR-Safe Module Import**
    - **Validates: Requirements 1.1, 1.4**

- [x] 3. Implement PDB rendering logic
  - [x] 3.1 Add PDB model loading and styling
    - Call `viewer.addModel(pdbData, 'pdb')` with PDB data
    - Apply cartoon style with spectrum coloring
    - Call `viewer.zoomTo()` and `viewer.render()`
    - Handle cleanup when pdbData changes (clear previous model)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Write property test for PDB model management
    - **Property 2: PDB Model Management**
    - **Validates: Requirements 2.1, 2.5**

- [ ] 4. Checkpoint - Verify basic 3D rendering
  - Ensure component renders PDB data without SSR errors
  - Verify cartoon styling is applied

- [x] 5. Add interactive controls
  - [x] 5.1 Implement spin toggle functionality
    - Add `isSpinning` state
    - Create `toggleSpin` callback that calls `viewer.spin()`
    - _Requirements: 3.3, 3.5_
  - [x] 5.2 Implement screenshot functionality
    - Create `takeScreenshot` callback that calls `viewer.pngURI()`
    - Trigger download with couple names in filename
    - _Requirements: 3.4_
  - [x] 5.3 Create ControlPanel component
    - Create spin toggle button with play/pause icons
    - Create screenshot button with camera icon
    - Style with romantic pink theme
    - _Requirements: 3.3, 3.4, 6.3_
  - [ ]* 5.4 Write property test for spin toggle
    - **Property 3: Spin Toggle State Consistency**
    - **Validates: Requirements 3.3, 3.5**

- [x] 6. Add couple name annotations
  - [x] 6.1 Implement 3D label creation for names
    - Add labels using `viewer.addLabel()` when names provided
    - Position labels near protein termini
    - Style with pink background and romantic colors
    - _Requirements: 4.1, 4.2_
  - [ ]* 6.2 Write property test for name labels
    - **Property 4: Name Label Creation**
    - **Validates: Requirements 4.1**

- [x] 7. Implement loading and error states
  - [x] 7.1 Create LoadingSkeleton component
    - Show animated skeleton while loading
    - Display "Folding your Love Protein..." message
    - _Requirements: 5.1_
  - [x] 7.2 Create ErrorDisplay component
    - Show error message with broken heart icon
    - Handle WebGL not supported case
    - _Requirements: 5.2, 5.3_
  - [x] 7.3 Create EmptyState component
    - Show prompt to enter names
    - _Requirements: 5.2_
  - [x] 7.4 Add conditional rendering logic
    - Render LoadingSkeleton when isLoading=true
    - Render ErrorDisplay when error is set
    - Render EmptyState when pdbData is undefined
    - Render viewer when pdbData is valid
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 7.5 Write property test for state rendering
    - **Property 5: Loading and Error State Rendering**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 8. Apply romantic styling
  - [x] 8.1 Style ProteinViewer container
    - Add transparent/gradient background
    - Add rounded corners and shadow
    - Make responsive for mobile
    - _Requirements: 6.1, 6.2, 6.4_
  - [x] 8.2 Style control buttons
    - Apply soft pink colors
    - Add rounded button styling
    - _Requirements: 6.3_

- [x] 9. Integrate with fold route
  - [x] 9.1 Add ProteinViewer to fold.$names.tsx route
    - Import ProteinViewer component
    - Pass pdbData from useFoldProtein hook
    - Pass name1 and name2 from route params
    - Pass isLoading state
    - _Requirements: 2.1, 4.1, 5.1_

- [ ] 10. Final checkpoint - Full integration verification
  - Verify SSR works without errors
  - Test spin and screenshot controls
  - Verify name labels display correctly
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The component uses dynamic import to avoid SSR crashes
- 3Dmol.js handles mouse/touch interactions automatically
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
