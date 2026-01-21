# Implementation Plan: Unique Protein Structures

## Overview

Enhance the FoldedHearts protein folding system with three linker strategies (Flexible Bond, Structural Anchor, True Love Bond) and pLDDT-based confidence coloring to make each Love Protein visually unique.

## Tasks

- [-] 1. Update Fold Logic with Linker Strategies
  - [x] 1.1 Add LinkerStrategy type and configuration constants
    - Define `LinkerStrategy` type: 'flexible' | 'anchor' | 'cysteine'
    - Add `LINKER_CONFIGS` with motifs and display names
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Refactor createLoveSequence to accept strategy option
    - Add optional `strategy` parameter with 'anchor' as default
    - Return structured result with sequence metadata
    - Implement flexible strategy (GGSGGS motif)
    - Implement anchor strategy (WPHWP motif)
    - Implement cysteine strategy (C + Name1 + Linker + Name2 + C)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2_

  - [ ]* 1.3 Write property test for linker strategy correctness
    - **Property 1: Linker Strategy Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 1.4 Write property test for cysteine bridge structure
    - **Property 2: Cysteine Bridge Structure**
    - **Validates: Requirements 1.4, 2.2, 2.3**

  - [ ]* 1.5 Write property test for valid amino acid output
    - **Property 3: Valid Amino Acid Output**
    - **Validates: Requirements 1.6**

  - [ ]* 1.6 Write property test for input sanitization
    - **Property 4: Input Sanitization**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 1.7 Write property test for sequence length bounds
    - **Property 5: Sequence Length Bounds**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [ ] 2. Checkpoint - Verify fold logic
  - Ensure all property tests pass
  - Ask the user if questions arise

- [x] 3. Add pLDDT Coloring to Protein Viewer
  - [x] 3.1 Add ColorMode type and pLDDT color scheme constants
    - Define `ColorMode` type: 'spectrum' | 'plddt'
    - Add `PLDDT_COLOR_SCHEME` with romantic gradient colors
    - _Requirements: 3.1, 3.4_

  - [x] 3.2 Update ProteinViewer props to accept colorMode
    - Add `colorMode` prop with 'spectrum' default
    - Add `onColorModeChange` callback prop
    - _Requirements: 3.1, 3.5_

  - [x] 3.3 Implement pLDDT coloring in 3Dmol viewer
    - Add b-factor based coloring when colorMode is 'plddt'
    - Use romantic color gradient (pink → rose → purple)
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 3.4 Add color mode toggle button to ControlPanel
    - Add toggle button with appropriate icon
    - Wire up state management for color mode
    - _Requirements: 3.5_

- [x] 4. Add Strategy Selector UI
  - [x] 4.1 Create StrategySelector component
    - Display three strategy options as cards/buttons
    - Show display name and description for each
    - Highlight selected strategy
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 4.2 Integrate StrategySelector into fold route
    - Add strategy state management
    - Pass selected strategy to fold logic
    - Update URL or state when strategy changes
    - _Requirements: 5.3_

- [ ] 5. Final Checkpoint - End-to-end verification
  - Ensure all tests pass
  - Verify each strategy produces different visual results
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use fast-check library with minimum 100 iterations
- The anchor strategy (WPHWP) is the default for most interesting shapes
- pLDDT coloring requires PDB data with b-factor values from ESMFold

